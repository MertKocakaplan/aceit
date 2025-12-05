const prisma = require('../../config/database');
const logger = require('../../utils/logger');
const studyPlanAnalysisService = require('../studyPlanAnalysis.service');
const openaiService = require('./openai.service');

/**
 * AI ile çalışma planı oluştur
 * @param {string} userId
 * @param {Object} preferences - Kullanıcı tercihleri
 */
async function generateStudyPlan(userId, preferences) {
  try {
    const {
      startDate,
      endDate,
      dailyStudyHours = 5,
      preferredStartTime = '09:00',
      preferredEndTime = '22:00',
      breakDuration = 15,
      focusOnWeakTopics = true,
      includeReviewSessions = true,
      prioritySubjects = []
    } = preferences;

    logger.info('Starting AI study plan generation', { userId });

    // 1. Kullanıcı verilerini topla
    const userData = await studyPlanAnalysisService.analyzeUserPerformance(userId);

    // 2. Zaman hesaplamaları
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = calculateDays(start, end);

    if (totalDays <= 0) {
      throw new Error('Geçersiz tarih aralığı');
    }

    const dailyMinutes = dailyStudyHours * 60;
    const breaksPerDay = Math.floor(dailyStudyHours / 2); // Her 2 saatte bir mola
    const breakMinutesPerDay = breaksPerDay * breakDuration;
    const netStudyMinutesPerDay = dailyMinutes - breakMinutesPerDay;
    const totalNetStudyMinutes = totalDays * netStudyMinutesPerDay;

    logger.info('Time calculations', {
      totalDays,
      dailyMinutes,
      netStudyMinutesPerDay,
      totalNetStudyMinutes
    });

    // 3. Konu dağılımı (Topic Allocation)
    const topicAllocation = allocateTimeToTopics(
      userData.prioritizedTopics,
      totalNetStudyMinutes,
      focusOnWeakTopics,
      prioritySubjects
    );

    logger.info('Topic allocation completed', {
      topicsCount: topicAllocation.length
    });

    // 4. Günlük program oluştur
    const dailySchedule = new Map();

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);

      const daySlots = generateDaySlots(
        currentDate,
        topicAllocation,
        {
          preferredStartTime,
          preferredEndTime,
          breakDuration,
          netStudyMinutes: netStudyMinutesPerDay,
          includeReviewSessions
        },
        userData,
        i // Day index için
      );

      dailySchedule.set(currentDate.toISOString().split('T')[0], daySlots);
    }

    logger.info('Daily schedule generated', {
      days: dailySchedule.size
    });

    // 5. AI ile plan açıklaması oluştur
    const aiExplanation = await generateAIExplanation(
      userData,
      dailySchedule,
      totalDays,
      netStudyMinutesPerDay
    );

    logger.info('AI explanation generated');

    // 6. Database'e kaydet (Transaction)
    const plan = await saveToDatabase(
      userId,
      dailySchedule,
      aiExplanation,
      start,
      end,
      totalDays
    );

    logger.info('Study plan saved to database', { planId: plan.id });

    return plan;
  } catch (error) {
    logger.error(`generateStudyPlan error: ${error.message}`);
    throw error;
  }
}

/**
 * Günler arası fark hesapla
 */
function calculateDays(startDate, endDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((endDate - startDate) / oneDay) + 1;
}

/**
 * Konulara zaman ayır
 * DERS ÇEŞİTLİLİĞİ GARANTİLİ - Her dersten en az birkaç konu dahil edilir
 */
function allocateTimeToTopics(prioritizedTopics, totalMinutes, focusOnWeakTopics, prioritySubjects) {
  if (!prioritizedTopics || prioritizedTopics.length === 0) {
    throw new Error('Çalışılacak konu bulunamadı');
  }

  // Priority subjects varsa filtrele
  let topics = prioritizedTopics;
  if (prioritySubjects && prioritySubjects.length > 0) {
    topics = prioritizedTopics.filter(t =>
      prioritySubjects.includes(t.subjectCode)
    );

    if (topics.length === 0) {
      topics = prioritizedTopics; // Fallback
    }
  }

  // DERS ÇEŞİTLİLİĞİ: Her dersten minimum konu sayısı garantile
  const topicsBySubject = {};
  topics.forEach(topic => {
    const subjectId = topic.subjectId;
    if (!topicsBySubject[subjectId]) {
      topicsBySubject[subjectId] = [];
    }
    topicsBySubject[subjectId].push(topic);
  });

  const subjectIds = Object.keys(topicsBySubject);
  const subjectCount = subjectIds.length;

  // Her dersten kaç konu alınacak (minimum 3, maksimum 8)
  const topicsPerSubject = Math.max(3, Math.min(8, Math.floor(30 / subjectCount)));

  // Dengeli konu seçimi: Her dersten eşit sayıda konu al
  const balancedTopics = [];
  subjectIds.forEach(subjectId => {
    const subjectTopics = topicsBySubject[subjectId];
    // Bu dersten en fazla topicsPerSubject kadar konu al (priority sırasıyla)
    const selectedFromSubject = subjectTopics.slice(0, topicsPerSubject);
    balancedTopics.push(...selectedFromSubject);
  });

  // Priority score'a göre sırala
  balancedTopics.sort((a, b) => b.priorityScore - a.priorityScore);

  // Maksimum 30 konu
  topics = balancedTopics.slice(0, 30);

  // Toplam priority score hesapla
  const totalPriorityScore = topics.reduce((sum, t) => sum + t.priorityScore, 0);

  // Her konuya dakika ayır
  const allocation = topics.map((topic) => {
    let allocatedMinutes = (topic.priorityScore / totalPriorityScore) * totalMinutes;

    // Zayıf konulara %20 daha fazla zaman (eğer focus on weak topics aktifse)
    if (focusOnWeakTopics && topic.stats.successRate < 0.6 && topic.stats.successRate > 0) {
      allocatedMinutes *= 1.2;
    }

    // Minimum 30 dakika, maximum 600 dakika (10 saat)
    allocatedMinutes = Math.max(30, Math.min(600, Math.round(allocatedMinutes)));

    // Kaç session yapılacağını hesapla (her session ~60-90 dakika)
    const sessions = Math.ceil(allocatedMinutes / 75);

    return {
      topicId: topic.topicId,
      topicName: topic.topicName,
      topicCode: topic.topicCode,
      subjectId: topic.subjectId,
      subjectName: topic.subjectName,
      subjectCode: topic.subjectCode,
      subjectColor: topic.subjectColor,
      allocatedMinutes,
      sessions,
      priorityScore: topic.priorityScore,
      reasons: topic.reasons,
      stats: topic.stats
    };
  });

  // Toplam allocated minutes'ı normalize et
  const totalAllocated = allocation.reduce((sum, a) => sum + a.allocatedMinutes, 0);
  if (totalAllocated > totalMinutes) {
    const ratio = totalMinutes / totalAllocated;
    allocation.forEach(a => {
      a.allocatedMinutes = Math.round(a.allocatedMinutes * ratio);
      a.sessions = Math.ceil(a.allocatedMinutes / 75);
    });
  }

  return allocation;
}

/**
 * Günlük slot'ları oluştur
 */
function generateDaySlots(currentDate, topicAllocation, slotPreferences, userData, dayIndex) {
  const {
    preferredStartTime,
    preferredEndTime,
    breakDuration,
    netStudyMinutes,
    includeReviewSessions
  } = slotPreferences;

  const daySlots = [];
  const dayOfWeek = currentDate.getDay(); // 0 = Sunday

  // Hafta sonu hafif program (opsiyonel)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const targetMinutes = isWeekend ? Math.round(netStudyMinutes * 0.7) : netStudyMinutes;

  let currentTime = parseTime(preferredStartTime);
  const endTime = parseTime(preferredEndTime);
  let accumulatedMinutes = 0;

  // Round-robin şeklinde konular arasında dön
  const topicsToStudy = selectTopicsForDay(topicAllocation, dayIndex, targetMinutes);

  for (let i = 0; i < topicsToStudy.length && currentTime < endTime; i++) {
    const topic = topicsToStudy[i];

    // Slot duration: 60-120 dakika arası
    let slotDuration = Math.min(
      Math.max(60, topic.sessionMinutes || 75),
      120,
      endTime - currentTime
    );

    // Sabah/öğleden sonra/akşam zamanına göre slotType belirle
    const timeOfDay = getTimeOfDay(currentTime);
    const slotType = determineSlotType(
      timeOfDay,
      i,
      topicsToStudy.length,
      includeReviewSessions
    );

    // AI reason oluştur
    const aiReason = generateAIReason(topic, timeOfDay, slotType, userData);

    // Slot ekle
    daySlots.push({
      subjectId: topic.subjectId,
      topicId: topic.topicId,
      startTime: formatTime(currentTime),
      endTime: formatTime(currentTime + slotDuration),
      duration: slotDuration,
      priority: calculatePriority(topic.priorityScore),
      slotType,
      aiReason
    });

    currentTime += slotDuration;
    accumulatedMinutes += slotDuration;

    // Mola ekle (eğer daha çalışılacak zaman varsa)
    if (i < topicsToStudy.length - 1 && currentTime + breakDuration < endTime) {
      daySlots.push({
        subjectId: null,
        topicId: null,
        startTime: formatTime(currentTime),
        endTime: formatTime(currentTime + breakDuration),
        duration: breakDuration,
        priority: 3,
        slotType: 'break',
        aiReason: 'Dinlenme ve enerji toplama zamanı'
      });

      currentTime += breakDuration;
    }

    // Target minutes'a ulaştıysak dur
    if (accumulatedMinutes >= targetMinutes) {
      break;
    }
  }

  return daySlots;
}

/**
 * O gün için hangi konuların çalışılacağını seç
 * DERS ÇEŞİTLİLİĞİ GARANTİLİ - Her gün farklı derslerden konular seçilir
 */
function selectTopicsForDay(topicAllocation, dayIndex, targetMinutes) {
  // Her konu için session sayısını hesapla
  const topicsWithSessionsRemaining = topicAllocation
    .map(topic => ({
      ...topic,
      sessionMinutes: Math.round(topic.allocatedMinutes / topic.sessions)
    }))
    .filter(topic => topic.sessions > 0);

  // Konuları derse göre grupla
  const topicsBySubject = {};
  topicsWithSessionsRemaining.forEach(topic => {
    const subjectId = topic.subjectId;
    if (!topicsBySubject[subjectId]) {
      topicsBySubject[subjectId] = {
        subjectName: topic.subjectName,
        subjectColor: topic.subjectColor,
        topics: []
      };
    }
    topicsBySubject[subjectId].topics.push(topic);
  });

  const subjectIds = Object.keys(topicsBySubject);
  const subjectCount = subjectIds.length;

  if (subjectCount === 0) {
    return [];
  }

  // Ders round-robin: Her gün farklı ders sırasıyla başla
  const selectedTopics = [];
  let accumulatedMinutes = 0;
  const maxSlots = 6;

  // Her dersten kaç konu seçildi
  const selectedCountBySubject = {};
  subjectIds.forEach(id => selectedCountBySubject[id] = 0);

  // Ders offset'i: Her gün farklı dersten başla
  let subjectOffset = dayIndex % subjectCount;

  while (accumulatedMinutes < targetMinutes && selectedTopics.length < maxSlots) {
    // Şu anki ders
    const currentSubjectId = subjectIds[subjectOffset % subjectCount];
    const subjectData = topicsBySubject[currentSubjectId];

    // Bu dersten hangi konu seçilecek (henüz seçilmemiş olanlardan)
    const topicIndex = selectedCountBySubject[currentSubjectId];

    if (topicIndex < subjectData.topics.length) {
      const topic = subjectData.topics[topicIndex];
      selectedTopics.push(topic);
      accumulatedMinutes += topic.sessionMinutes;
      selectedCountBySubject[currentSubjectId]++;
    }

    // Sonraki derse geç
    subjectOffset++;

    // Tüm derslerden en az bir konu seçildiyse, tekrar baştan dön
    // Bu döngüden çıkmak için tüm konular bitmiş olmalı
    const allSubjectsExhausted = subjectIds.every(
      id => selectedCountBySubject[id] >= topicsBySubject[id].topics.length
    );

    if (allSubjectsExhausted) {
      break;
    }
  }

  return selectedTopics;
}

/**
 * Günün zamanını belirle
 */
function getTimeOfDay(minutes) {
  if (minutes < 12 * 60) return 'morning';
  if (minutes < 18 * 60) return 'afternoon';
  return 'evening';
}

/**
 * Slot type belirle
 */
function determineSlotType(timeOfDay, index, totalSlots, includeReviewSessions) {
  // Akşam slot'larının bir kısmı review olsun
  if (includeReviewSessions && timeOfDay === 'evening' && index >= totalSlots - 2) {
    return 'review';
  }

  return 'study';
}

/**
 * AI reason oluştur
 */
function generateAIReason(topic, timeOfDay, slotType, userData) {
  const reasons = [];

  // Zayıf konu
  if (topic.stats && topic.stats.successRate > 0 && topic.stats.successRate < 0.6) {
    reasons.push(`Zayıf konu: %${Math.round(topic.stats.successRate * 100)} başarı oranı`);
  }

  // Sınav ağırlığı
  if (topic.stats && topic.stats.examQuestionCount > 0) {
    reasons.push(`Sınavda ${topic.stats.examQuestionCount} soru çıkan önemli konu`);
  }

  // Henüz çalışılmamış
  if (topic.stats && topic.stats.totalSessions === 0) {
    reasons.push('Henüz çalışılmamış konu');
  }

  // Zaman dilimi
  if (timeOfDay === 'morning') {
    reasons.push('Sabah saatleri için verimli çalışma zamanı');
  } else if (timeOfDay === 'evening' && slotType === 'review') {
    reasons.push('Akşam tekrar seansı: Öğrenilen bilgileri pekiştir');
  }

  // Ekstra reason'lar
  if (topic.reasons && topic.reasons.length > 0) {
    reasons.push(...topic.reasons.slice(0, 2));
  }

  return reasons.slice(0, 3).join('. ');
}

/**
 * Priority hesapla (1-5 arası)
 */
function calculatePriority(priorityScore) {
  if (priorityScore >= 0.8) return 5;
  if (priorityScore >= 0.6) return 4;
  if (priorityScore >= 0.4) return 3;
  if (priorityScore >= 0.2) return 2;
  return 1;
}

/**
 * Time helper functions
 */
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * AI ile plan açıklaması oluştur
 */
async function generateAIExplanation(userData, dailySchedule, totalDays, netStudyMinutesPerDay) {
  try {
    const totalSlots = Array.from(dailySchedule.values())
      .reduce((sum, slots) => sum + slots.filter(s => s.slotType !== 'break').length, 0);

    const totalStudyHours = (totalDays * netStudyMinutesPerDay) / 60;

    const systemPrompt = `Sen Türkiye'deki LGS/TYT/AYT sınavlarına hazırlanan öğrenciler için uzman bir eğitim danışmanısın. Pedagoji, öğrenme psikolojisi ve sınav stratejileri konularında derinlemesine bilgi sahibisin.

GÖREV: Oluşturulan çalışma planını detaylı şekilde açıkla ve haftalık hedefler belirle.

PLANLAMA STRATEJİLERİ (DİKKAT ET):
1. **Circadian Rhythm (Biyolojik Saat)**: Sabah saatleri (09:00-12:00) zor konular için en ideal. Öğleden sonra (14:00-18:00) orta zorlukta konular. Akşam (19:00-22:00) tekrar ve pekiştirme.

2. **Spaced Repetition**: Bir konu öğrenildikten sonra 1 gün, 3 gün, 7 gün, 15 gün sonra tekrar edilmeli. Planın bunu göz önünde bulundurduğunu açıkla.

3. **Interleaving (Karışık Çalışma)**: Aynı dersin konuları art arda değil, farklı derslerle karışık çalışılmalı. Bu, uzun vadeli öğrenmeyi artırır.

4. **Pomodoro & Molalar**: Her 50-90 dakikada bir 10-15 dakika mola şart. Molalarda ekrandan uzak dur, su iç, hafif egzersiz yap.

5. **Active Recall**: Pasif okuma yerine aktif hatırlama (soru çözme, self-test) daha etkili.

6. **Zayıf Konulara Odaklanma**: Zayıf konulara %60-70 zaman ayır, güçlü konulara %30-40. Ama güçlü konuları ihmal etme.

7. **Sınav Ağırlıkları**: Hangi konulardan kaç soru çıkıyorsa, ona göre önceliklendirme yap.

AÇIKLAMA YAPISI:
1. **İlk Paragraf**: Planın genel stratejisini açıkla (zayıf konular, sınav ağırlıkları, zaman dağılımı)
2. **İkinci Paragraf**: Günlük çalışma düzenini ve mola stratejisini açıkla
3. **Üçüncü Paragraf**: Uzun vadeli başarı için ipuçları ve motivasyon

HAFTALIK HEDEFLER:
- Her hafta için spesifik, ölçülebilir hedefler belirle
- İlk haftalar temel konular, son haftalar deneme ve pekiştirme
- Öğrencinin mevcut seviyesine göre gerçekçi hedefler koy

KURALLAR:
1. Planın mantığını bilimsel gerekçelerle açıkla
2. Teşvik edici ve motive edici ol ama gerçekçi kal
3. Öğrencinin zayıf konularını ve geçmiş performansını dikkate al
4. SADECE JSON formatında yanıt ver

JSON FORMAT:
{
  "explanation": "Plan açıklaması (3 paragraf, her paragraf 3-4 cümle)",
  "weeklyGoals": [
    { "week": 1, "goal": "Hafta 1 hedefi (spesifik ve ölçülebilir, 2 cümle)" },
    { "week": 2, "goal": "Hafta 2 hedefi (2 cümle)" }
  ]
}

ÖNEMLİ: Sadece JSON formatında yanıt ver, başka hiçbir şey ekleme!`;

    // Konu dağılımını hesapla
    const subjectDistribution = {};
    Array.from(dailySchedule.values()).forEach(slots => {
      slots.filter(s => s.slotType !== 'break' && s.subjectName).forEach(slot => {
        const subjectName = slot.subjectName;
        if (!subjectDistribution[subjectName]) {
          subjectDistribution[subjectName] = { slots: 0, hours: 0 };
        }
        subjectDistribution[subjectName].slots++;
        subjectDistribution[subjectName].hours += slot.duration / 60;
      });
    });

    const subjectDistText = Object.entries(subjectDistribution)
      .sort((a, b) => b[1].hours - a[1].hours)
      .slice(0, 5)
      .map(([subject, data]) => `- ${subject}: ${data.slots} slot, ${data.hours.toFixed(1)} saat`)
      .join('\n');

    // Sınav tarihi bilgisi
    const examDate = userData.examInfo?.examDate;
    const daysUntilExam = userData.examInfo?.daysRemaining;
    const examUrgency = userData.examInfo?.urgencyLevel || 'unknown';

    const userPrompt = `ÖĞRENCİ PROFİLİ:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Sınav Türü: ${userData.user.examType}
Sınav Tarihi: ${examDate ? new Date(examDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
Sınava Kalan: ${daysUntilExam !== null ? `${daysUntilExam} gün` : 'Belirtilmemiş'} ${examUrgency === 'critical' ? '(ÇOK YAKIN!)' : examUrgency === 'urgent' ? '(YAKIN!)' : ''}

BU ÇALIŞMA PLANI:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Plan Süresi: ${totalDays} gün
Günlük Çalışma: ${(totalStudyHours / totalDays).toFixed(1)} saat

GEÇMİŞ PERFORMANS:
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Toplam Çalışma: ${userData.summary ? userData.summary.totalStudyHours : 0} saat
• Başarı Oranı: ${userData.summary ? Math.round(userData.summary.averageSuccessRate * 100) : 0}%
• Zayıf Ders Sayısı: ${userData.summary ? userData.summary.weakSubjectCount : 0}
• Güçlü Ders Sayısı: ${userData.summary ? userData.summary.strongSubjectCount || 0 : 0}

ZAYIF KONULAR (İlk 5):
━━━━━━━━━━━━━━━━━━━━━━━━━━
${userData.weakTopics && userData.weakTopics.length > 0
      ? userData.weakTopics.slice(0, 5).map(t => `• ${t.topicName}: ${t.weaknessReason}`).join('\n')
      : '• Henüz veri yok (yeni öğrenci)'}

OLUŞTURULAN PLAN DETAYLARİ:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Plan Süresi: ${totalDays} gün (${Math.ceil(totalDays / 7)} hafta)
Toplam Çalışma Slot'u: ${totalSlots}
Toplam Net Çalışma: ${totalStudyHours.toFixed(1)} saat
Günlük Ortalama: ${(totalStudyHours / totalDays).toFixed(1)} saat
${daysUntilExam !== null ? `Sınava Kalan vs Plan: ${daysUntilExam > totalDays ? `Plan sınavdan ${daysUntilExam - totalDays} gün önce bitiyor (ara dönem planı)` : daysUntilExam === totalDays ? 'Plan tam sınav gününe kadar (final push!)' : `Plan sınav tarihini ${totalDays - daysUntilExam} gün aşıyor (dikkat!)`}` : ''}

DERS DAĞILIMI (En Çok Zaman Ayrılan):
━━━━━━━━━━━━━━━━━━━━━━━━━━
${subjectDistText || '• Veri yok'}

PLAN STRATEJİSİ:
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Sabah Saatleri: Zor ve yeni konular (biyolojik saat en aktif)
• Öğleden Sonra: Orta zorlukta konular ve problem çözme
• Akşam: Tekrar, pekiştirme ve günün özeti
• Molalar: Her 60-90 dakikada bir 15 dakika
• Çeşitlilik: Farklı dersler karışık (interleaving)
• Spaced Repetition: Aynı konular belirli aralıklarla tekrar

ŞİMDİ GÖREV: Yukarıdaki tüm bilgileri kullanarak bu planı açıkla. Neden bu şekilde planlandığını, nasıl çalışması gerektiğini ve her hafta nelere odaklanılacağını detaylı anlat.

JSON formatında yanıt ver!`;

    // GPT-5.1 Responses API - DOĞRU FORMAT
    const input = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: userPrompt
          }
        ]
      }
    ];

    logger.info('Generating study plan explanation with AI');

    const response = await openaiService.createResponse({
      model: 'gpt-5.1',
      input,
      reasoning_effort: 'medium',
      verbosity: 'low',
      max_output_tokens: 2000
    });

    const aiText = response.output_text;
    const tokensUsed = response.usage?.total_tokens || 0;

    // JSON parse
    let cleanedText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    logger.info('AI explanation generated successfully', { tokensUsed });

    return {
      explanation: parsed.explanation || 'Plan açıklaması oluşturulamadı',
      weeklyGoals: JSON.stringify(parsed.weeklyGoals || []),
      tokensUsed
    };
  } catch (error) {
    logger.error(`generateAIExplanation error: ${error.message}`);

    // Fallback
    return {
      explanation: 'Bu plan, senin için özel olarak oluşturulmuş kişiselleştirilmiş bir çalışma programıdır. Zayıf konularına odaklanırken, sınav ağırlıklarını da göz önünde bulundurarak dengeli bir şekilde ilerlemeni sağlar.',
      weeklyGoals: JSON.stringify([{ week: 1, goal: 'Plana uygun şekilde çalış ve kendini geliştir' }]),
      tokensUsed: 0
    };
  }
}

/**
 * Database'e kaydet (Transaction)
 */
async function saveToDatabase(userId, dailySchedule, aiExplanation, startDate, endDate, totalDays) {
  return await prisma.$transaction(async (tx) => {
    // 1. Diğer planları deaktif et
    await tx.studyPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false }
    });

    // 2. Plan oluştur
    const plan = await tx.studyPlan.create({
      data: {
        userId,
        title: `AI Planı (${startDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')})`,
        description: `${totalDays} günlük kişiselleştirilmiş çalışma planı`,
        startDate,
        endDate,
        isActive: true,
        isAIGenerated: true,
        aiExplanation: aiExplanation.explanation,
        weeklyGoals: aiExplanation.weeklyGoals
      }
    });

    // 3. Günleri ve slot'ları oluştur
    for (const [dateStr, slots] of dailySchedule) {
      const date = new Date(dateStr);
      const dailyMinutes = slots
        .filter(s => s.slotType !== 'break')
        .reduce((sum, s) => sum + s.duration, 0);

      const day = await tx.studyPlanDay.create({
        data: {
          planId: plan.id,
          date,
          dailyGoalMinutes: dailyMinutes
        }
      });

      for (const slot of slots) {
        // Break slot'larını kaydetme - sadece çalışma slot'ları
        if (slot.slotType === 'break') continue;

        await tx.studyPlanSlot.create({
          data: {
            dayId: day.id,
            subjectId: slot.subjectId,
            topicId: slot.topicId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: slot.duration,
            priority: slot.priority,
            slotType: slot.slotType,
            aiReason: slot.aiReason
          }
        });
      }
    }

    // 4. Full nested plan'ı döndür
    return await tx.studyPlan.findUnique({
      where: { id: plan.id },
      include: {
        days: {
          include: {
            slots: {
              include: {
                subject: {
                  select: { id: true, name: true, code: true, color: true }
                },
                topic: {
                  select: { id: true, name: true, code: true }
                }
              },
              orderBy: { startTime: 'asc' }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });
  });
}

module.exports = {
  generateStudyPlan
};
