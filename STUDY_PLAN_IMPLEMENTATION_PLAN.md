# AI Çalışma Planı Özelliği - Implementasyon Planı

## 1. GENEL BAKIŞ

### Özellik Açıklaması
Kullanıcılar kendi çalışma planlarını oluşturabilecek, düzenleyebilecek ve AI tarafından kişiselleştirilmiş çalışma planları alabilecekler.

### Kullanım Senaryoları
1. **Manuel Plan Oluşturma**: Kullanıcı haftalık çalışma planını kendisi oluşturur
2. **Plan Düzenleme**: Mevcut planları güncelleme, slot ekleme/silme
3. **AI Plan Oluşturma**: AI, kullanıcı verilerini analiz ederek özelleştirilmiş plan oluşturur
4. **Plan Aktivasyonu**: Birden fazla plan arasında aktif plan seçme
5. **Plan Takibi**: Slot'ları tamamlandı olarak işaretleme

---

## 2. VERİTABANI MODELLERİ (Mevcut)

### StudyPlan
```prisma
model StudyPlan {
  id            String         @id @default(uuid())
  userId        String
  title         String         // "Haziran Ayı Planı", "AI Özel Planım"
  description   String?        // Açıklama
  startDate     DateTime       // Plan başlangıç tarihi
  endDate       DateTime       // Plan bitiş tarihi
  isActive      Boolean        @default(true)
  isAIGenerated Boolean        @default(false)
  aiExplanation String?        @db.Text  // AI'nin plan açıklaması
  weeklyGoals   String?        @db.Text  // Haftalık hedefler (JSON string)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  user          User           @relation(...)
  days          StudyPlanDay[]
}
```

### StudyPlanDay
```prisma
model StudyPlanDay {
  id               String          @id @default(uuid())
  planId           String
  date             DateTime        // Günün tarihi (YYYY-MM-DD)
  dayNote          String?         // Günlük not
  dailyGoalMinutes Int?            // O gün için hedef dakika
  createdAt        DateTime        @default(now())
  plan             StudyPlan       @relation(...)
  slots            StudyPlanSlot[]

  @@unique([planId, date])
}
```

### StudyPlanSlot
```prisma
model StudyPlanSlot {
  id          String       @id @default(uuid())
  dayId       String
  subjectId   String       // Hangi ders
  topicId     String?      // Hangi konu (opsiyonel)
  startTime   String       // "09:00"
  endTime     String       // "10:30"
  duration    Int          // Dakika cinsinden (90)
  priority    Int          @default(3)   // 1-5 (1: düşük, 5: yüksek)
  slotType    String       @default("study")  // "study", "break", "review"
  isCompleted Boolean      @default(false)
  completedAt DateTime?
  notes       String?      // Kullanıcı notu
  aiReason    String?      @db.Text  // AI bu slot'u neden önerdi
  createdAt   DateTime     @default(now())
  day         StudyPlanDay @relation(...)
  subject     Subject      @relation(...)
  topic       Topic?       @relation(...)
}
```

**Not**: Bu modeller zaten schema.prisma'da mevcut. Değişiklik gerekmez.

---

## 3. BACKEND IMPLEMENTATİON

### 3.1 Route Yapısı (studyPlan.routes.js)

**Yeni Dosya**: `backend/src/routes/studyPlan.routes.js`

```javascript
// Tüm endpoint'ler authenticated

// CRUD - Study Plan
GET    /api/study-plans                 -> getAllPlans (kullanıcının tüm planları)
GET    /api/study-plans/active          -> getActivePlan (aktif plan)
GET    /api/study-plans/:id             -> getPlanById
POST   /api/study-plans                 -> createPlan (manuel)
PUT    /api/study-plans/:id             -> updatePlan
DELETE /api/study-plans/:id             -> deletePlan
PUT    /api/study-plans/:id/activate    -> activatePlan

// AI Generation
POST   /api/study-plans/generate-ai     -> generateAIPlan

// Day Management
GET    /api/study-plans/:id/days        -> getPlanDays
POST   /api/study-plans/:id/days        -> createDay
PUT    /api/study-plans/days/:dayId     -> updateDay
DELETE /api/study-plans/days/:dayId     -> deleteDay

// Slot Management
POST   /api/study-plans/days/:dayId/slots       -> createSlot
PUT    /api/study-plans/slots/:slotId           -> updateSlot
PUT    /api/study-plans/slots/:slotId/complete  -> markSlotComplete
DELETE /api/study-plans/slots/:slotId           -> deleteSlot

// Analytics
GET    /api/study-plans/:id/progress    -> getPlanProgress (tamamlanma oranı)
```

**Pattern**: Mevcut `studySession.routes.js` pattern'ini takip edecek.

---

### 3.2 Controller (studyPlan.controller.js)

**Yeni Dosya**: `backend/src/controllers/studyPlan.controller.js`

**Pattern**: `studySession.controller.js` ile aynı yapı
- Error handling
- Logging
- req.user.id ownership check
- Service layer çağrısı

**Fonksiyonlar**:
- `getAllPlans(req, res, next)`
- `getActivePlan(req, res, next)`
- `getPlanById(req, res, next)`
- `createPlan(req, res, next)`
- `updatePlan(req, res, next)`
- `deletePlan(req, res, next)`
- `activatePlan(req, res, next)`
- `generateAIPlan(req, res, next)`
- `getPlanDays(req, res, next)`
- `createDay(req, res, next)`
- `updateDay(req, res, next)`
- `deleteDay(req, res, next)`
- `createSlot(req, res, next)`
- `updateSlot(req, res, next)`
- `markSlotComplete(req, res, next)`
- `deleteSlot(req, res, next)`
- `getPlanProgress(req, res, next)`

---

### 3.3 Service Layer (studyPlan.service.js)

**Yeni Dosya**: `backend/src/services/studyPlan.service.js`

**CRUD İşlemleri**:

```javascript
// Plan CRUD
createPlan(userId, planData)
  - Validasyon: startDate < endDate
  - isActive = true yapıldığında diğer planları isActive = false yap
  - Include: days, days.slots

getUserPlans(userId)
  - OrderBy: isActive DESC, createdAt DESC
  - Include: days count, slots count, completion rate

getActivePlan(userId)
  - Where: isActive = true
  - Include: days with slots (full nested)

getPlanById(planId, userId)
  - Ownership check
  - Include: full nested (days, slots, subject, topic)

updatePlan(planId, userId, updateData)
  - Ownership check
  - Title, description, startDate, endDate, isActive güncellenebilir

deletePlan(planId, userId)
  - Ownership check
  - Cascade delete (days, slots)

activatePlan(planId, userId)
  - Transaction:
    1. Diğer planları isActive = false
    2. Bu planı isActive = true

// Day Management
createDay(planId, userId, dayData)
  - Ownership check (plan)
  - Unique constraint: [planId, date]

updateDay(dayId, userId, updateData)
  - Ownership check

deleteDay(dayId, userId)
  - Ownership check
  - Cascade delete (slots)

// Slot Management
createSlot(dayId, userId, slotData)
  - Ownership check (day)
  - Validasyon:
    - startTime < endTime
    - Time overlap kontrolü (aynı gün içinde)
    - duration hesaplama (startTime - endTime)
  - subjectId access check

updateSlot(slotId, userId, updateData)
  - Ownership check

markSlotComplete(slotId, userId, completed)
  - isCompleted = true/false
  - completedAt = now() / null

deleteSlot(slotId, userId)
  - Ownership check

// Progress
getPlanProgress(planId, userId)
  - Total slots, completed slots, completion rate
  - Subject breakdown, daily progress
```

**Pattern**: `studySession.service.js` pattern'ini takip et.

---

### 3.4 AI Service (studyPlanGenerator.service.js)

**Yeni Dosya**: `backend/src/services/ai/studyPlanGenerator.service.js`

**Ana Fonksiyon**: `generateStudyPlan(userId, preferences)`

#### Input (preferences)
```javascript
{
  startDate: "2024-12-10",
  endDate: "2025-01-15",
  dailyStudyHours: 5,             // Günlük çalışma saati (esnek)
  preferredStartTime: "09:00",    // Başlangıç saati
  preferredEndTime: "22:00",      // Bitiş saati
  breakDuration: 15,              // Molalar (dakika)
  focusOnWeakTopics: true,        // Zayıf konulara odaklan mı?
  includeReviewSessions: true,    // Tekrar seansları ekle mi?
  prioritySubjects: ["MAT", "FIZ"] // Öncelikli dersler (opsiyonel)
}
```

#### AI Generation Algorithm

**Adım 1: Veri Toplama**
```javascript
const userData = await studyPlanAnalysisService.analyzeUserPerformance(userId);
// userData içinde:
// - user: { examType, targetDate, targetScore, learningVelocity }
// - subjectAnalysis: { [subjectCode]: { successRate, totalDuration, ... } }
// - topicAnalysis: { [topicCode]: { successRate, lastStudied, ... } }
// - weakTopics: [ { topicId, weaknessScore, ... } ]
// - dueReviews: [ { topicId, daysOverdue, ... } ]
// - prioritizedTopics: [ { topicId, priorityScore, recommendedMinutes, ... } ]
// - examWeights: { [topicCode]: { questionCount, weight } }
// - timeAnalysis: { remainingDays, dailyCapacity }
```

**Adım 2: Zaman Bütçesi Hesaplama**
```javascript
const totalDays = calculateDays(startDate, endDate);
const totalAvailableMinutes = totalDays * (dailyStudyHours * 60);
const breakMinutesPerDay = preferences.breakDuration * (dailyStudyHours / 2); // Her 2 saatte bir mola
const netStudyMinutes = totalAvailableMinutes - (breakMinutesPerDay * totalDays);
```

**Adım 3: Topic Allocation (Konu Dağılımı)**
```javascript
// prioritizedTopics'i kullanarak her konuya zaman ayır
const topicAllocation = allocateTimeToTopics(
  userData.prioritizedTopics,
  netStudyMinutes,
  preferences
);

// Örnek:
[
  { topicId, subjectId, allocatedMinutes: 300, sessions: 5 },
  ...
]

// Allocation mantığı:
// 1. Zayıf konulara daha fazla süre (focusOnWeakTopics = true ise)
// 2. Sınav ağırlığına göre (examWeights)
// 3. Spaced Repetition gereksinimlerine göre (dueReviews)
```

**Adım 4: Daily Schedule Generation (Günlük Program Oluşturma)**
```javascript
// Her gün için slot'lar oluştur
for (let day = startDate; day <= endDate; day++) {
  const daySlots = generateDaySlots(
    day,
    topicAllocation,
    preferences,
    userData
  );

  // daySlots örneği:
  [
    { startTime: "09:00", endTime: "11:00", subjectId, topicId, duration: 120, aiReason: "..." },
    { startTime: "11:00", endTime: "11:15", slotType: "break", duration: 15 },
    { startTime: "11:15", endTime: "13:00", subjectId, topicId, duration: 105, aiReason: "..." },
    ...
  ]
}
```

**Slot Placement Logic**:
- Sabah: Zor konular (matematik, fizik)
- Öğleden sonra: Orta zorluk
- Akşam: Tekrar seansları veya kolay konular
- Her 2 saatte bir mola
- Variety: Aynı dersi art arda koymamaya çalış

**Adım 5: GPT-5.1 ile Plan Açıklaması**
```javascript
// AI'ya prompt gönder
const prompt = `
Sen bir YKS/LGS çalışma planı danışmanısın.

Kullanıcı Bilgileri:
- Sınav: ${userData.user.examType}
- Hedef Tarih: ${userData.user.targetDate}
- Kalan Gün: ${totalDays}
- Günlük Çalışma Hedefi: ${dailyStudyHours} saat

Performans Özeti:
- Toplam Çalışma: ${userData.summary.totalStudyHours} saat
- Başarı Oranı: %${userData.summary.averageSuccessRate * 100}
- Zayıf Ders: ${userData.summary.weakSubjectCount} ders

Zayıf Konular (İlk 5):
${weakTopics.slice(0, 5).map(t => `- ${t.topicName} (${t.weaknessReason})`).join('\n')}

Oluşturulan Plan:
- ${totalDays} günlük plan
- ${totalSlots} çalışma slot'u
- Toplam ${netStudyMinutes / 60} saat

Görevin:
1. Bu planın mantığını ve stratejisini 2-3 paragraf olarak açıkla.
2. Her hafta için özet hedefler belirle (JSON formatında).

JSON Çıktı Formatı:
{
  "explanation": "Plan açıklaması...",
  "weeklyGoals": [
    { "week": 1, "goal": "Hafta 1 hedefi" },
    { "week": 2, "goal": "Hafta 2 hedefi" }
  ]
}
`;

const aiResponse = await openaiService.createResponse({
  model: "gpt-5.1",
  input: [
    { role: "system", content: "Sen bir çalışma planı danışmanısın. JSON döndür." },
    { role: "user", content: prompt }
  ],
  verbosity: "low",
  reasoning_effort: "medium"
});

const { explanation, weeklyGoals } = JSON.parse(aiResponse.output_text);
```

**Adım 6: Database'e Kaydet**
```javascript
// Transaction ile tüm verileri kaydet
const studyPlan = await prisma.$transaction(async (tx) => {
  // 1. StudyPlan oluştur
  const plan = await tx.studyPlan.create({
    data: {
      userId,
      title: `AI Planı (${startDate} - ${endDate})`,
      description: `${totalDays} günlük kişiselleştirilmiş plan`,
      startDate,
      endDate,
      isActive: true,
      isAIGenerated: true,
      aiExplanation: explanation,
      weeklyGoals: JSON.stringify(weeklyGoals)
    }
  });

  // 2. Günleri ve slot'ları oluştur
  for (const [date, slots] of dailySchedule) {
    const day = await tx.studyPlanDay.create({
      data: {
        planId: plan.id,
        date,
        dailyGoalMinutes: dailyStudyHours * 60
      }
    });

    for (const slot of slots) {
      await tx.studyPlanSlot.create({
        data: {
          dayId: day.id,
          ...slot
        }
      });
    }
  }

  return plan;
});

return studyPlan;
```

**AI Reason Examples** (slot.aiReason):
- "Zayıf konu: %45 başarı oranı. Güçlendirme gerekiyor."
- "Sınavda 8 soru çıkan önemli konu."
- "3 gün gecikmiş spaced repetition."
- "Sabah saatleri için uygun zor konu."
- "Akşam tekrar seansı: Öğrenilen bilgileri pekiştir."

**Pattern**: `performanceAnalysis.service.js` ve `questionSolver.service.js` pattern'ini birleştir.

---

### 3.5 Validator (studyPlan.validator.js)

**Yeni Dosya**: `backend/src/validators/studyPlan.validator.js`

```javascript
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validator');

exports.validateCreatePlan = [
  body('title').notEmpty().trim().isLength({ max: 200 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('description').optional().isLength({ max: 500 }),
  validate
];

exports.validateUpdatePlan = [
  body('title').optional().trim().isLength({ max: 200 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('description').optional().isLength({ max: 500 }),
  body('isActive').optional().isBoolean(),
  validate
];

exports.validateGenerateAI = [
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('dailyStudyHours').optional().isInt({ min: 1, max: 16 }),
  body('preferredStartTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('preferredEndTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('breakDuration').optional().isInt({ min: 5, max: 60 }),
  body('focusOnWeakTopics').optional().isBoolean(),
  body('includeReviewSessions').optional().isBoolean(),
  body('prioritySubjects').optional().isArray(),
  validate
];

exports.validateCreateDay = [
  body('date').isISO8601(),
  body('dayNote').optional().isLength({ max: 500 }),
  body('dailyGoalMinutes').optional().isInt({ min: 0 }),
  validate
];

exports.validateCreateSlot = [
  body('subjectId').notEmpty().isUUID(),
  body('topicId').optional().isUUID(),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('duration').isInt({ min: 1 }),
  body('priority').optional().isInt({ min: 1, max: 5 }),
  body('slotType').optional().isIn(['study', 'break', 'review']),
  body('notes').optional().isLength({ max: 500 }),
  validate
];

exports.validateUpdateSlot = [
  body('subjectId').optional().isUUID(),
  body('topicId').optional().isUUID(),
  body('startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('duration').optional().isInt({ min: 1 }),
  body('priority').optional().isInt({ min: 1, max: 5 }),
  body('notes').optional().isLength({ max: 500 }),
  body('isCompleted').optional().isBoolean(),
  validate
];
```

**Pattern**: `studySession.validator.js` pattern'ini takip et.

---

### 3.6 App.js'e Route Ekleme

**Dosya**: `backend/src/app.js`

```javascript
// Line 59'dan sonra ekle
const studyPlanRoutes = require('./routes/studyPlan.routes');

// Line 72'den sonra ekle
app.use('/api/study-plans', studyPlanRoutes);
```

---

## 4. FRONTEND IMPLEMENTATION

### 4.1 Sayfa Yapısı

#### Ana Sayfa: StudyPlanPage.jsx

**Yeni Dosya**: `frontend/src/pages/StudyPlan/StudyPlanPage.jsx`

**Layout**:
```
┌─────────────────────────────────────┐
│  Header: "Çalışma Planlarım"       │
│  [+ Yeni Plan] [🤖 AI Planı Oluştur]│
└─────────────────────────────────────┘
│                                     │
│  📋 Planlarım                       │
│  ┌───────────────────────────────┐ │
│  │ ✓ AI Planım (Aktif)           │ │
│  │ 15 Ara - 15 Oca • 32 gün      │ │
│  │ ████████░░ 80% tamamlandı     │ │
│  │ [Görüntüle] [Düzenle] [Sil]  │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │   Haziran Planı                │ │
│  │ 1 Haz - 30 Haz • 30 gün       │ │
│  │ ████████░░ 65% tamamlandı     │ │
│  │ [Görüntüle] [Düzenle] [Sil]  │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**State Management**:
```javascript
const [plans, setPlans] = useState([]);
const [activePlan, setActivePlan] = useState(null);
const [loading, setLoading] = useState(true);
const [showAIGenerator, setShowAIGenerator] = useState(false);
const [showPlanForm, setShowPlanForm] = useState(false);
const [editingPlan, setEditingPlan] = useState(null);
```

**Fonksiyonlar**:
- `fetchPlans()` - Tüm planları getir
- `handleCreateManual()` - Manuel form aç
- `handleCreateAI()` - AI generator modal aç
- `handleViewPlan(id)` - Plan detayına git (/study-plans/:id)
- `handleEditPlan(id)` - Plan düzenleme formu aç
- `handleDeletePlan(id)` - Plan sil (confirm dialog)
- `handleActivatePlan(id)` - Planı aktif yap

**Pattern**: `StudySessionList.jsx` ile benzer liste yapısı.

---

#### Plan Detay Sayfası: StudyPlanDetail.jsx

**Yeni Dosya**: `frontend/src/pages/StudyPlan/StudyPlanDetail.jsx`

**Layout**:
```
┌─────────────────────────────────────────────┐
│  ← Geri   AI Planım                         │
│  15 Ara - 15 Oca • 32 gün                   │
│  ████████░░ 80% tamamlandı (120/150 slot)   │
└─────────────────────────────────────────────┘
│                                             │
│  📝 AI Açıklaması                           │
│  "Bu plan, zayıf konularınıza odaklanarak  │
│   dengeli bir çalışma stratejisi sunar..." │
│                                             │
│  📅 Haftalık Takvim Görünümü                │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬───┐│
│  │Pzt  │Sal  │Çar  │Per  │Cum  │Cmt  │Paz││
│  ├─────┼─────┼─────┼─────┼─────┼─────┼───┤│
│  │09:00│09:00│09:00│09:00│09:00│10:00│REST│
│  │MAT  │FIZ  │MAT  │KIM  │MAT  │BIO  │    │
│  │✓    │✓    │     │     │     │     │    │
│  │─────│─────│─────│─────│─────│─────│    │
│  │11:15│11:00│11:15│11:00│11:15│12:00│    │
│  │FIZ  │MAT  │KIM  │FIZ  │TUR  │MAT  │    │
│  │✓    │     │     │     │     │     │    │
│  └─────┴─────┴─────┴─────┴─────┴─────┴───┘│
│                                             │
│  📊 İstatistikler                           │
│  • Toplam slot: 150                         │
│  • Tamamlanan: 120                          │
│  • Matematik: 45 slot (30 tamamlandı)       │
│  • Fizik: 38 slot (28 tamamlandı)           │
└─────────────────────────────────────────────┘
```

**State**:
```javascript
const [plan, setPlan] = useState(null);
const [selectedDate, setSelectedDate] = useState(new Date());
const [selectedSlot, setSelectedSlot] = useState(null);
const [showSlotEditor, setShowSlotEditor] = useState(false);
```

**Bileşenler**:
- `StudyPlanCalendar` - Haftalık takvim görünümü
- `StudyPlanSlotCard` - Tek bir slot kartı
- `StudyPlanProgress` - İlerleme barı ve istatistikler
- `StudyPlanSlotEditor` - Slot düzenleme modal

---

#### Manuel Plan Formu: StudyPlanForm.jsx

**Yeni Dosya**: `frontend/src/pages/StudyPlan/StudyPlanForm.jsx`

**Form Fields**:
```javascript
{
  title: "",           // Text input
  description: "",     // Textarea
  startDate: "",       // Date picker
  endDate: "",         // Date picker
  isActive: true       // Checkbox
}
```

**Adımlar**:
1. **Temel Bilgiler**: Title, description, dates
2. **Gün Ekleme**: Tarih seç, günlük hedef belirle
3. **Slot Ekleme**: Her gün için slot ekle (subject, topic, time)
4. **Önizleme ve Kaydet**

**Pattern**: `StudySessionCreate.jsx` form pattern'i.

---

#### AI Plan Generator: AIStudyPlanGenerator.jsx

**Yeni Dosya**: `frontend/src/pages/StudyPlan/AIStudyPlanGenerator.jsx`

**Modal Layout**:
```
┌──────────────────────────────────────────┐
│  🤖 AI ile Çalışma Planı Oluştur        │
├──────────────────────────────────────────┤
│                                          │
│  📅 Tarih Aralığı                        │
│  [Başlangıç] [Bitiş]                     │
│                                          │
│  ⏰ Çalışma Tercihleri                   │
│  • Günlük Saat: [___] saat               │
│  • Başlangıç: [09:00]                    │
│  • Bitiş: [22:00]                        │
│  • Mola Süresi: [15] dakika              │
│                                          │
│  🎯 Odak Ayarları                        │
│  ☑ Zayıf konulara odaklan                │
│  ☑ Tekrar seansları ekle                 │
│                                          │
│  📚 Öncelikli Dersler (opsiyonel)        │
│  [Matematik] [Fizik] [+]                 │
│                                          │
│  [İptal] [Planı Oluştur] ⚡              │
└──────────────────────────────────────────┘
```

**Form State**:
```javascript
const [generating, setGenerating] = useState(false);
const [preferences, setPreferences] = useState({
  startDate: '',
  endDate: '',
  dailyStudyHours: 5,
  preferredStartTime: '09:00',
  preferredEndTime: '22:00',
  breakDuration: 15,
  focusOnWeakTopics: true,
  includeReviewSessions: true,
  prioritySubjects: []
});
```

**Generate Flow**:
```javascript
const handleGenerate = async () => {
  setGenerating(true);
  try {
    const response = await studyPlanAPI.generateAI(preferences);
    toast.success('Plan oluşturuldu! 🎉');
    navigate(`/study-plans/${response.data.id}`);
  } catch (error) {
    toast.error('Plan oluşturulamadı');
  } finally {
    setGenerating(false);
  }
};
```

**Loading State**:
- Spinner + "AI planınızı oluşturuyor..."
- Tahmini süre: 30-60 saniye (GPT-5.1 + slot generation)

**Pattern**: `QuestionSolver.jsx` loading pattern'i.

---

#### Takvim Bileşeni: StudyPlanCalendar.jsx

**Yeni Dosya**: `frontend/src/components/StudyPlan/StudyPlanCalendar.jsx`

**Props**:
```javascript
{
  days: [
    {
      date: "2024-12-15",
      slots: [
        { id, startTime, endTime, subject, topic, isCompleted, aiReason }
      ]
    }
  ],
  onSlotClick: (slot) => {},
  onSlotComplete: (slotId, completed) => {},
  viewMode: "week" | "day"  // Haftalık veya günlük görünüm
}
```

**Görünüm**:
- Hafta seçici (prev/next week)
- 7 kolon: Pazartesi - Pazar
- Her slot: Color-coded (subject color), time, completion checkbox
- Hover: AI reason tooltip
- Click: Slot detail modal

**Pattern**: `ActivityHeatmap.jsx` grid pattern'ini takip et.

---

#### Slot Editor: StudyPlanSlotEditor.jsx

**Yeni Dosya**: `frontend/src/components/StudyPlan/StudyPlanSlotEditor.jsx`

**Modal Layout**:
```
┌──────────────────────────────────┐
│  Slot Düzenle                    │
├──────────────────────────────────┤
│  Ders: [Matematik ▼]             │
│  Konu: [Limit ve Süreklilik ▼]  │
│  Başlangıç: [09:00]              │
│  Bitiş: [11:00]                  │
│  Öncelik: ⭐⭐⭐⭐☆              │
│  Notlar: [____________]          │
│                                  │
│  [İptal] [Kaydet]                │
└──────────────────────────────────┘
```

**Pattern**: Form pattern ile benzer.

---

### 4.2 API Client (studyPlan.js)

**Yeni Dosya**: `frontend/src/api/studyPlan.js`

```javascript
import api from './axios';

export const studyPlanAPI = {
  // Plan CRUD
  getAll: () => api.get('/study-plans'),
  getActive: () => api.get('/study-plans/active'),
  getById: (id) => api.get(`/study-plans/${id}`),
  create: (planData) => api.post('/study-plans', planData),
  update: (id, updateData) => api.put(`/study-plans/${id}`, updateData),
  delete: (id) => api.delete(`/study-plans/${id}`),
  activate: (id) => api.put(`/study-plans/${id}/activate`),

  // AI Generation
  generateAI: (preferences) => api.post('/study-plans/generate-ai', preferences, {
    timeout: 120000 // 2 dakika
  }),

  // Days
  getDays: (planId) => api.get(`/study-plans/${planId}/days`),
  createDay: (planId, dayData) => api.post(`/study-plans/${planId}/days`, dayData),
  updateDay: (dayId, updateData) => api.put(`/study-plans/days/${dayId}`, updateData),
  deleteDay: (dayId) => api.delete(`/study-plans/days/${dayId}`),

  // Slots
  createSlot: (dayId, slotData) => api.post(`/study-plans/days/${dayId}/slots`, slotData),
  updateSlot: (slotId, updateData) => api.put(`/study-plans/slots/${slotId}`, updateData),
  markSlotComplete: (slotId, completed) => api.put(`/study-plans/slots/${slotId}/complete`, { completed }),
  deleteSlot: (slotId) => api.delete(`/study-plans/slots/${slotId}`),

  // Progress
  getProgress: (planId) => api.get(`/study-plans/${planId}/progress`)
};
```

**Pattern**: `studySessions.js` ve `ai.js` pattern'i.

---

### 4.3 Routing (App.jsx)

**Dosya**: `frontend/src/App.jsx`

```javascript
// Import ekle
import StudyPlanPage from './pages/StudyPlan/StudyPlanPage';
import StudyPlanDetail from './pages/StudyPlan/StudyPlanDetail';

// Route'lar ekle (line 125'ten sonra)
<Route
  path="/study-plans"
  element={
    <ProtectedRoute>
      <StudyPlanPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/study-plans/:id"
  element={
    <ProtectedRoute>
      <StudyPlanDetail />
    </ProtectedRoute>
  }
/>
```

---

### 4.4 Navigation Menüsü Güncellemesi

**Dosya**: `frontend/src/ui/DashboardHeader.jsx` veya navigation komponenti

Navigation menüsüne ekle:
```javascript
<NavLink to="/study-plans">
  <Calendar className="w-5 h-5" />
  Çalışma Planları
</NavLink>
```

---

## 5. IMPLEMENTASYON STRATEJİSİ

### Aşama 1: Backend CRUD (Manuel Plan)
**Dosyalar**:
1. `backend/src/routes/studyPlan.routes.js`
2. `backend/src/controllers/studyPlan.controller.js`
3. `backend/src/services/studyPlan.service.js`
4. `backend/src/validators/studyPlan.validator.js`
5. `backend/src/app.js` (route register)

**Test**: Postman ile tüm endpoint'leri test et.

**Süre**: 3-4 saat

---

### Aşama 2: Backend AI Generation
**Dosyalar**:
1. `backend/src/services/ai/studyPlanGenerator.service.js`
2. `studyPlan.controller.js` (generateAIPlan handler)
3. `studyPlan.routes.js` (POST /generate-ai)

**Test**: AI plan generation test et (gerçek kullanıcı verileriyle).

**Süre**: 4-5 saat (AI logic complex)

---

### Aşama 3: Frontend Plan Listesi ve Detay
**Dosyalar**:
1. `frontend/src/api/studyPlan.js`
2. `frontend/src/pages/StudyPlan/StudyPlanPage.jsx`
3. `frontend/src/pages/StudyPlan/StudyPlanDetail.jsx`
4. `frontend/src/App.jsx` (routing)

**Test**: Plan listesini göster, detaya tıkla, CRUD işlemlerini test et.

**Süre**: 3-4 saat

---

### Aşama 4: Frontend Takvim ve Slot Yönetimi
**Dosyalar**:
1. `frontend/src/components/StudyPlan/StudyPlanCalendar.jsx`
2. `frontend/src/components/StudyPlan/StudyPlanSlotEditor.jsx`
3. `StudyPlanDetail.jsx` (entegrasyon)

**Test**: Slot'ları görüntüle, düzenle, complete işaretle.

**Süre**: 4-5 saat

---

### Aşama 5: Frontend AI Generator Modal
**Dosyalar**:
1. `frontend/src/pages/StudyPlan/AIStudyPlanGenerator.jsx`
2. `StudyPlanPage.jsx` (modal entegrasyonu)

**Test**: AI planı oluştur, loading state, error handling.

**Süre**: 2-3 saat

---

### Aşama 6: Frontend Manuel Plan Formu
**Dosyalar**:
1. `frontend/src/pages/StudyPlan/StudyPlanForm.jsx`
2. `StudyPlanPage.jsx` (form entegrasyonu)

**Test**: Manuel plan oluştur, günler ve slot'lar ekle.

**Süre**: 3-4 saat

---

### Aşama 7: Polish & Testing
- UI/UX iyileştirmeleri
- Responsive design
- Error handling
- Loading states
- Toast notifications
- Edge case testing

**Süre**: 2-3 saat

---

## 6. TOPLAM TAHMİNİ SÜRE

- **Backend**: 8-10 saat
- **Frontend**: 12-15 saat
- **Testing & Polish**: 3-4 saat

**Toplam**: 23-29 saat (3-4 iş günü)

---

## 7. ÖNEMLİ NOTLAR

### AI Generation Performance
- GPT-5.1 API timeout: 120 saniye
- Slot generation: O(n*m) complexity (n=days, m=topics)
- Transaction kullan (veritabanı consistency)

### Time Overlap Validation
```javascript
// Slot oluştururken aynı gün içinde overlap kontrolü
const existingSlots = await prisma.studyPlanSlot.findMany({
  where: { dayId }
});

const hasOverlap = existingSlots.some(slot => {
  return (newStartTime < slot.endTime && newEndTime > slot.startTime);
});

if (hasOverlap) {
  throw new Error('Bu zaman aralığında başka bir slot var');
}
```

### Spaced Repetition Integration
- Slot tamamlandığında spaced repetition güncellenebilir (future enhancement)
- `markSlotComplete` → `spacedRepetitionService.updateTopicProgress`

### Mobile Responsiveness
- Takvim: Desktop'ta haftalık, mobile'da günlük görünüm
- Slot kartları: Stack layout mobile'da

### Caching
- Active plan: localStorage ile cache edilebilir (optional)
- AI açıklaması: Zaten database'de

---

## 8. PATTERN ÖZETİ

| Aspect | Pattern Source |
|--------|---------------|
| Route | `studySession.routes.js` |
| Controller | `studySession.controller.js` |
| Service (CRUD) | `studySession.service.js` |
| Service (AI) | `performanceAnalysis.service.js` + `questionSolver.service.js` |
| Validator | `studySession.validator.js` |
| Frontend Page | `StudySessionList.jsx` + `QuestionSolver.jsx` |
| Frontend Form | `StudySessionCreate.jsx` |
| API Client | `studySessions.js` + `ai.js` |
| Grid Component | `ActivityHeatmap.jsx` |

---

## 9. SIRA KULLANICIDA

**Sorular**:
1. Plan önceliği değişiklik var mı? (örn: manuel planların önceliği farklı mı?)
2. Slot tamamlama → StudySession oluşturulsun mu? (entegrasyon)
3. Bildirimler eklensin mi? (upcoming slot reminder)
4. Public plan sharing özelliği? (gelecek)

**Onay Bekliyor**:
- Bu plan ile devam edebilir miyim?
- Herhangi bir değişiklik veya ekleme var mı?
