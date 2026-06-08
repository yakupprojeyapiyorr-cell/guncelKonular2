# 🎓 FocusFlow Proje Sunum ve Demo Senaryosu

Bu kılavuz, projenizi hocanıza veya jüriye sunarken **FocusFlow**'un tüm özelliklerini en etkili, mantıklı ve akıcı sırayla göstermeniz için hazırlanmıştır. Sistem veritabanı boşken değil, otomatik oluşturulmuş sahte verilerle (Data Seeding) dolu dolu başlatıldığı için çok daha etkileyici bir sunum yapabileceksiniz.

---

## 🔑 Sistemdeki Hazır Kullanıcılar (Demo Verileri)
Sunuma başlamadan önce sistemde halihazırda bulunan (Docker ayağa kalktığında otomatik oluşan) kullanıcı bilgilerini bir kenara not edin:

- **Admin Hesabı:** `admin@focusflow.com` / Şifre: `admin123` *(Sistemin tam yetkili yöneticisi)*
- **Öğrenci Hesabı:** `ogrenci@focusflow.com` / Şifre: `user123` *(Sizin ana test hesabınız)*
- **Sahte Öğrenciler:** `ayse@test.com`, `mehmet@test.com`, `zeynep@test.com`, `ali@test.com`, `elif@test.com` / Şifre: `test123` *(Bu kullanıcılar sistemin dolu görünmesi için görevleri ve pomodoro geçmişleriyle otomatik eklenmiştir)*

---

## 🔴 Adım 1: Yönetici Paneli (Admin Dashboard) Şovu
**Amacımız:** Hocanıza sistemin sadece bir "To-Do" uygulamasından ibaret olmadığını, tam teşekküllü bir yönetim altyapısına (SaaS) sahip olduğunu göstermek.

1. **Giriş (Login) Ekranı:** Uygulamayı açın (`http://localhost:3000/login`) ve **Admin** hesabıyla (`admin@focusflow.com` / `admin123`) giriş yapın.
2. **Kısıtlanmış Menü:** Sol tarafta sadece "👑 Admin Paneli"nin olduğunu, admin ekranının öğrenci menülerinden izole edildiğini gösterin.
3. **Genel İstatistikler:** Üstteki kartları gösterip *"Hocam sistemde şu an toplam 7 kullanıcımız var, x saat odaklanma yapılmış ve y adet görev oluşturulmuş"* diyerek verilerin anlık çekildiğini (Data Seeding verileri) belirtin.
4. **Kullanıcı Yönetimi:** Alt kısımdaki **Kayıtlı Öğrenciler Tablosunu** gösterin. Oradaki sahte öğrencilerden birini (örneğin Ali'yi) seçip yanındaki **👑 Premium Yap** butonuna tıklayın. Sayfa yenilenmeden verinin Backend'de güncellendiğini ve o kişinin anında Premium'a geçtiğini vurgulayın.
5. **Çıkış:** Sol alttan çıkış (Logout) yapın.

---

## 🟢 Adım 2: Kullanıcı Kaydı ve Karşılama (Onboarding)
**Amacımız:** Sistemin yeni bir öğrenciyi nasıl karşıladığını ve kişiselleştirilmiş deneyim sunduğunu göstermek.

1. **Kayıt (Register) Sayfası:** `http://localhost:3000/register` adresine gidin. Yeni bir hesap oluşturun.
2. **Onboarding (Karşılama) Ekranı:** Kayıt sonrası otomatik yönlendirilen ekranda "Sınıfı", "Hedef Üniversitesi" gibi bilgileri doldurun.
3. **Vurgulanacak Nokta:** *"Hocam, sistemimiz her kullanıcıyı tanımak ve ileride Yapay Zeka destekli analizler sunabilmek için ilk girişte bu özel verileri topluyor."*

---

## 🟡 Adım 3: Dashboard ve Freemium Sistemi
**Amacımız:** Kullanıcının panelini ve Premium kısıtlamalarını tanıtmak.

1. Çıkış yapıp sisteme hazır Öğrenci hesabıyla (`ogrenci@focusflow.com` / `user123`) tekrar girin.
2. **Dashboard İncelemesi:** Ana sayfadaki widget'ları (bugünün odaklanma süresi, görevler özeti) gösterin.
3. **Premium'a Geçiş:** Sol menüden **Premium** sayfasına gidin. 
4. **Vurgulanacak Nokta:** Ücretsiz versiyonda klasörleme veya alt görev ekleme gibi kısıtlamalar (En fazla 5 görev ekleme vs.) olduğunu, sistemin Freemium modeliyle çalıştığını anlatın. (Daha önce Admin panelinden bir hesabı Premium yaptığınızı hatırlatarak adminin gücüne tekrar vurgu yapabilirsiniz).

---

## 🔵 Adım 4: Görev Yönetimi ve Hiyerarşi
**Amacımız:** Sistemin alt görevler ve klasörleme (Projeler) yapısını göstermek.

1. **Görev Ekleme:** Görevler widget'ından yeni bir görev ekleyin (Örn: `Matematik Denemesi`).
2. **Alt Görevler:** Eklediğiniz görevin altındaki **(+)** butonuna tıklayarak alt görevler (Örn: `Soru 1-20 arası`, `Soru 20-40 arası`) ekleyin.
3. **Vurgulanacak Nokta:** Kullanıcıların büyük hedeflerini küçük lokmalara bölerek (Mikro-Yönetim) daha motive şekilde çalışabildiklerini açıklayın.

---

## 🟣 Adım 5: Pomodoro ve Oyunlaştırma (Gamification)
**Amacımız:** Projenin kalbi olan odaklanma mekanizmasını sergilemek.

1. **Seans Başlatma:** Alt görevlerden birinin yanındaki **Play (▶)** butonuna tıklayın. Sizi doğrudan Pomodoro sayfasına atacaktır.
2. **Zamanlayıcı:** Sürenin geriye saydığını gösterin. Premium üyelerin bu süreyi istedikleri gibi ayarlayabildiğini belirtin.
3. **Oyunlaştırma (Gamification):** *"Hocam, seans bittiğinde kullanıcıya odaklanma puanı (Focus Points) ve deneyim puanı (XP) veriyoruz. Kullanıcı seviye atlıyor ve çalışmaya teşvik ediliyor."* diyerek Profil ekranındaki Rozet sistemine atıfta bulunun.

---

## 🟠 Adım 6: Günlük Planlama (Study Plans)
**Amacımız:** Kullanıcının görev bazlı değil, takvim ve zaman bazlı da çalışabildiğini göstermek.

1. Sol menüden **Planlama** sekmesine gidin.
2. Takvim üzerinden herhangi bir günü (geçmiş veya gelecek) seçin.
3. Arka planda otomatik gelmiş profesyonel çalışma planlarını (Örn: "TYT Matematik - Problemler Soru Çözümü", "AYT Fizik") gösterin. Geçmiş günlerdeki planların birçoğunun "Tamamlandı" olarak işaretlendiğine dikkat çekin.
4. **Vurgulanacak Nokta:** "Görevler" listesinin 'Ne' yapılacağını, "Planlama" takviminin ise o işin 'Ne zaman' yapılacağını belirlediğini hocanıza açıklayın.

---

## ⚪ Adım 7: Yapay Zeka ve İstatistikler
**Amacımız:** Sistemin teknolojik olarak yenilikçi yüzünü ve gelişimi göstermek.

1. Sol menüden **AI Verimlilik** sekmesine gidin ve "Öneri Al" butonuna basın. (Limit uyarısı verse bile altyapıyı anlatın).
2. Sağ üstten **Profil** sekmesine gidin. Kullanıcının seviyesini (Level), kazandığı deneyim puanlarını (XP) ve rozetlerini gösterin.
3. **Kapanış Cümlesi:** *"Özetle FocusFlow; Spring Boot ve React altyapısıyla güvenli (JWT), Docker ile tamamen taşınabilir ve Yapay Zeka / Oyunlaştırma özellikleriyle de kullanıcının motivasyonunu hep yüksek tutan bir sistemdir."* diyerek sunumu tamamlayın.

Başarılar dilerim! 🚀
