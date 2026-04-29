# 🚀 FocusFlow - YKS Hazırlık Platformu

FocusFlow, modern tasarımı ve güçlü altyapısı ile öğrencilerin YKS hazırlık sürecini optimize eden bir eğitim platformudur.

## ✅ Şu Ana Kadar Yapılanlar

### 🎨 Tasarım ve UI/UX
- **Premium Glassmorphism Tasarımı:** Tüm sayfalar (Giriş, Kayıt, Dashboard, Dersler, Admin Paneli) modern, koyu tema ve cam efekti (glassmorphism) estetiğiyle baştan tasarlandı.
- **Dinamik Dashboard:** Öğrenci paneli, admin tarafından eklenen ders sayısını ve çalışma istatistiklerini gösterecek şekilde dinamik hale getirildi.
- **Ders Listeleme:** Dersler sayfası, backend'den gelen verileri şık kart tasarımlarıyla listeleyecek şekilde güncellendi.

### ⚙️ Backend ve Altyapı
- **Spring Boot 3.2.0 Entegrasyonu:** Güvenlik ve performans için en güncel Spring Boot yapısı kullanıldı.
- **JWT Kimlik Doğrulama:** Güvenli giriş-çıkış işlemleri için JSON Web Token (JWT) altyapısı kuruldu.
- **Gelişmiş Güvenlik Yapılandırması:** CORS sorunları giderildi ve rol tabanlı yetkilendirme (Admin/Öğrenci) sistemi optimize edildi.
- **Otomatik Veri Başlatıcı (DataSeeder):** Uygulama her başladığında admin hesabının (`admin@focusflow.com`) hazır olmasını sağlayan sistem eklendi.

### 🛠️ İçerik Yönetimi (Admin)
- **Ders Yönetimi:** Adminlerin ders ekleme, silme ve düzenleme yapabileceği modern arayüz tamamlandı.
- **Konu Yönetimi:** Derslere bağlı konuların yönetilebildiği hiyerarşik yapı kuruldu.

---

## 📅 Gelecek Yol Haritası (Yapılacaklar)

### 1. PostgreSQL Geçişi (Kritik)
- [ ] `application.yml` dosyasının PostgreSQL veritabanı bilgilerine göre güncellenmesi.
- [ ] Veritabanı şemalarının (Table definitions) PostgreSQL uyumlu hale getirilmesi.

### 2. Soru Bankası Modülü
- [ ] **Backend:** Soruların ders ve konu bazlı saklanacağı veritabanı yapısının kurulması.
- [ ] **Frontend:** Görsel destekli (görüntü yüklenebilir) soru ekleme ekranının yapılması.

### 3. Sınav ve Analiz Sistemi
- [ ] **Deneme Sınavları:** Öğrencilerin süre tutarak çözebileceği sınav modülü.
- [ ] **Performans Analizi:** Çözülen sorulara göre öğrencinin eksik olduğu konuların AI destekli tespiti.

### 4. Çalışma Araçları
- [ ] **Pomodoro Zamanlayıcı:** Dashboard'a entegre odaklanma aracı.
- [ ] **Hedef Belirleme:** Günlük ve haftalık çalışma hedefleri sistemi.

---

## 🛠️ Kurulum Notları
Proje şu an **Frontend (Vite/React)** ve **Backend (Spring Boot)** olmak üzere iki ana dizinden oluşmaktadır.

**Frontend:** `npm run dev`
**Backend:** `mvn spring-boot:run`

**Admin Giriş Bilgileri:**
- **Email:** `admin@focusflow.com`
- **Şifre:** `admin123`
