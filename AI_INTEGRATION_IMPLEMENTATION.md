# AceIt - GPT-5.1 Entegrasyon İmplementasyon Planı

> **Model**: Sadece GPT-5.1 kullanılacak (mini/nano YOK)
> **Durum**: Mevcut Altyapı Analizi Tamamlandı
> **Tarih**: 3 Aralık 2025

---

## 🔥 MEVCUT ALTYAPI ANALİZİ - **İNANILMAZ ZENGİN!**

### ✅ Toplanan Veriler (Gerçekten Etkileyici!)

#### 1. **StudySession** - Çalışma Oturumları
```javascript
// HER ÇALIŞMADA KAYDEDILEN:
{
  userId, subjectId, topicId,
  date, duration,
  questionsCorrect,    // Doğru sorular
  questionsWrong,      // Yanlış sorular
  questionsEmpty,      // Boş sorular
  notes                // Notlar
}
```

#### 2. **Spaced Repetition** - SM-2 Algoritması (Bilimsel!)
```javascript
// spacedRepetition.service.js - 326 satır
{
  lastStudiedAt,
  nextReviewAt,        // Otomatik hesaplanan tekrar tarihi
  repetitionLevel,     // 0-5 seviye (mastery)
  easinessFactor,      // 1.3-2.5 (SM-2 algoritması)
  consecutiveCorrect,  // Üst üste doğru sayısı

  // Otomatik tekrar aralıkları:
  // Level 0: 1 gün
  // Level 1: 3 gün
  // Level 2: 7 gün
  // Level 3: 14 gün
  // Level 4-5: 30 gün
}

// FONKSIYONLAR:
- updateTopicProgress(userId, topicId, performanceScore)
- getTopicsDueForReview(userId, limit)
- getUserSpacedRepetitionStats(userId)
- getTopicReviewInfo(userId, topicId)
```

#### 3. **Pomodoro Tracking** - Üretkenlik Analizi
```javascript
// pomodoro.service.js - 233 satır
{
  duration, mode (work/short_break/long_break),
  subjectId, date, isCompleted
}

// İSTATİSTİKLER:
- Saatlik dağılım (en üretken saatler)
- Haftalık trend
- Ortalama günlük pomodoro
- Mode dağılımı
```

#### 4. **Stats Service** - 1230 SATIR! (Veri Madeni)
```javascript
// stats.service.js - 1230 satır
// 14 FARKLI İSTATİSTİK FONKSİYONU:

1. getSummaryStats(userId)
   - Toplam çalışma (saat, gün, oturum)
   - Toplam soru (doğru, yanlış, boş)
   - Başarı oranı
   - En çok çalışılan ders

2. getDailyStats(userId, days=7)
   - Son N günlük günlük detay

3. getWeeklyComparison(userId)
   - Bu hafta vs geçen hafta
   - Değişim yüzdeleri

4. getMonthlyComparison(userId)
   - Bu ay vs geçen ay

5. getSubjectBreakdown(userId)
   - Ders bazlı tam dağılım
   - Her ders için: duration, questions, successRate

6. getStreakData(userId)
   - currentStreak: Üst üste kaç gün çalıştı
   - longestStreak: En uzun çalışma serisi
   - lastStudyDate

7. getRecords(userId)
   - daily.mostQuestions: En çok soru çözülen gün
   - daily.mostStudy: En çok çalışılan gün
   - weekly.mostQuestions: Rekor hafta
   - weekly.mostStudy: Rekor hafta

8. getSuccessRateTrend(userId)
   - Son 4 haftalık başarı trendi
   - trendDirection: 'up' | 'down' | 'stable'

9. getPreparationProgress(userId)
   - totalTopics: Erişilebilir tüm konular
   - studiedTopics: Çalışılmış konular
   - percentage: Tamamlanma yüzdesi

10. getLearningVelocityAnalysis(userId)
    - currentVelocity: Öğrenme hızı (user.learningVelocity)
    - durationIncrease: Son 2 hafta vs önceki 2 hafta
    - efficiencyChange: Verimlilik değişimi

11. getYearlyActivity(userId)
    - 365 günlük aktivite verisi
    - Her gün için: date, duration, dayOfWeek, week
    - Heatmap için HAZIR!

12. getSixMonthTrend(userId)
    - Son 6 aylık aylık özet
    - duration, sessions, successRate

13. getSubjectDetailedAnalysis(userId)
    - Her ders için DETAYLI analiz
    - status: 'insufficient' | 'medium' | 'good'
    - Topic completion rate
    - Net hesaplama (doğru - yanlış/4)

14. getTopicDetailedAnalysis(userId)
    - Her konu için DETAYLI analiz
    - category: 'unstudied' | 'weak' | 'medium' | 'strong'
    - Spaced repetition durumu
    - needsReview, isOverdue, daysOverdue
    - masteryPercentage (0-100)
```

#### 5. **StudyPlanAnalysis Service** - AI İÇİN HAZIRLANDI!
```javascript
// studyPlanAnalysis.service.js - 451 satır
// analyzeUserPerformance(userId) - ALTIN MADEN!

ÇIKTI:
{
  user: {
    id, examType, targetDate, targetScore,
    learningVelocity, dailyStudyGoal, preferences
  },

  subjectAnalysis: {
    [subjectCode]: {
      totalSessions, totalDuration,
      totalQuestions, correctQuestions, wrongQuestions, emptyQuestions,
      successRate, averageSessionDuration
    }
  },

  topicAnalysis: {
    [topicCode]: {
      topicId, topicName, topicCode,
      subjectId, subjectName, subjectCode, subjectColor,
      difficultyLevel,
      totalSessions, totalDuration,
      totalQuestions, correctQuestions, wrongQuestions,
      successRate, lastStudied
    }
  },

  weakTopics: [
    {
      ...topicInfo,
      weaknessReason: "%45 başarı oranı",
      weaknessScore: 0.55  // 1 - successRate
    }
  ],

  dueReviews: [
    {
      topicId, topicName, topicCode,
      subjectName, subjectCode, subjectColor,
      daysOverdue, repetitionLevel
    }
  ],

  examWeights: {
    [topicCode]: {
      questionCount,  // Tarihsel sınavlarda kaç soru çıktı
      weight
    }
  },

  prioritizedTopics: [  // TOP 30, SKORLANMIŞ!
    {
      topicId, topicName, topicCode,
      subjectId, subjectName, subjectCode, subjectColor,
      priorityScore: 0.87,  // 0-1 arası
      recommendedMinutes: 90,
      reasons: [
        "Sınavda 15 soru",
        "%45 başarı oranı - acil tekrar gerekiyor",
        "7 gün gecikmiş tekrar"
      ],
      stats: {
        totalSessions, successRate, lastStudied, examQuestionCount
      }
    }
  ],

  timeAnalysis: {
    hasTargetDate: true,
    targetDate,
    remainingDays,      // Sınava kalan gün
    dailyCapacity,      // Günlük çalışma kapasitesi (saat)
    totalAvailableHours,
    studyStartHour: 9,
    studyEndHour: 22
  },

  summary: {
    totalStudySessions,
    totalStudyHours,
    averageSuccessRate,
    weakSubjectCount,   // <60% başarılı ders sayısı
    dueReviewCount      // Gecikmiş tekrar sayısı
  }
}

// ÖNCELİKLENDİRME ALGORİTMASI:
priorityScore =
  examWeight * 0.4 +           // Sınavda çıkma olasılığı
  userDifficulty * 0.3 +       // Kullanıcının zorlandığı
  spacedRepetition * 0.2 +     // Gecikmiş tekrarlar
  (1 - recentProgress) * 0.1   // Az çalışılan
```

#### 6. **TopicQuestionCount** - Tarihsel Sınav Verileri
```javascript
// Admin panelinden CSV yükleme:
- Her konu için yıllara göre soru sayıları
- examYear bazlı
- CSV toplu yükleme özelliği VAR!

Örnek:
Matematik > Limit > 2024: 12 soru, 2023: 15 soru, 2022: 10 soru
```

#### 7. **User Preferences**
```javascript
{
  pomodoroWork: 25,
  pomodoroBreak: 5,
  pomodoroLongBreak: 15,
  dailyStudyHoursTarget: 4,
  preferredStudyStartHour: 9,
  preferredStudyEndHour: 22,
  theme: 'SYSTEM',
  notifications: true,
  soundEnabled: true
}
```

---

## 🎯 4 AI ÖZELLİĞİ - SADECE GPT-5.1

### Model Kararı
```javascript
// HER YERDE GPT-5.1 KULLANILACAK
const AI_CONFIG = {
  model: 'gpt-5.1',
  pricing: {
    input: 1.25,   // $ per 1M tokens
    output: 10     // $ per 1M tokens
  },
  contextWindow: {
    input: 272000,   // 272K tokens
    output: 128000   // 128K tokens
  }
};

// REASONING EFFORT STRATEJİSİ:
- Soru Çözücü: 'medium' (matematiksel düşünme)
- Çalışma Planı: 'low' (hızlı JSON üretimi)
- Performans Analizi: 'medium' (derinlemesine analiz)
- Günlük Rehberlik: 'minimal' (hızlı mesaj)
```

---

### Özellik 1: AI Soru Çözücü 📸

**Amaç**: Öğrenciler soru gönderir (metin/fotoğraf), AI adım adım çözer.

#### Endpoint
```
POST /api/ai/solve-question
Content-Type: multipart/form-data

Body:
- questionText: String (opsiyonel)
- image: File (opsiyonel, max 20MB)
- subjectId: String (opsiyonel, bağlam için)
- topicId: String (opsiyonel, bağlam için)
```

#### GPT-5.1 Konfigürasyonu
```javascript
{
  model: 'gpt-5.1',
  reasoning_effort: 'medium',    // Matematiksel düşünme
  verbosity: 'medium',            // Detaylı ama aşırı uzun değil
  max_output_tokens: 3000
}
```

#### System Prompt
```javascript
const QUESTION_SOLVER_PROMPT = `Sen Türkiye'deki LGS ve YKS sınavlarına hazırlanan öğrenciler için bir eğitim asistanısın.

GÖREV: Soruları adım adım çöz ve her adımı açıkla.

KURAL 1 - LaTeX Kullanımı:
- Inline formül: $x^2 + 5x + 6$
- Block formül: $$x^2 + 5x + 6 = 0$$
- Kesir: $\\frac{a}{b}$
- Karekök: $\\sqrt{x}$
- Üst: $x^2$, Alt: $x_1$

KURAL 2 - Adım Yapısı:
**Adım 1: [Başlık]**
[Açıklama]
$$[Formül]$$

**Adım 2: [Başlık]**
...

**CEVAP**: Son cevabı vurgula

KURAL 3 - Dil:
- Türkçe yaz
- Anlaşılır ve samimi ol
- "Sen" diye hitap et
- Motive edici ol

ÖRNEK:
Soru: $x^2 - 5x + 6 = 0$ denklemini çözünüz.

**Adım 1: Çarpanlara Ayır**
İki sayı bul ki toplamları -5, çarpımları 6 olsun. Bu sayılar -2 ve -3'tür.
$$(x - 2)(x - 3) = 0$$

**Adım 2: Sıfıra Eşitle**
Her çarpanı ayrı ayrı sıfıra eşitle:
$$x - 2 = 0 \\quad \\text{veya} \\quad x - 3 = 0$$

**Adım 3: Kökleri Bul**
$$x = 2 \\quad \\text{veya} \\quad x = 3$$

**CEVAP**: Denklemin kökleri $x_1 = 2$ ve $x_2 = 3$'tür. ✓
`;
```

#### Veri Akışı
```javascript
// 1. Kullanıcı soru gönderir (metin veya fotoğraf)
// 2. Backend görüntüyü base64'e çevirir
// 3. Opsiyonel: subjectId/topicId varsa bağlam ekle
const contextMessage = subjectId ? `
Bu soru ${subject.name} dersine ait${topicId ? ` (Konu: ${topic.name})` : ''}.
` : '';

// 4. GPT-5.1'e gönder
const response = await openai.responses.create({
  model: 'gpt-5.1',
  input: [
    { role: 'system', content: QUESTION_SOLVER_PROMPT },
    {
      role: 'user',
      content: [
        imageBase64 && {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: imageBase64
          }
        },
        {
          type: 'text',
          text: contextMessage + (questionText || 'Bu soruyu çöz')
        }
      ].filter(Boolean)
    }
  ],
  reasoning_effort: 'medium',
  verbosity: 'medium',
  max_output_tokens: 3000
});

// 5. AIQuestionLog'a kaydet
await prisma.aIQuestionLog.create({
  data: {
    userId,
    questionText: questionText || '',
    questionImage: imageBase64 ? 'stored' : null,
    aiResponse: response.output_text,
    aiModel: 'gpt-5.1',
    tokensUsed: response.usage?.total_tokens
  }
});
```

#### Maliyet (GPT-5.1)
- Metin soru: ~500-1000 input + ~1500-2000 output
  - $1.25/1M * 0.5K + $10/1M * 2K = **$0.02-0.03 / soru**
- Görüntülü: ~1500-2500 input + ~2000-3000 output
  - $1.25/1M * 2.5K + $10/1M * 3K = **$0.03-0.05 / soru**
- **100 soru/ay**: $2-5
- **1000 kullanıcı**: $2,000-5,000/ay

---

### Özellik 2: Kişiselleştirilmiş Çalışma Planı 📅

**Amaç**: `analyzeUserPerformance()` çıktısını kullanarak AI ile otomatik program.

#### Endpoint
```
POST /api/ai/generate-study-plan
Body: {
  days: 7,  // Opsiyonel, default 7 gün
}

Response: {
  success: true,
  data: { id: "plan-uuid", title: "...", ... }
}
```

#### GPT-5.1 Konfigürasyonu
```javascript
{
  model: 'gpt-5.1',
  reasoning_effort: 'low',       // Hızlı plan üretimi
  verbosity: 'low',               // JSON çıktısı
  max_output_tokens: 8000,
  text: {
    format: {
      type: 'json_schema',       // Structured Output!
      name: 'study_plan',
      schema: studyPlanSchema,
      strict: true
    }
  }
}
```

#### Prompt Yapısı
```javascript
const generateStudyPlanPrompt = (analysis, requestedDays = 7) => {
  const {
    user,
    prioritizedTopics,
    weakTopics,
    dueReviews,
    timeAnalysis,
    summary
  } = analysis;

  return `Sen bir eğitim planlama uzmanısın. ${requestedDays} günlük detaylı çalışma planı oluştur.

## KULLANICI PROFİLİ
- Sınav: ${user.examType}
- Hedef Puan: ${user.targetScore || 'Belirtilmemiş'}
- Sınava Kalan: ${timeAnalysis.remainingDays || 'Bilinmiyor'} gün
- Günlük Kapasite: ${timeAnalysis.dailyCapacity} saat
- Çalışma Saatleri: ${timeAnalysis.studyStartHour}:00 - ${timeAnalysis.studyEndHour}:00

## MEVCUT DURUM
- Son 30 Gün Çalışma: ${summary.totalStudyHours} saat
- Ortalama Başarı: %${(summary.averageSuccessRate * 100).toFixed(0)}
- Zayıf Ders: ${summary.weakSubjectCount}
- Gecikmiş Tekrar: ${summary.dueReviewCount} konu

## ÖNCELİKLİ KONULAR (İlk 20)
${JSON.stringify(prioritizedTopics.slice(0, 20), null, 2)}

## ZAYIF KONULAR
${JSON.stringify(weakTopics, null, 2)}

## GECİKMİŞ TEKRARLAR
${JSON.stringify(dueReviews, null, 2)}

## KURALLAR
1. ${requestedDays} gün için plan yap
2. Günlük ${timeAnalysis.dailyCapacity} saat kapasiteyi AŞMA
3. priorityScore yüksek konulara ağırlık ver
4. Gecikmiş tekrarları MUTLAKA ekle (dueReviews)
5. Zayıf konuları düzenli tekrarla
6. 25 dakika çalışma + 5 dakika mola (Pomodoro)
7. Çalışma başlangıç: ${timeAnalysis.studyStartHour}:00
8. Her gün için dailyGoal yaz (motivasyon)

## JSON ÇIKTISI
{
  "explanation": "Plan neden böyle oluşturuldu (2-3 cümle)",
  "weeklyGoals": ["Hafta sonu hedefi 1", "Hafta sonu hedefi 2"],
  "days": [
    {
      "date": "2025-12-03",
      "dailyGoal": "Bugünkü ana hedef nedir?",
      "totalMinutes": 240,
      "slots": [
        {
          "startTime": "09:00",
          "endTime": "10:30",
          "subjectCode": "MAT",
          "topicCode": "LIM",
          "duration": 90,
          "priority": 5,
          "reason": "Neden bu konu şimdi? (kısa)"
        }
      ]
    }
  ]
}

SADECE JSON döndür, başka hiçbir şey yazma.`;
};
```

#### JSON Schema
```javascript
const studyPlanSchema = {
  type: 'object',
  properties: {
    explanation: { type: 'string' },
    weeklyGoals: {
      type: 'array',
      items: { type: 'string' }
    },
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date' },
          dailyGoal: { type: 'string' },
          totalMinutes: { type: 'integer' },
          slots: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                startTime: { type: 'string', pattern: '^[0-2][0-9]:[0-5][0-9]$' },
                endTime: { type: 'string', pattern: '^[0-2][0-9]:[0-5][0-9]$' },
                subjectCode: { type: 'string' },
                topicCode: { type: 'string' },
                duration: { type: 'integer' },
                priority: { type: 'integer', minimum: 1, maximum: 5 },
                reason: { type: 'string' }
              },
              required: ['startTime', 'endTime', 'subjectCode', 'topicCode', 'duration', 'priority', 'reason']
            }
          }
        },
        required: ['date', 'dailyGoal', 'totalMinutes', 'slots']
      }
    }
  },
  required: ['explanation', 'weeklyGoals', 'days']
};
```

#### Database Kayıt
```javascript
// JSON parse
const plan = JSON.parse(response.output_text);

// Subject/Topic mapping
const subjectMap = {};
const topicMap = {};
const subjects = await prisma.subject.findMany();
const topics = await prisma.topic.findMany();
subjects.forEach(s => subjectMap[s.code] = s.id);
topics.forEach(t => topicMap[t.code] = t.id);

// StudyPlan oluştur
await prisma.studyPlan.create({
  data: {
    userId,
    title: `AI Çalışma Planı - ${new Date().toLocaleDateString('tr-TR')}`,
    description: plan.explanation,
    startDate: new Date(plan.days[0].date),
    endDate: new Date(plan.days[plan.days.length - 1].date),
    isActive: true,
    isAIGenerated: true,       // ✅ AI işareti
    aiExplanation: plan.explanation,  // ✅ Açıklama
    weeklyGoals: JSON.stringify(plan.weeklyGoals),  // ✅ Hedefler
    days: {
      create: plan.days.map(day => ({
        date: new Date(day.date),
        dayNote: day.dailyGoal,
        dailyGoalMinutes: day.totalMinutes,
        slots: {
          create: day.slots.map(slot => ({
            subjectId: subjectMap[slot.subjectCode],
            topicId: topicMap[slot.topicCode],
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: slot.duration,
            priority: slot.priority,
            slotType: 'study',
            aiReason: slot.reason,   // ✅ AI nedeni
          }))
        }
      }))
    }
  }
});
```

#### Maliyet (GPT-5.1)
- Input: ~5000-8000 tokens (analiz verisi)
- Output: ~4000-6000 tokens (7 günlük JSON)
- $1.25/1M * 8K + $10/1M * 6K = **$0.07-0.10 / plan**
- **4 plan/ay**: $0.28-0.40
- **1000 kullanıcı**: $280-400/ay

---

### Özellik 3: Performans Analizi & Koçluk 📊

**Amaç**: İstatistikleri AI ile analiz edip detaylı geri bildirim.

#### Endpoint
```
GET /api/ai/performance-analysis
```

#### GPT-5.1 Konfigürasyonu
```javascript
{
  model: 'gpt-5.1',
  reasoning_effort: 'medium',    // Derinlemesine analiz
  verbosity: 'high',              // Detaylı açıklama
  max_output_tokens: 3000
}
```

#### Prompt Yapısı
```javascript
const performanceCoachPrompt = (analysis) => {
  // Ekstra zengin veriler al
  const streakData = await getStreakData(userId);
  const records = await getRecords(userId);
  const successRateTrend = await getSuccessRateTrend(userId);
  const preparationProgress = await getPreparationProgress(userId);
  const pomodoroStats = await getPomodoroStats(userId);

  return `Sen empatik, motive edici ve deneyimli bir eğitim koçusun.

## ÖĞRENCİ PROFİLİ
- Sınav: ${analysis.user.examType}
- Hedef: ${analysis.user.targetScore}
- Sınava Kalan: ${analysis.timeAnalysis.remainingDays} gün

## SON 30 GÜN PERFORMANSI
${JSON.stringify(analysis.summary, null, 2)}

## DERS BAZLI ANALİZ
${JSON.stringify(analysis.subjectAnalysis, null, 2)}

## ZAYIF KONULAR
${JSON.stringify(analysis.weakTopics.slice(0, 10), null, 2)}

## EK VERİLER
- Mevcut Streak: ${streakData.currentStreak} gün
- En Uzun Streak: ${streakData.longestStreak} gün
- Rekor Gün: ${records.daily.mostQuestions?.count} soru
- Başarı Trendi: ${successRateTrend.trendDirection} (${successRateTrend.currentRate}%)
- Hazırlık İlerlemesi: ${preparationProgress.percentage}%
- Pomodoro: ${pomodoroStats.averageDaily} / gün

## GÖREV
Markdown formatında detaylı analiz yap:

## 1. Genel Performans Değerlendirmesi (2-3 paragraf)
[Çalışma disiplini, başarı trendleri, hedeflere yakınlık]

## 2. Güçlü Yönler ✅
- [Başarılı dersler]
- [Olumlu davranış paternleri]
- [Takdir edilecek gelişmeler]

## 3. Gelişim Alanları 📈
- [Zayıf dersler ve sebepleri]
- [Düşük performans konuları]
- [İyileştirilmesi gereken alışkanlıklar]

## 4. Acil Önlem Gereken Konular ⚠️
- [Kritik zayıf konular]
- [Gecikmiş tekrarlar]
- [Öncelikli müdahale]

## 5. Eylem Planı 🎯
**Bu Hafta (1-7 gün):**
1. [Somut hedef 1]
2. [Somut hedef 2]
3. [Somut hedef 3]

**Orta Vade (1-4 hafta):**
- [Hedef 1]
- [Hedef 2]

## 6. Motivasyon Mesajı 💪
[Cesaret verici, samimi, uygulanabilir tavsiyeler]

## TON
- Türkçe yaz
- "Sen" diye hitap et
- Samimi ve motive edici ol
- Veri odaklı ama empatik
- Negatif ifadelerden kaçın
- Yapıcı eleştiri yap
- Somut, uygulanabilir öneriler ver
`;
};
```

#### Maliyet (GPT-5.1)
- Input: ~6000-10000 tokens (zengin veri)
- Output: ~2000-3000 tokens (markdown analiz)
- $1.25/1M * 10K + $10/1M * 3K = **$0.04-0.05 / analiz**
- **4 analiz/ay**: $0.16-0.20
- **1000 kullanıcı**: $160-200/ay

---

### Özellik 4: Günlük Rehberlik 🌅

**Amaç**: Dashboard'da her gün farklı motivasyon mesajı.

#### Endpoint
```
GET /api/ai/daily-guidance
```

#### GPT-5.1 Konfigürasyonu
```javascript
{
  model: 'gpt-5.1',
  reasoning_effort: 'minimal',   // En hızlı
  verbosity: 'low',               // Kısa mesaj
  max_output_tokens: 200
}
```

#### Veri Toplama
```javascript
const getDailyGuidanceData = async (userId) => {
  // Bugünkü plan
  const todayPlan = await prisma.studyPlanDay.findFirst({
    where: {
      plan: { userId, isActive: true },
      date: { gte: todayStart, lt: tomorrowStart }
    },
    include: {
      slots: {
        include: { subject: true, topic: true }
      }
    }
  });

  // Son 7 günlük aktivite
  const recentSessions = await prisma.studySession.findMany({
    where: {
      userId,
      date: { gte: sevenDaysAgo }
    },
    include: { subject: true, topic: true },
    orderBy: { date: 'desc' },
    take: 10
  });

  // Dünkü performans
  const yesterday = await prisma.studySession.aggregate({
    where: {
      userId,
      date: { gte: yesterdayStart, lt: todayStart }
    },
    _sum: { duration: true, questionsCorrect: true, questionsWrong: true }
  });

  // Streak
  const streakData = await getStreakData(userId);

  // Gecikmiş tekrarlar
  const dueReviews = await spacedRepetitionService.getTopicsDueForReview(userId, 5);

  return {
    todayPlan,
    recentSessions,
    yesterday,
    streak: streakData.currentStreak,
    dueReviews
  };
};
```

#### Prompt Yapısı
```javascript
const dailyGuidancePrompt = (data) => {
  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return `Sen günlük motivasyon mesajları yazan koçsun.

BUGÜN: ${today}

BUGÜNÜN PLANI:
${data.todayPlan ? JSON.stringify(data.todayPlan.slots, null, 2) : 'Plan yok'}

SON 7 GÜN:
- Toplam ${data.recentSessions.length} çalışma
- Mevcut Streak: ${data.streak} gün
- Dün: ${data.yesterday._sum.duration || 0} dk, ${data.yesterday._sum.questionsCorrect || 0} doğru

GECİKMİŞ TEKRAR:
${data.dueReviews.length} konu tekrar bekliyor

GÖREV:
1. Selamla (günaydın/merhaba)
2. Bugünkü en önemli 1-2 konuyu vurgula
3. Son günlerdeki olumlu bir gelişmeyi takdir et (varsa)
4. KÜ KISACIK yaz (max 3 cümle)
5. Motive edici ol

SADECE mesajı yaz, başka hiçbir şey yazma.
`;
};
```

#### Maliyet (GPT-5.1)
- Input: ~1500-2500 tokens
- Output: ~80-150 tokens
- $1.25/1M * 2.5K + $10/1M * 150 = **$0.004-0.005 / gün**
- **30 gün/ay**: $0.12-0.15
- **1000 kullanıcı**: $120-150/ay

---

## 💰 MALİYET ANALİZİ - SADECE GPT-5.1

### Öğrenci Başına Aylık Maliyet

| Özellik | Kullanım | Aylık Maliyet |
|---------|---------|---------------|
| **Soru Çözücü** | 100 soru | $2.00 - $5.00 |
| **Çalışma Planı** | 4 plan | $0.28 - $0.40 |
| **Performans Analizi** | 4 analiz | $0.16 - $0.20 |
| **Günlük Rehberlik** | 30 gün | $0.12 - $0.15 |
| **TOPLAM** | | **$2.56 - $5.75** |

### Kullanıcı Sayısına Göre

| Kullanıcı | Aylık Maliyet | Yıllık Maliyet |
|-----------|---------------|----------------|
| 10 | $26 - $58 | $312 - $696 |
| 100 | $256 - $575 | $3,072 - $6,900 |
| 1,000 | $2,560 - $5,750 | $30,720 - $69,000 |
| 10,000 | $25,600 - $57,500 | $307,200 - $690,000 |

### Gelir Modeli Önerisi

#### Freemium
- **Free**: Günlük rehberlik + 5 soru/ay
- **Premium ($9.99/ay)**:
  - 100 soru/ay
  - 4 plan/ay
  - 4 analiz/ay
  - **Kar: $9.99 - $5.75 = $4.24 (42%)**

#### Pro
- **Pro ($19.99/ay)**:
  - Sınırsız soru
  - Sınırsız plan
  - Sınırsız analiz
  - **Kar: $19.99 - $12 (tahmini) = $7.99 (40%)**

---

## 🚀 4 HAFTALIK ROADMAP

### Hafta 1: Temel Altyapı + Günlük Rehberlik ✅

**Backend**:
- [ ] `npm install openai`
- [ ] `config/openai.js` - Client init
- [ ] `services/ai/openai.service.js` - Responses API wrapper
- [ ] `services/ai/dailyGuidance.service.js` - getDailyGuidance()
- [ ] `controllers/ai.controller.js` - getDailyGuidance endpoint
- [ ] `routes/ai.routes.js` - /api/ai/daily-guidance
- [ ] `middleware/aiRateLimit.middleware.js`
- [ ] `.env` - OPENAI_API_KEY

**Frontend**:
- [ ] `api/ai.js` - API client
- [ ] `components/Dashboard/DailyGuidanceCard.jsx`
- [ ] Dashboard'a entegre et

**Çıktı**: Dashboard'da AI mesajı ✅

---

### Hafta 2: Soru Çözücü 📸

**Backend**:
- [ ] `npm install sharp multer`
- [ ] `middleware/upload.middleware.js`
- [ ] `services/ai/questionSolver.service.js`
- [ ] `controllers/ai.controller.js` - solveQuestion, getHistory, rate
- [ ] AIQuestionLog database integration

**Frontend**:
- [ ] `npm install react-katex katex react-dropzone`
- [ ] `pages/AI/QuestionSolver.jsx`
- [ ] `components/AI/ImageUploader.jsx`
- [ ] `components/AI/QuestionInput.jsx`
- [ ] `components/AI/SolutionDisplay.jsx` (LaTeX)
- [ ] `components/AI/QuestionHistory.jsx`
- [ ] `utils/latexParser.js`

**Çıktı**: Soru gönderip çözüm alma ✅

---

### Hafta 3: Performans Analizi 📊

**Backend**:
- [ ] `services/ai/performanceCoach.service.js`
- [ ] Zengin veri toplama (streak, records, trend, pomodoro)
- [ ] `controllers/ai.controller.js` - getPerformanceAnalysis

**Frontend**:
- [ ] `npm install react-markdown`
- [ ] `pages/Stats/AIAnalysisTab.jsx`
- [ ] Stats sayfasına yeni tab
- [ ] Markdown rendering

**Çıktı**: İstatistik sayfasında AI analizi ✅

---

### Hafta 4: Çalışma Planı 📅

**Backend**:
- [ ] `services/ai/studyPlanGenerator.service.js`
- [ ] JSON schema + validation
- [ ] Subject/Topic code → ID mapping
- [ ] StudyPlan database integration

**Frontend**:
- [ ] `pages/StudyPlan/StudyPlanView.jsx`
- [ ] `components/StudyPlan/CalendarView.jsx`
- [ ] `components/StudyPlan/DayView.jsx`
- [ ] "Plan Oluştur" butonu

**Çıktı**: AI ile otomatik program ✅

---

## ✅ İLK ADIMLAR

1. **OpenAI API Key**:
   - https://platform.openai.com/api-keys
   - Aylık limit belirle ($100 öneri)

2. **Model Onay**:
   - ✅ Sadece GPT-5.1 kullanılacak
   - ✅ Reasoning effort: minimal/low/medium
   - ✅ Verbosity: low/medium/high

3. **Hangi özellikle başlayalım?**
   - 🥇 Öneri: Hafta 1 - Günlük Rehberlik (en kolay)
   - 🥈 Alternatif: Hafta 2 - Soru Çözücü (en değerli)

Hazır mısınız? 🚀
