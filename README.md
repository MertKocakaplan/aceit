# AceIt - Sınav Hazırlık ve Takip Platformu

Türkiye'deki YKS ve LGS sınavlarına hazırlanan öğrenciler için kapsamlı çalışma yönetim platformu.

## Genel Bakış

AceIt, öğrencilerin çalışma seanslarını organize etmelerine, performanslarını takip etmelerine ve yapay zeka destekli öneriler almalarına yardımcı olan full-stack bir web uygulamasıdır.

## Özellikler

### Çalışma Yönetimi
- Günlük çalışma seansı kaydı ve takibi
- Ders ve konu bazlı performans izleme
- AI destekli özelleştirilebilir çalışma planları
- Pomodoro zamanlayıcı ile odaklanma modu
- Çalışma serisi takibi ve hedef yönetimi

### Performans Analizi
- Deneme sınavı sonuç analizi ve trend grafikleri
- Ders bazında performans görselleştirme
- Konu seviyesinde ilerleme takibi
- Altı aylık performans trendleri
- Isı haritası ile detaylı istatistikler

### Yapay Zeka Araçları
- Adım adım açıklamalı akıllı soru çözücü
- AI destekli performans analizi ve öneriler
- Sınav tarihine göre akıllı plan üretimi
- Kişiselleştirilmiş günlük çalışma rehberliği

### Aralıklı Tekrar Sistemi
- SM-2 algoritması ile optimal tekrar zamanlaması
- Tekrar edilmesi gereken konu bildirimleri
- Performansa göre otomatik zorluk ayarı
- 5 aralıklı tekrar planlaması (1, 3, 7, 14, 30 gün)

### Yönetim Paneli
- Rol tabanlı kullanıcı yönetimi
- Sınav yılı yapılandırması
- Konu-soru dağılımı yönetimi
- AI token kullanım takibi ve analitiği
- Sistem geneli istatistik paneli

### Diğer Özellikler
- Sistem tercihi ile senkronize karanlık mod
- Mobil ve masaüstü responsive tasarım
- İstatistik PDF export
- Performans için gerçek zamanlı veri önbellekleme
- Kapsamlı loglama sistemi

## Teknoloji Stack

### Frontend
- **Framework**: React 19.1
- **Build Tool**: Vite 7.1
- **Styling**: Tailwind CSS 3.4
- **Animasyon**: Framer Motion 12.23
- **Grafikler**: Recharts 3.2
- **State Yönetimi**: React Context API
- **Routing**: React Router DOM 7.9
- **HTTP Client**: Axios 1.12
- **Form Yönetimi**: React Hook Form 7.63
- **Matematik**: KaTeX 0.16 + React KaTeX
- **PDF**: jsPDF 3.0 + AutoTable
- **Bildirimler**: Sonner 2.0

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.x
- **ORM**: Prisma 5.x
- **Veritabanı**: PostgreSQL
- **Authentication**: JWT
- **Şifreleme**: bcryptjs
- **Validasyon**: Express Validator
- **Güvenlik**: Helmet, CORS
- **AI**: OpenAI API (GPT-5.1)

## Kurulum

### Gereksinimler
- Node.js 18.x veya üzeri
- PostgreSQL 14.x veya üzeri
- npm veya yarn

### Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenle
npx prisma migrate dev
npx prisma generate
npm run dev
```

**Environment Variables (.env):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@localhost:5432/aceit"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-..."
FRONTEND_URL="http://localhost:5173"
```

Backend `http://localhost:5000` adresinde çalışır.

### Frontend Kurulumu

```bash
cd frontend
npm install
cp .env.example .env
# .env dosyasını düzenle
npm run dev
```

**Environment Variables (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

Frontend `http://localhost:5173` adresinde çalışır.

## Veritabanı Şeması

### Ana Modeller
- **User**: Kullanıcı hesapları ve kimlik doğrulama
- **StudySession**: Çalışma seansı kayıtları
- **StudyPlan**: Günlük planlar ile çalışma planları
- **ExamResult**: Deneme sınavı sonuçları
- **Subject**: Dersler (Matematik, Fizik, vb.)
- **Topic**: Konular
- **TopicStat**: Konu bazında kullanıcı performansı
- **ExamYear**: Sınav yılı yapılandırmaları
- **TopicQuestionCount**: Yıllara göre soru dağılımı
- **SpacedRepetitionEntry**: Aralıklı tekrar verileri
- **AIQuestionLog**: AI soru çözücü kullanım logları
- **PomodoroSession**: Pomodoro zamanlayıcı seansları

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

### Çalışma Seansları
- `GET /api/study-sessions` - Tüm seansları listele
- `POST /api/study-sessions` - Yeni seans oluştur
- `GET /api/study-sessions/:id` - Seans detayları
- `PUT /api/study-sessions/:id` - Seansı güncelle
- `DELETE /api/study-sessions/:id` - Seansı sil

### İstatistikler
- `GET /api/stats/summary` - Dashboard özeti
- `GET /api/stats/overview` - Detaylı istatistikler
- `GET /api/stats/daily/:days` - Günlük çalışma verileri
- `GET /api/stats/exam-countdown` - Sınava kalan gün
- `GET /api/stats/daily-guidance` - AI günlük rehberlik
- `GET /api/stats/ai-analysis` - Performans analizi

### Çalışma Planları
- `GET /api/study-plans` - Tüm planları listele
- `POST /api/study-plans` - Yeni plan oluştur
- `POST /api/study-plans/generate-ai` - AI ile plan oluştur
- `GET /api/study-plans/:id` - Plan detayları
- `GET /api/study-plans/active-daily` - Bugünün aktif planı

### AI Servisleri
- `POST /api/ai/solve-question` - AI ile soru çöz

### Yönetici Endpoints
- `GET /api/admin/stats` - Admin istatistikleri
- `GET /api/admin/users` - Kullanıcıları listele
- `PUT /api/admin/users/:id/role` - Rol güncelle
- `DELETE /api/admin/users/:id` - Kullanıcı sil
- `GET /api/admin/exam-years` - Sınav yıllarını listele
- `POST /api/admin/exam-years` - Sınav yılı oluştur
- `GET /api/admin/topic-questions` - Konu sorularını getir
- `POST /api/admin/topic-questions/bulk` - Toplu güncelle

## Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# dist/ klasöründe output
```

**Backend:**
```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
```
