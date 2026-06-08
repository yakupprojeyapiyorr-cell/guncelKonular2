# FocusFlow Mobile MVP (React Native / Expo)

Bu klasör, FocusFlow projesinin Android (veya iOS) platformunda çalışacak olan **React Native (Expo)** mobil uygulamasının kaynak kodlarını içerir.

## Özellikler (MVP)
* **JWT Authentication:** Kullanıcı girişi ve token'ın AsyncStorage ile güvenli saklanması.
* **Görevler:** Görevlerin listelenmesi ve tamamlanma (toggle) durumu.
* **Yapay Zeka (Chat):** Gemini altyapısıyla çalışan AI Verimlilik Koçu sohbet arayüzü.
* **Profil ve Rozetler:** Kullanıcının çalışma istatistikleri ve oyunlaştırma (gamification) rozetleri.

## Mimari
Uygulama, halihazırda var olan Spring Boot backend'inize sorunsuz bağlanacak şekilde tasarlanmıştır. Herhangi bir ekstra veritabanına veya sunucuya ihtiyaç yoktur. İstekler `src/api/client.js` üzerinden `http://10.0.2.2:8080/api` adresine gider (Android Emulator adresi).

## Nasıl Çalıştırılır?
Bağımlılıkları kurmak ve sistemi test etmek istediğinizde şu adımları izleyin:

1. Bilgisayarınızda (tercihen başka bir terminal penceresinde) backend Docker imajınızın çalıştığından emin olun (`docker-compose up -d`).
2. Bu klasör içindeyken terminali açıp `start.bat` dosyasına tıklayın veya komut satırından çalıştırın:
   ```bash
   .\start.bat
   ```
3. Telefonunuzdan **Expo Go** uygulamasını açıp ekrandaki QR kodu okutun. (Veya Android emulatorünüz açıksa, terminalde "a" tuşuna basarak doğrudan emülatöre gönderin).
