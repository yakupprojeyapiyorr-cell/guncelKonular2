# Mobil Eksik Özellikler (Mobile Gaps)

Bu dosya, **web** tarafında mevcut olan ancak **mobil (React Native)** uygulamasında henüz eklenmemiş özellikleri ve bunların eklenme zorluk derecelendirmesini içerir. Kullanıcı yalnızca mevcut sayfaların (Login, Register, Dashboard, Pomodoro, StudyPlan, Task, Chat) işlevselliğini koruyacak, yeni bir özellik eklemeyecek.

---

## ✅  Kolay ve Hızlı Eklenebilecekler (1 Gün içinde tamamlanabilir)
| Özellik | Açıklama | Gerekli Dosyalar / Ekranlar |
|---|---|---|
| **Acil Görevler Widget** | `MostUrgentTasks.jsx` komponentindeki listeleri mobilde bir `FlatList` olarak göster. | `src/screens/DashboardScreen.js` – yeni komponent `UrgentTasksWidget.js` |
| **Admin Dashboard** | Yönetici istatistikleri ve kullanıcı yönetimi. | `src/screens/AdminDashboardScreen.js` (yeni) |
| **AI İstatistik Sayfası** | `AiStatsPage.jsx`'deki grafik ve veri gösterimleri. | `src/screens/AiStatsScreen.js` (yeni) |
| **Onboarding / Email Doğrulama** | Webde bulunan onboarding adımları ve e‑posta doğrulama akışı mobilde aynen eklenebilir. | `src/screens/OnboardingScreen.js`, `src/screens/EmailVerificationScreen.js` |
| **Görev Klasör/Proje Gruplama** | Görevleri “Klasör” ya da “Proje” gibi gruplama desteği (sadece UI). | `src/screens/TaskScreen.js` – ekstra dropdown ve grup listesi |
| **Görev Tekrarlama (Recurrence)** | Tekrarlayan görev seçeneği (`daily`, `weekly`, `monthly`). | `src/screens/TaskScreen.js` – yeni picker |

---

## 📊 Orta Seviye (Kütüphane kurulumu ve performans ayarı gerektirenler)
| Özellik | Açıklama | Gerekli Kütüphane / İşlem |
|---|---|---|
| **Odaklanma Trendi Grafiği** | `FocusTrendChart.jsx` grafiğini mobilde göstermek. | `react-native-chart-kit` veya `react-native-gifted-charts` eklenmeli, veri transformasyonu yapılmalı. |
| **Alt Görev (SubTask) İç İçe Liste** | Ana görev içinde alt görevleri render eden nested list. | Performans için `FlatList` + `SectionList` kombinasyonu, `react-native-reanimated` opsiyonel. |

---

## 🎧 Daha Zor / Native İzin Gerektirenler (Ek zaman ve izin yapılandırması)
| Özellik | Açıklama | Gerekli Native Modül |
|---|---|---|
| **Görev Dosya/Fotoğraf Yükleme** | `TaskAttachmentsModal.jsx` – dosya seç, fotoğraf çek ve backend’e gönder. | `expo-document-picker` veya `expo-image-picker` + `expo-av` (yükleme) – Android / iOS izinleri. |
| **Premium Ortam Sesleri (AmbientSounds)** | Arka plan seslerini (yağmur, kafe, doğa) çalmak. | `expo-av` ile ses dosyalarını oynat, **Background Audio** izni (iOS `audio` background mode). |
| **Gerçek‑zamanlı Chat Animasyonları** | Webdeki `AiChatPanel` animasyonunu mobilde aynı seviyeye getirmek. | `react-native-reanimated` + `react-native-gesture-handler` – animasyon ve scroll senkronizasyonu. |

---

## 📌 Özet ve Öneri
- **MVP (Minimum Viable Product)** haliyle uygulama zaten çalışır ve tüm temel fonksiyonları (Görev yönetimi, Pomodoro, Plan, Chat, Dashboard) içeriyor.
- **Yeni Ekleme Sırası**: Öncelikle **Acil Görev widget** ve **Admin / AI‑Stats ekranları** gibi hızlı kazanımlar eklenebilir, ardından **grafik** ve **alt‑görev** gibi orta seviye öğelere geçilebilir.
- **En Zor** kısmı dosya/ ses ekleme olduğundan, bu özellikleri son aşamada veya ayrı bir “Premium” versiyonda değerlendirebiliriz.

Bu listeyi ileride **task.md** dosyasına göre adımlara bölerek takip edebiliriz. Hangi grubu önce ele almak istediğinizi bana bildirirseniz, o parçaya odaklanıp ilgili kodu yazmaya başlayabilirim.
