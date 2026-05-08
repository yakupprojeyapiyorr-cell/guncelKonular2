# FocusFlow - YKS Hazırlık ve Odaklanma Platformu

FocusFlow, öğrencilerin YKS (Yükseköğretim Kurumları Sınavı) hazırlık sürecini modernize eden, verimliliği artıran ve başarıyı ölçülebilir kılan kapsamlı bir eğitim platformudur.

## 📊 Proje Durum Raporu (Güncel)

### ✅ Tamamen Çalışan Özellikler
- **Kimlik Doğrulama:** JWT tabanlı Login/Register ve Role-based (Admin/Öğrenci) erişim.
- **Ders & Müfredat:** Konu hiyerarşisi, video takip sistemi (tikleme) ve toplam süre hesaplama.
- **Soru Bankası:** 5 şıklı, detaylı çözüm açıklamalı manuel soru ekleme ve yönetimi.
- **Sınav Sistemi:** Online deneme sınavı, net hesaplama ve anlık **Leaderboard** (Sıralama).
- **Gamification:** Günlük çalışma serisi (Streak) ve kazanılabilir rozetler (Badges).
- **Hedef Sistemi:** Günlük/Haftalık soru ve süre hedefleri belirleme ve progress takibi.
- **Bildirimler:** Uygulama içi bildirim merkezi (Pomodoro bitti, hedef tamamlandı vb.).
- **Onboarding:** Yeni kullanıcılar için 3 adımlı hedef belirleme sihirbazı.
- **Premium UI:** Tüm sayfalar için Glassmorphism + Dark Mode tasarımı.

### 🤖 AI-Bağımlı Özellikler (OPENAI_API_KEY Gerektirir)
- **Konu Asistanı:** Ders sayfasındaki RAG tabanlı chatbot (Konu özetlerini baz alarak açıklar).
- **Çalışma Programı:** Öğrenci verilerine göre haftalık program üretici.
- **AI Soru Üretimi:** Admin panelinde tek tıkla özgün YKS sorusu oluşturma.
- **Zayıf Nokta Analizi:** Başarı oranlarına göre AI destekli aksiyon planı raporu.

### ⏳ Gelecek Planlaması (Eklenecekler)
- **PWA Desteği:** Uygulamanın offline çalışabilmesi ve mobile kurulabilmesi.
- **Web Push:** Tarayıcı kapalıyken bile gelen gerçek zamanlı bildirimler.
- **Vektör Veritabanı:** RAG için `pgvector` tam entegrasyonu (Şu an in-memory simüle ediliyor).

---

## 🚀 Öne Çıkan Özellikler

### 🎓 Eğitim ve İçerik Yönetimi
- **Ders & Konu Hiyerarşisi:** Düzenli bir müfredat yapısı.
- **AI Destekli MEB Özetleri:** MEB kitaplarının LLM (Yapay Zeka) ile özetlenmiş, Markdown formatında içerikleri.
- **YouTube Entegrasyonu:** Ders videolarını platform içinden takip etme.
- **Video İlerleme Takibi:** İzlenen videoların yanındaki "tik" sembolü ile tamamlanma durumu.
- **Playlist Süre Hesaplama:** Toplam video süresini otomatik görme.

### 📝 Soru Bankası ve Denemeler
- **Gelişmiş Soru Yönetimi:** Görsel destekli, 5 şıklı, her şık için detaylı çözüm açıklamalı sorular.
- **Dinamik Puanlama:** Sorulara katsayı atayarak gerçekçi puan hesaplama.
- **Sınav Modülü:** Belirlenen süre ve soru sayısına göre online denemeler.
- **Liderlik Tablosu (Leaderboard):** Sınav sonuçlarına göre (Net, Süre ve Puan bazlı) tüm öğrenciler arasındaki sıralama.

### 📊 Performans Analizi
- **Konu Bazlı Başarı Grafikleri:** Her konu için toplanan puanların ve doğru/yanlış oranlarının görselleştirilmesi.
- **Zayıf Nokta Analizi (AI):** Başarı oranına göre otomatik çalışma tavsiyeleri.
- **Gelişmiş Dashboard:** Toplam soru, net ortalaması ve çalışma sürelerinin takibi.

### ⏲️ Odaklanma Araçları
- **Pomodoro Sayacı:** Özelleştirilebilir çalışma ve mola süreleri.
- **Focus Takibi:** Günlük ve haftalık odaklanma istatistikleri.

## 🔑 Giriş Bilgileri (Test İçin)

### Admin Hesabı
- **E-posta:** `admin@focusflow.com`
- **Şifre:** `admin123`

### Öğrenci Hesabı
- **E-posta:** `ogrenci@focusflow.com`
- **Şifre:** `user123`

## 🛠️ Teknik Yığın (Tech Stack)

### Backend
- **Java 21 & Spring Boot 3.2**
- **Spring Security & JWT:** Güvenli kimlik doğrulama ve role-based yetkilendirme.
- **Spring Data JPA:** Hibernate tabanlı ORM yönetimi.
- **PostgreSQL / H2:** Üretim ve geliştirme ortamları için veritabanı desteği.
- **Lombok:** Boilerplate kod azaltımı.

### Frontend
- **React 18 & Vite:** Hızlı ve modern frontend geliştirme.
- **Tailwind CSS:** "Glassmorphism" ve "Dark Mode" odaklı premium UI tasarımı.
- **Recharts:** Veri görselleştirme ve başarı grafikleri.
- **Zustand:** Hafif ve performanslı state yönetimi.
- **Lucide Icons:** Modern ikon seti.

## 🔑 Kullanım Rehberi

### Admin Girişi
- Ders, konu, soru ve sınav ekleme/düzenleme yetkisi.
- MEB özetlerini yükleme ve PDF linklerini yönetme.

### Öğrenci Girişi
- Ders videolarını izleme ve "tamamlandı" işaretleme.
- Deneme sınavlarına girme ve anlık sıralama takibi.
- Kişisel istatistiklerini ve konu bazlı puanlarını görüntüleme.

---
*FocusFlow - Geleceğine Odaklan.*
