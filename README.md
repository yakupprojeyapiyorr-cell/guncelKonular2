<div align="center">
  <img src="https://img.icons8.com/?size=512&id=5P80hQ3jX5z2&format=png" width="120" alt="FocusFlow Logo"/>
  <h1>🚀 FocusFlow</h1>
  <p><strong>Odaklan. Başla. Başarılara Ulaş.</strong></p>
  <p>
    YKS, YDS, KPSS gibi sınavlara hazırlanan öğrenciler veya çalışma verimini artırmak isteyen profesyoneller için geliştirilmiş <b>Pomodoro odaklı görev ve hedef yönetim uygulaması.</b>
  </p>

  <div>
    <img src="https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </div>
</div>

---

## 📖 Proje Hakkında

**FocusFlow**, kullanıcıların çalışma sürelerini takip edebilecekleri, hedefler belirleyip bu hedeflere ulaşma durumlarını liderlik tablosunda diğer kullanıcılarla kıyaslayabilecekleri kapsamlı bir üretkenlik ekosistemidir.

Uygulama, **Spring Boot** tabanlı sağlam bir backend mimarisi ve **React Native (Expo)** ile geliştirilmiş modern, karanlık tema ağırlıklı (Dark Mode) bir mobil arayüze sahiptir.

## ✨ Temel Özellikler

- **🔒 Güvenli Kimlik Doğrulama:** JWT tabanlı, E-posta doğrulama kodlu (MailTrap/SMTP) kayıt ve giriş sistemi.
- **⏱️ Pomodoro Sayacı:** Özelleştirilebilir çalışma/mola süreleri ve arka planda çalışma desteği.
- **📝 Görev Yönetimi (To-Do):** Klasörleme, önceliklendirme ve acil görevler widget'ı.
- **🎯 Hedef Takibi:** "Aylık 50 saat çalışma", "100 test çözme" gibi kişisel hedefler belirleme ve ilerleme (Progress Bar) takibi.
- **🏆 Liderlik Tablosu & Rozetler (Gamification):** Kullanıcıların haftalık/aylık bazda pomodoro sürelerine göre sıralanması ve kazanılan başarı rozetleri (Badges).
- **📊 Gelişmiş İstatistikler:** Günlük, haftalık ve aylık çalışma verilerini gösteren dashboard raporları.

---

## 🛠️ Kullanılan Teknolojiler

### Backend (API)
- **Java 17 & Spring Boot 3+**
- **Spring Security (JWT Auth)**
- **Spring Data JPA (Hibernate)**
- **PostgreSQL**
- **Docker & Docker Compose**
- **MailTrap** (E-posta doğrulama için)

### Mobil (Frontend)
- **React Native & Expo (SDK 54)**
- **Zustand** (Global State & AsyncStorage entegre Hydration)
- **React Navigation v7**
- **Axios** (API İstekleri ve Interceptor yönetimi)
- **Expo Linear Gradient & Vector Icons**

---

## 🚀 Kurulum (Local Development)

Projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1️⃣ Backend'i Ayağa Kaldırma (Docker)

Veritabanı ve backend'i tek komutla ayağa kaldırmak için projenin kök dizininde terminali açın:

```bash
# Docker konteynerlerini inşa edip arka planda başlatır
docker-compose up -d --build
```
> API şu adreste çalışmaya başlayacaktır: `http://localhost:8080/api`

### 2️⃣ Mobil Uygulamayı Çalıştırma

Mobil uygulama klasörüne girin ve bağımlılıkları yükleyin:

```bash
cd focusflow-mobile
npm install
```

Projeyi telefonunuzda test etmek için API adresini bilgisayarınızın yerel IP'si ile (örneğin `http://192.168.1.X:8080/api`) değiştirmeniz veya bir tünel aracı (`localtunnel`/`ngrok`) kullanmanız gerekebilir.

API adresini güncelledikten sonra projeyi başlatın:

```bash
npx expo start
```
> Telefonunuza **Expo Go** uygulamasını indirip terminaldeki QR kodu okutarak uygulamayı test edebilirsiniz.

---

## 🌐 Canlıya Alma (Deployment) Planı

Proje şu an ücretsiz bulut hizmetleri üzerinden canlıya alınmaya uygundur:

1. **Veritabanı:** Render.com (PostgreSQL)
2. **Backend API:** Render.com (Web Service / Spring Boot)
3. **Mobil Build:** Expo Application Services (EAS) üzerinden APK / AAB veya App Store / Play Store.

---

## 📸 Ekran Görüntüleri

*(Buraya projenin arayüzünden ekran görüntüleri ekleyebilirsiniz)*

---

<div align="center">
  <p>Geliştiren: <b>FocusFlow Ekibi</b> 🚀</p>
</div>
