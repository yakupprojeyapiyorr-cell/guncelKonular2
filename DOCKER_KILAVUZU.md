# FocusFlow - Docker Kullanım Rehberi 🐳

Bu belge, FocusFlow projesini Docker kullanarak nasıl başlatacağınızı, durduracağınızı ve yöneteceğinizi basitçe açıklar. Sisteminizde **Docker Desktop**'ın çalıştığından emin olduktan sonra aşağıdaki komutları proje ana dizininde (bu dosyanın bulunduğu yerde) terminalden çalıştırabilirsiniz.

---

## 🚀 Projeyi Ayağa Kaldırma (Başlatma)

### 1. Standart Başlatma
Konteynerleri arka planda sessizce başlatmak için kullanılır. Kodda bir değişiklik yapmadıysanız en hızlı yöntem budur.
```powershell
docker compose up -d
```

### 2. Yeniden Derleyerek Başlatma (Önerilen)
Eğer kodunuzda (Frontend veya Backend tarafında) herhangi bir **değişiklik yaptıysanız**, Docker'ın bu yeni kodları algılayıp imajı yenilemesi için `--build` bayrağını eklemelisiniz. Bizim tüm değişiklikleri görmek için sürekli kullandığımız komut budur:
```powershell
docker compose up --build -d
```

> **Not:** `-d` (detached) parametresi, terminali size geri verir. Böylece uygulamanız arka planda çalışmaya devam ederken terminali kullanabilirsiniz.

---

## 🛑 Projeyi Kapatma (Durdurma)

Docker konteynerlerini durdurmanın iki farklı yolu vardır:

### 1. Sadece Durdurma (Stop)
Konteynerleri durdurur ancak **silmez**. Veritabanınız ve konteyner ayarlarınız aynen kalır. Sistemi geçici olarak kapatmak için en güvenli yoldur:
```powershell
docker compose stop
```
*(Tekrar başlatmak için `docker compose start` veya `docker compose up -d` diyebilirsiniz.)*

### 2. Tamamen Kapatma ve Silme (Down)
Konteynerleri durdurur ve **siler**. Ancak `-v` parametresini kullanmadığınız sürece veritabanı verileriniz (kullanıcılar, görevler vb.) silinmez, bir sonraki `up` komutunda geri gelir:
```powershell
docker compose down
```

### ⚠️ Fabrika Ayarlarına Dönme (Her Şeyi Silme)
Eğer veritabanında bir hata yaptıysanız ve tüm verileri sıfırlayıp projeyi **ilk günkü temiz haline** getirmek isterseniz:
```powershell
docker compose down -v
```
*(Bu komut veritabanı volume'unu yani kalıcı kayıtları da siler. Dikkatli kullanın!)*

---

## 📋 Logları (Kayıtları) İzleme

Proje çalışırken arka planda ne olup bittiğini (API istekleri, hatalar vb.) anlık olarak görmek isterseniz:

Tüm sistemin (Frontend, Backend, DB) loglarını canlı izlemek için:
```powershell
docker compose logs -f
```

Sadece Backend (Spring Boot) loglarını izlemek için:
```powershell
docker compose logs -f backend
```

Sadece Frontend (Vite/React) loglarını izlemek için:
```powershell
docker compose logs -f frontend
```
*(Log izleme modundan çıkmak için klavyeden `Ctrl + C` tuşlarına basabilirsiniz, bu işlemi yapmak projeyi durdurmaz.)*

---

## 🌐 Erişim Adresleri

Proje ayağa kalktığında tarayıcınızdan aşağıdaki linklerle sisteme ulaşabilirsiniz:
- **Frontend (Arayüz):** [http://localhost:3000](http://localhost:3000)
- **Backend (API):** [http://localhost:8080](http://localhost:8080)
- **Veritabanı (PostgreSQL):** `localhost:5432` üzerinden erişilebilir.
