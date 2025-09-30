# AceIt - Sınav Hazırlık ve Takip Uygulaması

Türkiye'deki YKS, KPSS, ALES gibi sınavlara hazırlanan öğrenciler için kapsamlı çalışma takip platformu.

## 🎯 Özellikler

- ✅ Günlük çalışma kaydı ve takibi
- ✅ Deneme sınavı analizi ve trend grafiği
- ✅ Ders ve konu bazlı performans analizi
- ✅ Akıllı çalışma planı önerisi
- ✅ Pomodoro zamanlayıcı
- ✅ Yapay zeka destekli soru çözümü
- ✅ Başarı sistemi ve motivasyon takibi

## 🛠️ Teknoloji Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS + shadcn/ui
- Recharts (grafikler)
- Zustand (state management)

**Backend:**
- Node.js + Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication

## 🚀 Kurulum

### Backend
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenle
npx prisma migrate dev
npm run dev