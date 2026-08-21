<div align="center">
  <img src="https://img.icons8.com/?size=512&id=5P80hQ3jX5z2&format=png" width="120" alt="FocusFlow Logo"/>
  <h1>🚀 FocusFlow</h1>
  <p><strong>Odaklan. Başla. Başarılara Ulaş.</strong></p>
  <p>
    YKS, YDS, KPSS gibi sınavlara hazırlanan öğrenciler veya çalışma verimini artırmak isteyen profesyoneller için geliştirilmiş <b>Pomodoro odaklı görev ve hedef yönetim web uygulaması.</b>
  </p>

  <div>
    <img src="https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </div>
</div>

---

## 📖 Proje Hakkında

**FocusFlow**, kullanıcıların çalışma sürelerini takip edebilecekleri, hedefler belirleyip bu hedeflere ulaşma durumlarını liderlik tablosunda diğer kullanıcılarla kıyaslayabilecekleri kapsamlı bir üretkenlik ekosistemidir.

Uygulama, **Spring Boot** tabanlı sağlam bir backend mimarisi ve **React (Vite)** ile geliştirilmiş modern, karanlık tema ağırlıklı (Dark Mode) bir web arayüzüne sahiptir.

## ✨ Temel Özellikler

- **🔒 Güvenli Kimlik Doğrulama:** JWT tabanlı, E-posta doğrulama kodlu (MailTrap/SMTP) kayıt ve giriş sistemi.
- **⏱️ Pomodoro Sayacı:** Özelleştirilebilir çalışma/mola süreleri ve arka planda çalışma desteği.
- **📝 Görev Yönetimi (To-Do):** Klasörleme, önceliklendirme ve acil görevler widget'ı.
- **🎯 Hedef Takibi:** "Aylık 50 saat çalışma", "100 test çözme" gibi kişisel hedefler belirleme ve ilerleme (Progress Bar) takibi.
- **🏆 Liderlik Tablosu & Rozetler (Gamification):** Kullanıcıların haftalık/aylık bazda pomodoro sürelerine göre sıralanması ve kazanılan başarı rozetleri (Badges).
- **📊 Gelişmiş İstatistikler:** Günlük, haftalık ve aylık çalışma verilerini gösteren dashboard raporları.
- **🤖 Yapay Zeka Destekli Çalışma Planı:** Google Gemini AI kullanılarak kişiselleştirilmiş haftalık çalışma programları.

---

## 🛠️ Kullanılan Teknolojiler

### Backend (API)
- **Java 17 & Spring Boot 3+**
- **Spring Security (JWT Auth)**
- **Spring Data JPA (Hibernate)**
- **PostgreSQL**
- **Docker & Docker Compose**
- **MailTrap** (E-posta doğrulama için)
- **Gemini AI API**

### Web (Frontend)
- **React 19 & Vite**
- **Zustand** (Global State Management)
- **Tailwind CSS 4**
- **Recharts** (Grafikler)
- **Axios** (API İstekleri ve Interceptor yönetimi)

---

## 🚀 Kurulum (Local Development)

Projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1️⃣ Projeyi Ayağa Kaldırma (Docker)

Veritabanı, backend ve frontend'i tek komutla ayağa kaldırmak için projenin kök dizininde terminali açın:

```bash
# Docker konteynerlerini inşa edip arka planda başlatır
docker-compose up -d --build
```
> Uygulama şu adreste çalışmaya başlayacaktır: `http://localhost:3000`
> API şu adreste çalışacaktır: `http://localhost:8080/api`

---

## 🌐 Canlıya Alma (Deployment) Planı

Proje şu an bulut hizmetleri üzerinden canlıya alınmaya uygundur:

1. **Veritabanı:** Render.com (PostgreSQL)
2. **Backend API:** Render.com (Web Service / Spring Boot)
3. **Web Frontend:** Vercel veya Render.com (Static Site)

---

<div align="center">
  <p>Geliştiren: <b>FocusFlow Ekibi</b> 🚀</p>
</div>
