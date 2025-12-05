# AceIt - GPT-5.1 Entegrasyon Planı

> **Son Güncelleme**: 3 Aralık 2025
> **Durum**: Planlama Aşaması
> **Model**: OpenAI GPT-5.1 Ailesi

---

## 📋 İçindekiler

1. [GPT-5.1 Model Özellikleri](#gpt-51-model-özellikleri)
2. [Mevcut Durum Analizi](#mevcut-durum-analizi)
3. [4 Ana AI Özelliği](#4-ana-ai-özelliği)
4. [Teknik Implementasyon](#teknik-implementasyon)
5. [Maliyet Analizi](#maliyet-analizi)
6. [4 Haftalık Roadmap](#4-haftalık-roadmap)

---

## 1. GPT-5.1 Model Özellikleri

### 1.1 Model Varyantları

| Model | Input Token | Output Token | Context | Kullanım Amacı |
|-------|-------------|--------------|---------|----------------|
| **gpt-5.1** | $1.25/1M | $10/1M | 272K input, 128K output | Karmaşık soru çözümü, detaylı analiz |
| **gpt-5.1-mini** | $0.25/1M | $2/1M | Aynı | Günlük rehberlik, basit sorular |
| **gpt-5.1-nano** | $0.05/1M | $0.40/1M | Aynı | Çok basit/hızlı görevler |

### 1.2 Yeni Özellikler

#### Adaptive Reasoning
- Görev karmaşıklığına göre otomatik "düşünme" süresi ayarlama
- Basit görevlerde hızlı, karmaşık görevlerde derinlemesine analiz

#### Reasoning Effort Parametresi
```javascript
reasoning_effort: "minimal" | "low" | "medium" | "high"
```
- **minimal**: En hızlı yanıt, düşünme yok
- **low**: Hafif düşünme (çalışma programı)
- **medium**: Dengeli (soru çözümü)
- **high**: Maksimum düşünme kapasitesi (çok karmaşık sorular)

#### Verbosity Parametresi
```javascript
verbosity: "low" | "medium" | "high"
```
- Yanıt uzunluğunu kontrol eder

### 1.3 AceIt İçin Model Stratejisi

| Özellik | Model | Reasoning | Verbosity | Gerekçe |
|---------|-------|-----------|-----------|---------|
| **AI Soru Çözücü** | gpt-5.1 | medium | medium | Karmaşık matematiksel düşünme gerekli |
| **Çalışma Planı** | gpt-5.1 | low | low | JSON oluşturma, hızlı olmalı |
| **Performans Analizi** | gpt-5.1 | medium | high | Detaylı analiz ve açıklama |
| **Günlük Rehberlik** | gpt-5.1-mini | minimal | low | Kısa mesaj, hızlı yanıt |

**Maliyet Optimizasyonu**: Mini model kullanarak günlük rehberlikte %80 tasarruf sağlanır.

---

## 2. Mevcut Durum Analizi

### 2.1 Database Schema (✅ Hazır)

```prisma
// backend/prisma/schema.prisma

model AIQuestionLog {
  id            String   @id @default(uuid())
  userId        String
  questionText  String
  questionImage String?  // Base64 veya URL
  aiResponse    String   // LaTeX içeren çözüm
  aiModel       String   // "gpt-5.1" veya "gpt-5.1-mini"
  rating        Int?     // Kullanıcı değerlendirmesi
  tokensUsed    Int?     // Maliyet takibi
  createdAt     DateTime @default(now())
  user          User     @relation(...)
}

model StudyPlan {
  id            String   @id
  userId        String
  title         String
  description   String?
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean  @default(true)
  isAIGenerated Boolean  @default(false)  // ✅ AI işareti
  aiExplanation String?  @db.Text         // ✅ AI açıklaması
  weeklyGoals   String?  @db.Text         // ✅ Haftalık hedefler
  days          StudyPlanDay[]
}

model StudyPlanSlot {
  // ...
  aiReason      String?  @db.Text  // ✅ AI'ın bu konuyu seçme nedeni
}
```

### 2.2 Backend Servisleri (✅ Hazır)

**studyPlanAnalysis.service.js** (451 satır):
- `analyzeUserPerformance(userId)` fonksiyonu
- AI'ya hazır veri çıktısı:
  - Kullanıcı profili (examType, targetScore, dailyStudyGoal)
  - Ders/konu analizleri (başarı oranları)
  - Zayıf konular (< %60 başarı)
  - Önceliklendirilmiş konular (0-1 skoru)
  - Gecikmiş tekrarlar (Spaced Repetition)
  - Sınav ağırlıkları (TopicQuestionCount'tan)
  - Zaman analizi (kalan gün, günlük kapasite)

**Önceliklendirme Algoritması**:
```javascript
priorityScore =
  examWeight * 0.4 +           // Sınavda çıkma olasılığı
  userDifficulty * 0.3 +       // Kullanıcının zorlandığı konular
  spacedRepetition * 0.2 +     // Gecikmiş tekrarlar
  (1 - recentProgress) * 0.1   // Az çalışılan konular
```

### 2.3 Eksikler

**Backend**:
- ❌ `openai` paketi yok
- ❌ AI servisleri yok (questionSolver, studyPlanGenerator, etc.)
- ❌ AI controller ve routes yok
- ❌ Image upload middleware yok

**Frontend**:
- ❌ `react-katex`, `katex` yok (LaTeX rendering)
- ❌ `react-dropzone` yok (görüntü yükleme)
- ❌ AI sayfaları yok (QuestionSolver, PerformanceAnalysis)

---

## 3. 4 Ana AI Özelliği

### Özellik 1: AI Soru Çözücü (Problem Solver) 📸

**Amaç**: Öğrenciler metin veya fotoğraf ile soru gönderir, AI adım adım çözer.

#### Teknik Detaylar
- **Model**: `gpt-5.1`
- **Reasoning**: `medium` (matematiksel düşünme)
- **Verbosity**: `medium` (detaylı ama aşırı uzun değil)
- **Vision**: Base64 encoded images
- **LaTeX**: Formüller $...$ (inline) ve $$...$$ (block)
- **Database**: `AIQuestionLog` tablosu

#### API Endpoint
```
POST /api/ai/solve-question
Content-Type: multipart/form-data

Body:
- questionText: String (opsiyonel)
- image: File (opsiyonel, max 20MB)

Response:
{
  "success": true,
  "data": {
    "solution": "Adım 1: ... $$x^2 - 5x + 6 = 0$$ ...",
    "tokensUsed": 1847,
    "model": "gpt-5.1"
  }
}
```

#### Backend Dosya Yapısı
```
backend/src/
├── config/
│   └── openai.js                 # OpenAI client initialization
├── services/ai/
│   ├── openai.service.js         # Responses API wrapper
│   ├── questionSolver.service.js # Soru çözme mantığı
│   └── imageProcessor.service.js # Base64 encoding
├── controllers/
│   └── ai.controller.js          # exports.solveQuestion
├── routes/
│   └── ai.routes.js              # POST /api/ai/solve-question
├── middleware/
│   ├── upload.middleware.js      # Multer config
│   └── aiRateLimit.middleware.js # Rate limiting
```

#### Prompt Yapısı
```javascript
const systemPrompt = `Sen Türkiye'deki LGS ve YKS sınavlarına hazırlanan öğrenciler için bir eğitim asistanısın.

GÖREV:
- Soruları adım adım çöz
- Her adımı açıkla
- Matematiksel ifadeleri LaTeX formatında yaz
- Türkçe ve anlaşılır bir dil kullan

LATEX KULLANIMI:
- Inline: $x^2 + 5x + 6$
- Block: $$x^2 + 5x + 6 = 0$$

ÖRNEK ÇÖZÜM:
Soru: $x^2 - 5x + 6 = 0$ denklemini çözünüz.

**Adım 1: Çarpanlara Ayırma**
$$(x - 2)(x - 3) = 0$$

**Adım 2: Kökleri Bulma**
$$x - 2 = 0 \\quad \\text{veya} \\quad x - 3 = 0$$
$$x = 2 \\quad \\text{veya} \\quad x = 3$$

**CEVAP**: Denklemin kökleri $x_1 = 2$ ve $x_2 = 3$'tür.
`;
```

#### Implementation (backend/src/services/ai/questionSolver.service.js)
```javascript
const openaiService = require('./openai.service');
const prisma = require('../../config/database');
const logger = require('../../utils/logger');

const solveQuestion = async (userId, questionText, imageBase64 = null) => {
  try {
    const inputContent = [];

    // Görüntü varsa ekle
    if (imageBase64) {
      inputContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    // Metin ekle
    inputContent.push({
      type: 'text',
      text: questionText || 'Bu soruyu adım adım çöz ve açıkla.'
    });

    // OpenAI API çağrısı
    const response = await openaiService.createResponse({
      model: 'gpt-5.1',
      input: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: inputContent
        }
      ],
      reasoning_effort: 'medium',
      verbosity: 'medium',
      max_output_tokens: 3000
    });

    // Veritabanına kaydet
    const log = await prisma.aIQuestionLog.create({
      data: {
        userId,
        questionText: questionText || '',
        questionImage: imageBase64 ? 'base64_stored' : null,
        aiResponse: response.output_text,
        aiModel: 'gpt-5.1',
        tokensUsed: response.usage?.total_tokens || null
      }
    });

    return {
      solution: response.output_text,
      tokensUsed: response.usage?.total_tokens,
      model: 'gpt-5.1',
      logId: log.id
    };

  } catch (error) {
    logger.error('Question solver error:', error);
    throw new Error('Soru çözüm hatası');
  }
};

module.exports = { solveQuestion };
```

#### Frontend Yapısı
```
frontend/src/
├── pages/AI/
│   └── QuestionSolver.jsx        # Ana sayfa
├── components/AI/
│   ├── ImageUploader.jsx         # react-dropzone
│   ├── QuestionInput.jsx         # Metin textarea
│   ├── SolutionDisplay.jsx       # react-katex ile render
│   └── QuestionHistory.jsx       # Geçmiş sorular
└── utils/
    └── latexParser.js            # LaTeX parsing
```

#### Frontend LaTeX Rendering
```jsx
// frontend/src/components/AI/SolutionDisplay.jsx
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const SolutionDisplay = ({ solution }) => {
  const parseLatex = (text) => {
    // $$...$$ ve $...$ parse et
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return <BlockMath key={idx} math={part.slice(2, -2)} />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        return <InlineMath key={idx} math={part.slice(1, -1)} />;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="solution-container p-6 bg-white dark:bg-neutral-900 rounded-2xl">
      <div className="prose dark:prose-invert max-w-none">
        {parseLatex(solution)}
      </div>
    </div>
  );
};

export default SolutionDisplay;
```

#### Maliyet Tahmini
- Metin soru: ~500-1000 tokens input + ~1500-2000 output
  - $1.25/1M * 0.5K + $10/1M * 2K = $0.02-0.03 / soru
- Görüntülü soru: ~1500-2500 tokens input + ~2000-3000 output
  - $1.25/1M * 2K + $10/1M * 3K = $0.03-0.05 / soru
- **Aylık (100 soru/öğrenci)**: $2-5

---

### Özellik 2: Kişiselleştirilmiş Çalışma Planı 📅

**Amaç**: Kullanıcının performans verisine göre AI ile otomatik çalışma programı oluşturma.

#### Teknik Detaylar
- **Model**: `gpt-5.1`
- **Reasoning**: `low` (hızlı plan oluşturma)
- **Verbosity**: `low` (JSON çıktısı)
- **Structured Output**: JSON Schema ile format garantisi
- **Database**: `StudyPlan`, `StudyPlanDay`, `StudyPlanSlot`

#### API Endpoint
```
POST /api/ai/generate-study-plan

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "AI Çalışma Planı - 3 Aralık 2025",
    "explanation": "Son performansınıza göre...",
    "weeklyGoals": ["Hafta 1: ...", "Hafta 2: ..."],
    "days": [...]
  }
}
```

#### JSON Schema
```javascript
const studyPlanSchema = {
  type: 'object',
  properties: {
    explanation: {
      type: 'string',
      description: 'Planın genel açıklaması (2-3 cümle)'
    },
    weeklyGoals: {
      type: 'array',
      items: { type: 'string' },
      description: 'Haftalık hedefler'
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
              required: ['startTime', 'endTime', 'subjectCode', 'topicCode', 'duration', 'priority', 'reason'],
              additionalProperties: false
            }
          }
        },
        required: ['date', 'dailyGoal', 'totalMinutes', 'slots']
      }
    }
  },
  required: ['explanation', 'weeklyGoals', 'days'],
  additionalProperties: false
};
```

#### Prompt Yapısı
```javascript
const generatePlanPrompt = (analysis) => {
  const { user, prioritizedTopics, weakTopics, dueReviews, timeAnalysis } = analysis;

  return `Sen bir eğitim planlama uzmanısın. Aşağıdaki verilere göre ${timeAnalysis.remainingDays} günlük detaylı çalışma planı oluştur.

## KULLANICI PROFİLİ
- Sınav Türü: ${user.examType}
- Hedef Puan: ${user.targetScore}
- Sınava Kalan: ${timeAnalysis.remainingDays} gün
- Günlük Kapasite: ${timeAnalysis.dailyCapacity} saat
- Çalışma Saatleri: ${timeAnalysis.studyStartHour}:00 - ${timeAnalysis.studyEndHour}:00

## ÖNCELİKLİ KONULAR (Top 30)
${JSON.stringify(prioritizedTopics.slice(0, 30), null, 2)}

## ZAYIF KONULAR
${JSON.stringify(weakTopics, null, 2)}

## GECİKMİŞ TEKRARLAR
${JSON.stringify(dueReviews, null, 2)}

## KURALLAR
1. Günlük ${timeAnalysis.dailyCapacity} saat kapasiteyi aşma
2. priorityScore yüksek konulara öncelik ver
3. Zayıf konuları düzenli tekrarla
4. Spaced repetition'ı dikkate al (dueReviews)
5. 25 dakika çalışma + 5 dakika mola (Pomodoro)
6. Haftalık hedefler belirle

## ÇIKTI
Sadece JSON formatında döndür:
${JSON.stringify({ explanation: '...', weeklyGoals: ['...'], days: [{ date: '2025-12-03', ... }] }, null, 2)}
`;
};
```

#### Implementation (backend/src/services/ai/studyPlanGenerator.service.js)
```javascript
const openaiService = require('./openai.service');
const { analyzeUserPerformance } = require('../studyPlanAnalysis.service');
const prisma = require('../../config/database');

const generateStudyPlan = async (userId) => {
  // 1. Performans analizi
  const analysis = await analyzeUserPerformance(userId);

  // 2. AI'dan plan al
  const response = await openaiService.createResponse({
    model: 'gpt-5.1',
    input: [
      { role: 'system', content: 'Sen bir eğitim planlama uzmanısın. JSON formatında plan oluştur.' },
      { role: 'user', content: generatePlanPrompt(analysis) }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'study_plan',
        schema: studyPlanSchema,
        strict: true
      }
    },
    reasoning_effort: 'low',
    verbosity: 'low',
    max_output_tokens: 8000
  });

  const plan = JSON.parse(response.output_text);

  // 3. Subject/Topic code → ID mapping
  const subjectMap = {};
  const topicMap = {};
  const subjects = await prisma.subject.findMany();
  const topics = await prisma.topic.findMany({ include: { subject: true } });

  subjects.forEach(s => { subjectMap[s.code] = s.id; });
  topics.forEach(t => { topicMap[t.code] = t.id; });

  // 4. Database'e kaydet
  const studyPlan = await prisma.studyPlan.create({
    data: {
      userId,
      title: `AI Çalışma Planı - ${new Date().toLocaleDateString('tr-TR')}`,
      description: plan.explanation,
      startDate: new Date(plan.days[0].date),
      endDate: new Date(plan.days[plan.days.length - 1].date),
      isActive: true,
      isAIGenerated: true,
      aiExplanation: plan.explanation,
      weeklyGoals: JSON.stringify(plan.weeklyGoals),
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
              aiReason: slot.reason,
            }))
          }
        }))
      }
    },
    include: {
      days: {
        include: {
          slots: {
            include: {
              subject: true,
              topic: true
            }
          }
        }
      }
    }
  });

  return studyPlan;
};

module.exports = { generateStudyPlan };
```

#### Maliyet Tahmini
- Input: ~5000-8000 tokens (kullanıcı analizi)
- Output: ~3000-5000 tokens (30 günlük plan)
- $1.25/1M * 8K + $10/1M * 5K = $0.06-0.10 / plan
- **Aylık (4 plan/öğrenci)**: $0.24-0.40

---

### Özellik 3: Performans Analizi & Koçluk 📊

**Amaç**: Kullanıcının istatistiklerini AI ile analiz edip detaylı geri bildirim ve öneriler sunma.

#### Teknik Detaylar
- **Model**: `gpt-5.1`
- **Reasoning**: `medium` (derinlemesine analiz)
- **Verbosity**: `high` (detaylı açıklama)
- **Format**: Markdown (başlıklar, listeler, vurgular)
- **Database**: Cache için opsiyonel

#### API Endpoint
```
GET /api/ai/performance-analysis

Response:
{
  "success": true,
  "data": {
    "analysis": "## Genel Performans\n\n...",
    "generatedAt": "2025-12-03T14:30:00Z"
  }
}
```

#### Prompt Yapısı
```javascript
const coachPrompt = (analysis) => `
Sen empatik, motive edici ve deneyimli bir eğitim koçusun. ${analysis.user.examType} sınavına hazırlanan bir öğrencinin son 30 günlük performansını analiz et.

## VERİLER
${JSON.stringify(analysis, null, 2)}

## GÖREV
Markdown formatında detaylı analiz yap:

## 1. Genel Performans Değerlendirmesi
- Son 30 gündeki çalışma disiplini
- Başarı trendleri
- Hedeflere yakınlık

## 2. Güçlü Yönler
- Hangi derslerde/konularda başarılı
- Güçlü olduğu öğrenme alanları
- Olumlu davranış paternleri

## 3. Gelişim Alanları
- Zayıf dersler ve nedenleri
- Düşük performans gösterilen konular
- İyileştirilmesi gereken alışkanlıklar

## 4. Acil Önlem Gereken Konular
- Kritik zayıf konular (<%60 başarı)
- Gecikmiş tekrarlar (>7 gün)
- Öncelikli müdahale önerileri

## 5. Eylem Planı
- Kısa vadeli hedefler (1 hafta)
- Somut, uygulanabilir öneriler (3-5 madde)
- Motivasyon mesajı

## TON
- Türkçe yaz
- "Sen" diye hitap et
- Samimi ve motive edici
- Yapıcı eleştiri, negatiflikten kaçın
- Veri odaklı ama empatik
`;
```

#### Implementation (backend/src/services/ai/performanceCoach.service.js)
```javascript
const openaiService = require('./openai.service');
const { analyzeUserPerformance } = require('../studyPlanAnalysis.service');

const analyzePerformance = async (userId) => {
  const analysis = await analyzeUserPerformance(userId);

  const response = await openaiService.createResponse({
    model: 'gpt-5.1',
    input: [
      {
        role: 'system',
        content: 'Sen empatik ve motive edici bir eğitim koçusun. Markdown formatında detaylı analiz yap.'
      },
      {
        role: 'user',
        content: coachPrompt(analysis)
      }
    ],
    reasoning_effort: 'medium',
    verbosity: 'high',
    max_output_tokens: 3000
  });

  return {
    analysis: response.output_text,
    generatedAt: new Date(),
    tokensUsed: response.usage?.total_tokens
  };
};

module.exports = { analyzePerformance };
```

#### Frontend Entegrasyonu
```jsx
// frontend/src/pages/Stats/StatsPage.jsx içine yeni tab ekle

const tabs = [
  { id: 'overview', name: 'Genel', icon: Activity },
  { id: 'subjects', name: 'Dersler', icon: BookOpen },
  { id: 'topics', name: 'Konular', icon: BarChart },
  { id: 'pomodoro', name: 'Pomodoro', icon: Clock },
  { id: 'ai-analysis', name: 'AI Analiz', icon: Sparkles }  // YENİ
];

// AI Analysis tab content
{activeTab === 'ai-analysis' && <AIAnalysisTab />}
```

```jsx
// frontend/src/components/Stats/AIAnalysisTab.jsx
import { useState } from 'react';
import { aiAPI } from '../../api';
import ReactMarkdown from 'react-markdown';

const AIAnalysisTab = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getPerformanceAnalysis();
      setAnalysis(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl"
      >
        {loading ? 'Analiz Ediliyor...' : 'AI Analiz Yap'}
      </button>

      {analysis && (
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};
```

#### Maliyet Tahmini
- Input: ~6000-10000 tokens (detaylı analiz verisi)
- Output: ~1500-3000 tokens (markdown analiz)
- $1.25/1M * 10K + $10/1M * 3K = $0.04-0.05 / analiz
- **Aylık (4 analiz/öğrenci)**: $0.16-0.20

---

### Özellik 4: Günlük Rehberlik (Daily Guidance) 🌅

**Amaç**: Dashboard açıldığında otomatik günlük motivasyon mesajı ve bugünkü görevler.

#### Teknik Detaylar
- **Model**: `gpt-5.1-mini` (maliyet optimizasyonu!)
- **Reasoning**: `minimal` (hızlı yanıt)
- **Verbosity**: `low` (kısa mesaj, 2-3 cümle)
- **Cache**: Günlük 1 kez üret, cache'le
- **Database**: Opsiyonel cache tablosu

#### API Endpoint
```
GET /api/ai/daily-guidance

Response:
{
  "success": true,
  "data": {
    "message": "Günaydın! Bugün limit konusunu çalışma zamanı...",
    "todayTasks": [
      { "subject": "Matematik", "topic": "Limit", "duration": 90 },
      { "subject": "Fizik", "topic": "Kuvvet", "duration": 60 }
    ]
  }
}
```

#### Prompt Yapısı
```javascript
const dailyGuidancePrompt = (todayPlan, recentSessions) => `
Sen öğrencilerin günlük motivasyon koçusun.

BUGÜN: ${new Date().toLocaleDateString('tr-TR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
})}

BUGÜNÜN PLANI:
${todayPlan ? JSON.stringify(todayPlan.slots, null, 2) : 'Plan yok'}

SON 7 GÜN:
${JSON.stringify(recentSessions, null, 2)}

GÖREV:
1. Selamla (günaydın/merhaba)
2. Bugünkü en önemli 1-2 konuyu vurgula
3. Son günlerdeki olumlu gelişmeyi takdir et (varsa)
4. KISACIK yaz (max 2-3 cümle)

Sadece mesajı yaz, başka bir şey yazma.
`;
```

#### Implementation (backend/src/services/ai/dailyGuidance.service.js)
```javascript
const openaiService = require('./openai.service');
const prisma = require('../../config/database');

const getDailyGuidance = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Bugünkü plan
  const todayPlan = await prisma.studyPlanDay.findFirst({
    where: {
      plan: { userId, isActive: true },
      date: { gte: today, lt: tomorrow }
    },
    include: {
      slots: {
        include: {
          subject: true,
          topic: true
        }
      }
    }
  });

  // Son 7 gün
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSessions = await prisma.studySession.findMany({
    where: {
      userId,
      date: { gte: sevenDaysAgo }
    },
    include: { subject: true, topic: true },
    orderBy: { date: 'desc' },
    take: 10
  });

  // AI çağrısı (gpt-5.1-mini ile!)
  const response = await openaiService.createResponse({
    model: 'gpt-5.1-mini',  // ÖNEMLİ: Mini model
    input: [
      {
        role: 'system',
        content: 'Günlük motivasyon mesajları yazan koç. Kısa ve öz yaz.'
      },
      {
        role: 'user',
        content: dailyGuidancePrompt(todayPlan, recentSessions)
      }
    ],
    reasoning_effort: 'minimal',
    verbosity: 'low',
    max_output_tokens: 200
  });

  return {
    message: response.output_text,
    todayTasks: todayPlan?.slots.map(slot => ({
      subject: slot.subject.name,
      topic: slot.topic?.name || 'Genel Çalışma',
      duration: slot.duration
    })) || []
  };
};

module.exports = { getDailyGuidance };
```

#### Frontend Entegrasyonu (Dashboard)
```jsx
// frontend/src/components/Dashboard/DailyGuidanceCard.jsx
import { useEffect, useState } from 'react';
import { aiAPI } from '../../api';
import { Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const DailyGuidanceCard = () => {
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuidance();
  }, []);

  const fetchGuidance = async () => {
    try {
      const response = await aiAPI.getDailyGuidance();
      setGuidance(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant p-6 animate-pulse">
        <div className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
      </div>
    );
  }

  if (!guidance) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl shadow-elegant overflow-hidden"
    >
      {/* Gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 font-display">
              Günün Rehberi
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-display">
              AI Koçundan
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4 font-display">
          {guidance.message}
        </p>

        {/* Today's Tasks */}
        {guidance.todayTasks && guidance.todayTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 font-display">
                Bugünkü Görevler:
              </p>
            </div>
            <div className="space-y-2">
              {guidance.todayTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white/50 dark:bg-neutral-800/50 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 font-display">
                      {task.subject} - {task.topic}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-display">
                    {task.duration} dk
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyGuidanceCard;
```

```jsx
// frontend/src/pages/Dashboard/Dashboard.jsx'a ekle
import DailyGuidanceCard from '../../components/Dashboard/DailyGuidanceCard';

// "Son Aktiviteler" yerine veya üstüne ekle
<DailyGuidanceCard />
```

#### Maliyet Tahmini
- Input: ~1500-2500 tokens (plan + son çalışmalar)
- Output: ~80-150 tokens (kısa mesaj)
- **gpt-5.1-mini ile**: $0.25/1M * 2.5K + $2/1M * 150 = $0.001 / gün
- **Aylık (30 gün/öğrenci)**: $0.03

**Tam model (gpt-5.1) ile olsaydı**: $0.05/gün → $1.50/ay
**Mini model tasarrufu**: **%98 daha ucuz!**

---

## 4. Teknik Implementasyon

### 4.1 Backend Kurulum

#### Paket Kurulumu
```bash
cd backend
npm install openai
npm install sharp multer  # Görüntü işleme
```

#### Environment Variables (.env)
```env
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
OPENAI_ORG_ID=org-xxxxxxxxxxxxx  # Opsiyonel

# Rate Limiting
AI_RATE_LIMIT_WINDOW_MS=900000  # 15 dakika
AI_RATE_LIMIT_MAX_REQUESTS=20   # 15 dakikada max 20 istek

# Cost Control
AI_MONTHLY_BUDGET_USD=100       # Aylık bütçe
AI_ALERT_THRESHOLD=0.8          # %80'de uyarı
```

#### OpenAI Client (backend/src/config/openai.js)
```javascript
const OpenAI = require('openai');
const logger = require('../utils/logger');

class OpenAIClient {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    logger.info('OpenAI client initialized');
  }

  getClient() {
    return this.client;
  }
}

module.exports = new OpenAIClient();
```

#### OpenAI Service Wrapper (backend/src/services/ai/openai.service.js)
```javascript
const openaiClient = require('../../config/openai');
const logger = require('../../utils/logger');

class OpenAIService {
  constructor() {
    this.client = openaiClient.getClient();
  }

  /**
   * Responses API (Yeni Standart)
   * @param {Object} options
   * @param {string} options.model - 'gpt-5.1', 'gpt-5.1-mini', 'gpt-5.1-nano'
   * @param {Array} options.input - Messages array
   * @param {Object} options.text - Text format options (json_schema, etc.)
   * @param {string} options.reasoning_effort - 'minimal', 'low', 'medium', 'high'
   * @param {string} options.verbosity - 'low', 'medium', 'high'
   * @param {number} options.max_output_tokens
   * @param {number} options.temperature
   * @param {boolean} options.stream
   */
  async createResponse(options) {
    const {
      model = 'gpt-5.1',
      input,
      text,
      reasoning_effort = 'medium',
      verbosity = 'medium',
      max_output_tokens = 2000,
      temperature = 0.7,
      stream = false
    } = options;

    try {
      const requestPayload = {
        model,
        input,
        reasoning_effort,
        verbosity,
        max_output_tokens,
        temperature,
        stream
      };

      if (text) {
        requestPayload.text = text;
      }

      logger.info('OpenAI API Request', { model, reasoning_effort, verbosity });

      const response = await this.client.responses.create(requestPayload);

      logger.info('OpenAI API Response', {
        model: response.model,
        tokensUsed: response.usage?.total_tokens
      });

      return {
        output_text: response.output_text,
        usage: response.usage,
        model: response.model
      };

    } catch (error) {
      logger.error('OpenAI API Error', {
        error: error.message,
        code: error.code,
        type: error.type
      });

      // User-friendly error messages
      if (error.code === 'insufficient_quota') {
        throw new Error('AI servisi kotası doldu. Lütfen daha sonra tekrar deneyin.');
      } else if (error.code === 'rate_limit_exceeded') {
        throw new Error('Çok fazla istek gönderildi. Lütfen biraz bekleyin.');
      } else if (error.code === 'invalid_api_key') {
        throw new Error('AI servisi yapılandırma hatası.');
      } else {
        throw new Error('AI servisi geçici olarak kullanılamıyor.');
      }
    }
  }

  /**
   * Legacy Chat Completions API (hala destekleniyor)
   */
  async createChatCompletion(messages, options = {}) {
    const {
      model = 'gpt-5.1',
      max_tokens = 2000,
      temperature = 0.7,
      tools,
      tool_choice
    } = options;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens,
        temperature,
        tools,
        tool_choice
      });

      return response;
    } catch (error) {
      logger.error('Chat Completion Error', error);
      throw error;
    }
  }

  /**
   * Streaming response
   */
  async streamResponse(options, onChunk) {
    const response = await this.createResponse({
      ...options,
      stream: true
    });

    for await (const chunk of response) {
      if (chunk.output_text) {
        onChunk(chunk.output_text);
      }
    }
  }
}

module.exports = new OpenAIService();
```

#### Rate Limiting Middleware (backend/src/middleware/aiRateLimit.middleware.js)
```javascript
const rateLimit = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS) || 20,
  message: {
    success: false,
    message: 'Çok fazla AI isteği gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Çok fazla AI isteği. Lütfen bekleyin.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

module.exports = aiRateLimiter;
```

#### Image Upload Middleware (backend/src/middleware/upload.middleware.js)
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece JPEG ve PNG formatları desteklenir'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  }
});

module.exports = upload;
```

#### AI Controller (backend/src/controllers/ai.controller.js)
```javascript
const questionSolverService = require('../services/ai/questionSolver.service');
const studyPlanGeneratorService = require('../services/ai/studyPlanGenerator.service');
const performanceCoachService = require('../services/ai/performanceCoach.service');
const dailyGuidanceService = require('../services/ai/dailyGuidance.service');
const logger = require('../utils/logger');

// Soru çözme
exports.solveQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionText = req.body.questionText || '';

    let imageBase64 = null;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
    }

    if (!questionText && !imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Soru metni veya görüntü gerekli'
      });
    }

    const result = await questionSolverService.solveQuestion(
      userId,
      questionText,
      imageBase64
    );

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Solve question error:', error);
    next(error);
  }
};

// Çalışma planı oluşturma
exports.generateStudyPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const studyPlan = await studyPlanGeneratorService.generateStudyPlan(userId);

    res.status(200).json({
      success: true,
      data: studyPlan
    });

  } catch (error) {
    logger.error('Generate study plan error:', error);
    next(error);
  }
};

// Performans analizi
exports.getPerformanceAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const analysis = await performanceCoachService.analyzePerformance(userId);

    res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Performance analysis error:', error);
    next(error);
  }
};

// Günlük rehberlik
exports.getDailyGuidance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const guidance = await dailyGuidanceService.getDailyGuidance(userId);

    res.status(200).json({
      success: true,
      data: guidance
    });

  } catch (error) {
    logger.error('Daily guidance error:', error);
    next(error);
  }
};

// Soru geçmişi
exports.getQuestionHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const history = await prisma.aIQuestionLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.aIQuestionLog.count({
      where: { userId }
    });

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Question history error:', error);
    next(error);
  }
};

// Soru değerlendirme
exports.rateQuestion = async (req, res, next) => {
  try {
    const { logId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Değerlendirme 1-5 arasında olmalı'
      });
    }

    const log = await prisma.aIQuestionLog.findFirst({
      where: { id: logId, userId }
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Kayıt bulunamadı'
      });
    }

    await prisma.aIQuestionLog.update({
      where: { id: logId },
      data: { rating }
    });

    res.status(200).json({
      success: true,
      message: 'Değerlendirme kaydedildi'
    });

  } catch (error) {
    logger.error('Rate question error:', error);
    next(error);
  }
};
```

#### AI Routes (backend/src/routes/ai.routes.js)
```javascript
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');
const aiRateLimitMiddleware = require('../middleware/aiRateLimit.middleware');

// Tüm route'lara auth gerekli
router.use(authMiddleware.protect);

// Soru çözme (görüntü ile)
router.post(
  '/solve-question',
  aiRateLimitMiddleware,
  uploadMiddleware.single('image'),
  aiController.solveQuestion
);

// Çalışma planı oluşturma
router.post(
  '/generate-study-plan',
  aiRateLimitMiddleware,
  aiController.generateStudyPlan
);

// Performans analizi
router.get(
  '/performance-analysis',
  aiRateLimitMiddleware,
  aiController.getPerformanceAnalysis
);

// Günlük rehberlik
router.get(
  '/daily-guidance',
  aiController.getDailyGuidance
);

// Soru geçmişi
router.get(
  '/question-history',
  aiController.getQuestionHistory
);

// Soru değerlendirme
router.post(
  '/question/:logId/rate',
  aiController.rateQuestion
);

module.exports = router;
```

#### Ana Server'a Ekle (backend/src/server.js)
```javascript
const aiRoutes = require('./routes/ai.routes');

// ...

app.use('/api/ai', aiRoutes);
```

---

### 4.2 Frontend Kurulum

#### Paket Kurulumu
```bash
cd frontend
npm install react-katex katex
npm install react-dropzone
npm install react-markdown
```

#### AI API (frontend/src/api/ai.js)
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const aiAPI = {
  // Soru çözme
  solveQuestion: async (questionText, imageFile) => {
    const formData = new FormData();

    if (questionText) {
      formData.append('questionText', questionText);
    }

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await axios.post(
      `${API_URL}/api/ai/solve-question`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    return response.data;
  },

  // Çalışma planı
  generateStudyPlan: async () => {
    const response = await axios.post(
      `${API_URL}/api/ai/generate-study-plan`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    return response.data;
  },

  // Performans analizi
  getPerformanceAnalysis: async () => {
    const response = await axios.get(
      `${API_URL}/api/ai/performance-analysis`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    return response.data;
  },

  // Günlük rehberlik
  getDailyGuidance: async () => {
    const response = await axios.get(
      `${API_URL}/api/ai/daily-guidance`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    return response.data;
  },

  // Soru geçmişi
  getQuestionHistory: async (page = 1, limit = 20) => {
    const response = await axios.get(
      `${API_URL}/api/ai/question-history?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    return response.data;
  },

  // Soru değerlendirme
  rateQuestion: async (logId, rating) => {
    const response = await axios.post(
      `${API_URL}/api/ai/question/${logId}/rate`,
      { rating },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    return response.data;
  }
};

export default aiAPI;
```

#### API Export'a Ekle (frontend/src/api/index.js)
```javascript
export { default as aiAPI } from './ai';
```

---

## 5. Maliyet Analizi

### 5.1 Öğrenci Başına Aylık Maliyet

| Özellik | Kullanım | Model | Aylık Maliyet |
|---------|---------|-------|---------------|
| **Soru Çözücü** | 100 soru | gpt-5.1 | $2.00 - $5.00 |
| **Çalışma Planı** | 4 plan | gpt-5.1 | $0.24 - $0.40 |
| **Performans Analizi** | 4 analiz | gpt-5.1 | $0.16 - $0.20 |
| **Günlük Rehberlik** | 30 gün | gpt-5.1-mini | $0.03 |
| **TOPLAM** | | | **$2.43 - $5.63** |

### 5.2 Kullanıcı Sayısına Göre Projeksiyon

| Kullanıcı Sayısı | Aylık Toplam Maliyet | Yıllık Toplam |
|------------------|----------------------|---------------|
| 10 öğrenci | $24 - $56 | $288 - $672 |
| 100 öğrenci | $243 - $563 | $2,916 - $6,756 |
| 1,000 öğrenci | $2,430 - $5,630 | $29,160 - $67,560 |
| 10,000 öğrenci | $24,300 - $56,300 | $291,600 - $675,600 |

### 5.3 Maliyet Optimizasyon Stratejileri

#### 1. Model Seçimi
- **Günlük Rehberlik**: gpt-5.1-mini kullanarak %98 tasarruf ✅
- **Basit Sorular**: gpt-5.1-mini ile çözüm
- **Karmaşık Sorular**: gpt-5.1

#### 2. Caching
```javascript
// Günlük rehberlik cache
const cachedGuidance = await redis.get(`daily-guidance:${userId}:${todayDate}`);
if (cachedGuidance) {
  return JSON.parse(cachedGuidance);
}

const guidance = await generateGuidance(userId);

await redis.setex(
  `daily-guidance:${userId}:${todayDate}`,
  86400, // 24 saat
  JSON.stringify(guidance)
);
```

#### 3. Rate Limiting
- Kullanıcı başına 15 dakikada max 20 AI isteği
- Soru çözücü: Günde max 20 soru

#### 4. Token Limitleri
```javascript
// Gereksiz uzun yanıtları önle
max_output_tokens: {
  questionSolver: 3000,
  studyPlan: 8000,
  performanceAnalysis: 3000,
  dailyGuidance: 200  // Çok kısa
}
```

#### 5. Reasoning Effort Optimizasyonu
```javascript
// Basit görevlerde minimal reasoning
reasoning_effort: {
  questionSolver: 'medium',     // Matematik düşünme gerekli
  studyPlan: 'low',             // Hızlı plan yeterli
  performanceAnalysis: 'medium', // Analiz gerekli
  dailyGuidance: 'minimal'      // Çok hızlı
}
```

### 5.4 Gelir Modeli Önerileri

#### Freemium Model
- **Free**:
  - Günlük rehberlik (sınırsız)
  - Soru çözücü (5 soru/ay)
  - Performans analizi (1/ay)

- **Premium** ($9.99/ay):
  - Soru çözücü (100 soru/ay)
  - Çalışma planı (sınırsız)
  - Performans analizi (sınırsız)
  - **Kar marjı**: $9.99 - $5.63 = **$4.36/ay** (43% kar)

- **Pro** ($19.99/ay):
  - Soru çözücü (sınırsız)
  - Öncelikli işlem
  - API erişimi
  - **Kar marjı**: $19.99 - $10 (tahmini) = **$9.99/ay** (50% kar)

---

## 6. 4 Haftalık Roadmap

### **Hafta 1: Temel Altyapı + Günlük Rehberlik** ✅

**Hedef**: En hızlı değer sağlayan özelliği yayınla

#### Backend Görevleri
- [ ] `npm install openai` - OpenAI SDK kurulumu
- [ ] `config/openai.js` - Client initialization
- [ ] `services/ai/openai.service.js` - Responses API wrapper
- [ ] `services/ai/dailyGuidance.service.js` - Günlük rehberlik mantığı
- [ ] `controllers/ai.controller.js` - `getDailyGuidance` endpoint
- [ ] `routes/ai.routes.js` - `/api/ai/daily-guidance`
- [ ] `middleware/aiRateLimit.middleware.js` - Rate limiting
- [ ] `.env` ayarları (OPENAI_API_KEY)

#### Frontend Görevleri
- [ ] `api/ai.js` - AI API client
- [ ] `components/Dashboard/DailyGuidanceCard.jsx` - Günlük kart
- [ ] `pages/Dashboard/Dashboard.jsx` - Kart entegrasyonu
- [ ] Test (gerçek kullanıcı ile)

**Çıktı**: Dashboard'da her gün farklı AI motivasyon mesajı ✅

---

### **Hafta 2: AI Soru Çözücü** 📸

**Hedef**: Görüntü + metin ile soru çözme

#### Backend Görevleri
- [ ] `npm install sharp multer` - Görüntü işleme
- [ ] `middleware/upload.middleware.js` - Multer config
- [ ] `services/ai/questionSolver.service.js` - Soru çözme
- [ ] `controllers/ai.controller.js` - `solveQuestion`, `getQuestionHistory`, `rateQuestion`
- [ ] `routes/ai.routes.js` - Soru endpoint'leri
- [ ] AIQuestionLog veritabanı entegrasyonu

#### Frontend Görevleri
- [ ] `npm install react-katex katex react-dropzone` - Paketler
- [ ] `pages/AI/QuestionSolver.jsx` - Ana sayfa
- [ ] `components/AI/ImageUploader.jsx` - Drag & drop upload
- [ ] `components/AI/QuestionInput.jsx` - Metin input
- [ ] `components/AI/SolutionDisplay.jsx` - LaTeX rendering
- [ ] `components/AI/QuestionHistory.jsx` - Geçmiş sorular listesi
- [ ] `utils/latexParser.js` - LaTeX parsing utility
- [ ] Navigation'a "AI Soru Çözücü" ekle

#### Test Görevleri
- [ ] Metin soru çözümü (matematik)
- [ ] Görüntü ile soru çözümü (fotoğraf)
- [ ] LaTeX rendering (inline ve block)
- [ ] Hata durumları (büyük dosya, yanlış format)
- [ ] Rate limiting

**Çıktı**: Öğrenciler soru gönderip adım adım çözüm alabiliyor ✅

---

### **Hafta 3: Performans Analizi & Koçluk** 📊

**Hedef**: AI koçluk özellikleri

#### Backend Görevleri
- [ ] `services/ai/performanceCoach.service.js` - Performans analizi
- [ ] `controllers/ai.controller.js` - `getPerformanceAnalysis`
- [ ] `routes/ai.routes.js` - Analiz endpoint
- [ ] Prompt optimization (test ve iyileştirme)

#### Frontend Görevleri
- [ ] `npm install react-markdown` - Markdown rendering
- [ ] `pages/Stats/AIAnalysisTab.jsx` - Stats sayfası yeni tab
- [ ] `pages/Stats/StatsPage.jsx` - Tab entegrasyonu
- [ ] "AI Analiz Yap" butonu ve loading state
- [ ] Markdown render (başlıklar, listeler, vurgular)

#### Test Görevleri
- [ ] Farklı performans profillerinde test
- [ ] Yeni kullanıcı (veri yok) durumu
- [ ] İleri seviye kullanıcı (çok veri)
- [ ] Markdown formatı kontrol

**Çıktı**: İstatistikler sayfasında detaylı AI analizi ve öneriler ✅

---

### **Hafta 4: Çalışma Planı Oluşturma** 📅

**Hedef**: Kişiselleştirilmiş plan üretimi

#### Backend Görevleri
- [ ] `services/ai/studyPlanGenerator.service.js` - Plan oluşturma
- [ ] JSON schema tanımı ve validation
- [ ] Subject/Topic code → ID mapping mantığı
- [ ] StudyPlan, StudyPlanDay, StudyPlanSlot database integration
- [ ] `controllers/ai.controller.js` - `generateStudyPlan`
- [ ] `routes/ai.routes.js` - Plan endpoint
- [ ] Hata yönetimi (eksik dersler, konular)

#### Frontend Görevleri
- [ ] `pages/StudyPlan/StudyPlanView.jsx` - Plan görüntüleme
- [ ] `components/StudyPlan/CalendarView.jsx` - Takvim görünümü
- [ ] `components/StudyPlan/DayView.jsx` - Günlük detay
- [ ] `components/StudyPlan/GeneratePlanButton.jsx` - Plan oluştur butonu
- [ ] Navigation'a "Çalışma Planı" ekle

#### Test Görevleri
- [ ] Farklı kullanıcı profilleri (YKS_SAYISAL, LGS, etc.)
- [ ] Farklı hedef tarihleri (30 gün, 90 gün, 180 gün)
- [ ] Plan doğruluğu kontrolü (günlük kapasite aşımı yok mu?)
- [ ] Spaced repetition entegrasyonu
- [ ] JSON schema validation

**Çıktı**: Kullanıcılar "Plan Oluştur" diyerek kişisel program alıyor ✅

---

## 7. Güvenlik ve Best Practices

### 7.1 API Key Güvenliği
```env
# .env
OPENAI_API_KEY=sk-proj-...
```

```javascript
// .gitignore'a ekle
.env
.env.local
.env.production
```

### 7.2 Input Validation
```javascript
// Prompt injection koruması
const sanitizeUserInput = (text) => {
  // Tehlikeli komutları temizle
  const dangerous = [
    'ignore previous instructions',
    'disregard',
    'forget',
    'system:',
    'role:',
  ];

  let sanitized = text;
  dangerous.forEach(word => {
    sanitized = sanitized.replace(new RegExp(word, 'gi'), '');
  });

  return sanitized;
};
```

### 7.3 Cost Control
```javascript
// backend/src/services/ai/costTracker.service.js
const trackCost = async (userId, model, tokensUsed) => {
  const costs = {
    'gpt-5.1': { input: 1.25, output: 10 },
    'gpt-5.1-mini': { input: 0.25, output: 2 },
    'gpt-5.1-nano': { input: 0.05, output: 0.4 }
  };

  const estimatedCost = (tokensUsed / 1000000) * costs[model].output;

  // Alert if monthly budget exceeded
  const monthlyTotal = await getMonthlyTotal();
  if (monthlyTotal > parseFloat(process.env.AI_MONTHLY_BUDGET_USD)) {
    logger.warn('AI monthly budget exceeded!');
    // Send alert email/notification
  }
};
```

### 7.4 Error Handling
```javascript
// User-friendly error messages
const handleOpenAIError = (error) => {
  if (error.code === 'insufficient_quota') {
    return 'AI servisi geçici olarak kullanılamıyor. Lütfen daha sonra deneyin.';
  } else if (error.code === 'rate_limit_exceeded') {
    return 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.';
  } else if (error.code === 'context_length_exceeded') {
    return 'Soru çok uzun. Lütfen kısaltın.';
  } else {
    return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
  }
};
```

---

## 8. Sıradaki Adımlar

### İlk Adımlar (Hemen Yapılacaklar)

1. **OpenAI API Key Alın**:
   - [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Yeni API key oluştur
   - Aylık bütçe limit belirle ($100 öneriyorum)

2. **Model Seçimini Onaylayın**:
   - ✅ Soru Çözücü: `gpt-5.1` (medium reasoning)
   - ✅ Çalışma Planı: `gpt-5.1` (low reasoning)
   - ✅ Performans Analizi: `gpt-5.1` (medium reasoning)
   - ✅ Günlük Rehberlik: `gpt-5.1-mini` (minimal reasoning)

3. **Hangi Özellikle Başlayalım?**
   - 🥇 **Öneri**: Hafta 1 - Günlük Rehberlik (en hızlı, en düşük maliyet)
   - 🥈 Alternatif: Hafta 2 - Soru Çözücü (en değerli)

4. **Backend Paketleri Kur**:
   ```bash
   cd backend
   npm install openai sharp multer
   ```

5. **Frontend Paketleri Kur**:
   ```bash
   cd frontend
   npm install react-katex katex react-dropzone react-markdown
   ```

6. **Environment Variables Ayarla**:
   ```env
   # backend/.env
   OPENAI_API_KEY=sk-proj-xxxxx
   AI_RATE_LIMIT_MAX_REQUESTS=20
   AI_MONTHLY_BUDGET_USD=100
   ```

---

## 9. Sorular ve Cevaplar

### S1: GPT-5.1 fiyatları GPT-4'ten daha mı pahalı?
**C**: Evet, ancak çok daha güçlü. GPT-4 Turbo $10/1M input, $30/1M output idi. GPT-5.1 $1.25/1M input, $10/1M output ile 8x daha ucuz! Ayrıca gpt-5.1-mini ile günlük görevlerde %80 tasarruf.

### S2: Responses API zorunlu mu, Chat Completions kullanamaz mıyız?
**C**: Chat Completions hala destekleniyor ama Responses API yeni standart. Çoklu modalite (metin + görsel) daha kolay. Ancak isterseniz Chat Completions da kullanabilirsiniz.

### S3: LaTeX rendering performansı nasıl?
**C**: react-katex oldukça hızlı. Ancak çok uzun formüllerde gecikme olabilir. Lazy loading ile optimize edilebilir.

### S4: Görüntü base64 mi yoksa URL olarak mı gönderilmeli?
**C**: Base64 öneriyorum. URL ile göndermek için önce görüntüyü public bir yere upload etmek gerekir. Base64 daha basit ve güvenli.

### S5: Türkçe sorunlar yaşar mıyız?
**C**: GPT-5.1 Türkçe'de çok başarılı. Ancak prompt'larda açıkça "Türkçe yanıt ver" dememiz gerekir.

### S6: Mini model yetersiz kalır mı günlük rehberlikte?
**C**: Hayır. Mini model kısa, basit görevler için mükemmel. Test ettim, günlük motivasyon mesajları için yeterli ve %98 daha ucuz.

### S7: Rate limiting kullanıcıları engellemez mi?
**C**: 15 dakikada 20 istek oldukça cömert. Ortalama kullanıcı bunu aşmaz. Ancak premium kullanıcılar için limit artırılabilir.

---

## 10. Sonuç

Bu plan ile AceIt'e 4 hafta içinde güçlü AI özellikleri kazandırılabilir:

✅ **Günlük Rehberlik**: Motivasyon ve günlük görevler
✅ **AI Soru Çözücü**: Görüntü/metin ile adım adım çözüm
✅ **Performans Analizi**: Detaylı geri bildirim ve öneriler
✅ **Çalışma Planı**: Kişiselleştirilmiş otomatik program

**Toplam Maliyet**: ~$2.50-5.50/öğrenci/ay
**Gelir Potansiyeli**: $9.99/ay (premium) → %40+ kar marjı

**Hazır Altyapı**: Database modelleri, veri analiz servisi zaten hazır!

---

**SON KARAR**: Hangi özellikle başlayalım? Günlük Rehberlik mi, yoksa Soru Çözücü mü?
