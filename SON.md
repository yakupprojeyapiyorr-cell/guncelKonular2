# 🚀 **SON KEZ HIZLI EKLENEBİLECEK ÖZELLİKLER**

> **Dönem boyunca yapılabilecek high-impact features** - Hızlı implementasyon, yüksek user value!

---

## ⚡ **TIER 1: CRITICAL (Hemen yapılmalı - 1 hafta)**

### 1️⃣ **📎 TASK ATTACHMENTS** (2 gün) ⭐⭐⭐
**⭐ Senin istediğin feature - Ders görevine dosya attach etme!**

#### Problem:
```
Senaryo: "YKS Kimya - Asitler Bölümü" task'ı oluşturdum
❌ Ders notlarını nereden bulacak?
❌ Soru bankası, PDF, Excel dosyaları ayrı yerde
❌ YouTube linki kopyala-yapıştır
❌ Zaman kaybı, focus kırılır
```

#### Çözüm:
```
✅ Task'a direkt attach et → Tüm materyal aynı yerde!
✅ Drag-drop upload
✅ Dosya tipi tanıma (PDF, Word, Excel, Video, Image)
✅ Hızlı preview
✅ Direkt download
```

#### BACKEND Implementation:
```java
// 1. New Entity: TaskAttachment
@Entity
@Table(name = "task_attachments")
public class TaskAttachment {
    @Id
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;
    
    private String fileName;
    private String fileUrl;        // S3 link
    private String fileType;        // pdf, docx, xlsx, mp4, etc
    private Long fileSizeBytes;
    private String uploadedBy;     // user email
    private LocalDateTime uploadedAt;
}

// 2. New Repository: TaskAttachmentRepository
public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, UUID> {
    List<TaskAttachment> findByTaskId(UUID taskId);
    void deleteByTaskId(UUID taskId);
}

// 3. New Controller Endpoints
@PostMapping("/{taskId}/attachments")
public ResponseEntity<?> uploadAttachment(
    @PathVariable UUID taskId,
    @RequestParam("file") MultipartFile file
)

@GetMapping("/{taskId}/attachments")
public ResponseEntity<?> getAttachments(@PathVariable UUID taskId)

@DeleteMapping("/attachments/{attachmentId}")
public ResponseEntity<?> deleteAttachment(@PathVariable UUID attachmentId)

// 4. S3 Service Integration
@Service
public class FileUploadService {
    @Autowired
    private AmazonS3 amazonS3;
    
    public String uploadFile(MultipartFile file) {
        // Validate file (size < 50MB, type whitelist)
        // Upload to S3
        // Return URL
    }
}
```

#### FRONTEND Implementation:
```jsx
// TaskDetail.jsx - Attachment Section
import { useState } from 'react';

export default function TaskDetail({ taskId }) {
    const [attachments, setAttachments] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    // Drag-drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const files = e.dataTransfer.files;
        uploadFiles(files);
    };

    const uploadFiles = async (files) => {
        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(
                `/api/tasks/${taskId}/attachments`,
                { method: 'POST', body: formData }
            );
            const attachment = await response.json();
            setAttachments([...attachments, attachment]);
        }
    };

    const getFileIcon = (fileType) => {
        const icons = {
            'pdf': '📄', 'docx': '📝', 'xlsx': '📊',
            'png': '🖼️', 'jpg': '🖼️',
            'mp4': '🎥', 'youtube': '▶️'
        };
        return icons[fileType] || '📎';
    };

    return (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <h3 className="text-lg font-bold text-indigo-900 mb-3">
                📎 Attachments
            </h3>

            {/* Drag-Drop Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                    transition-all
                    ${dragActive 
                        ? 'border-indigo-600 bg-indigo-100' 
                        : 'border-indigo-300 bg-white'
                    }
                `}
            >
                <p className="text-indigo-600 font-semibold">
                    Drag files here or click to upload
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    Max 50MB • PDF, Word, Excel, Video, Images
                </p>
                <input
                    type="file"
                    multiple
                    onChange={(e) => uploadFiles(e.target.files)}
                    className="hidden"
                    id="file-input"
                />
            </div>

            {/* Attachments List */}
            <div className="mt-4 space-y-2">
                {attachments.map((att) => (
                    <div
                        key={att.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">
                                {getFileIcon(att.fileType)}
                            </span>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {att.fileName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(att.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={att.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                            >
                                📥 Download
                            </a>
                            <button
                                onClick={() => deleteAttachment(att.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

#### Database Schema:
```sql
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
```

#### API Response Example:
```json
{
  "id": "uuid",
  "fileName": "kimya_notu.pdf",
  "fileUrl": "https://s3.amazonaws.com/focusflow/...",
  "fileType": "pdf",
  "fileSizeBytes": 2500000,
  "uploadedBy": "ogrenci@focusflow.com",
  "uploadedAt": "2026-06-02T10:30:00"
}
```

#### Testing Scenarios:
- ✅ Upload PDF (ders notu)
- ✅ Upload Excel (soru bankası)
- ✅ Upload Video link
- ✅ Download file
- ✅ Delete attachment
- ✅ Size validation (max 50MB)
- ✅ File type whitelist

#### IMPACT: 🔥🔥🔥 **Game changer!**

---

### 2️⃣ **📌 TASK PRIORITY + DIFFICULTY** (1 gün) ⭐⭐⭐

#### Problem:
```
Tüm görevler eşit görünüyor
❌ Hangisini ilk yapsam?
❌ Hangisinin sınavda çıkma olasılığı yüksek?
❌ Hangisi daha kolay/zor?
```

#### Çözüm:
```
✅ Priority: CRITICAL, HIGH, MEDIUM, LOW
✅ Difficulty: EASY ⭐, MEDIUM ⭐⭐, HARD ⭐⭐⭐
✅ Smart sorting: En önemli + zor görevler ilk
✅ Renk coding: Kırmızı, sarı, yeşil
```

#### BACKEND Changes:
```java
// Update Task Entity
@Entity
public class Task {
    // ... existing fields
    
    @Enumerated(EnumType.STRING)
    private Priority priority;  // CRITICAL, HIGH, MEDIUM, LOW
    
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;  // EASY, MEDIUM, HARD
}

// Enums
public enum Priority {
    CRITICAL,   // 🔴 En önemli
    HIGH,       // 🟡 Önemli
    MEDIUM,     // 🟢 Normal
    LOW         // ⚪ Az önemli
}

public enum Difficulty {
    EASY,       // ⭐ Basit
    MEDIUM,     // ⭐⭐ Orta
    HARD        // ⭐⭐⭐ Zor
}

// New API: Sort by priority + difficulty
@GetMapping
public ResponseEntity<?> getTasks(
    @RequestParam(required = false) Priority priority,
    @RequestParam(required = false) Difficulty difficulty,
    @RequestParam(defaultValue = "priority") String sortBy
) {
    // Return tasks sorted by priority (desc) then difficulty (desc)
}
```

#### FRONTEND Implementation:
```jsx
// TaskList.jsx
export default function TaskList({ tasks }) {
    const getPriorityColor = (priority) => {
        const colors = {
            CRITICAL: 'bg-red-500',
            HIGH: 'bg-yellow-500',
            MEDIUM: 'bg-green-500',
            LOW: 'bg-gray-400'
        };
        return colors[priority];
    };

    const getDifficultyStars = (difficulty) => {
        const stars = {
            EASY: '⭐',
            MEDIUM: '⭐⭐',
            HARD: '⭐⭐⭐'
        };
        return stars[difficulty];
    };

    // Sort by: priority (CRITICAL first) then difficulty (HARD first)
    const sortedTasks = tasks.sort((a, b) => {
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        const diffOrder = { HARD: 0, MEDIUM: 1, EASY: 2 };
        return diffOrder[a.difficulty] - diffOrder[b.difficulty];
    });

    return (
        <div className="space-y-3">
            {sortedTasks.map((task) => (
                <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg border-l-4 hover:shadow-lg transition-all"
                    style={{ borderColor: getPriorityColor(task.priority) }}
                >
                    <div className="flex items-center gap-2">
                        {/* Priority Badge */}
                        <span
                            className={`
                                inline-block px-2 py-1 text-white text-xs font-bold rounded
                                ${getPriorityColor(task.priority)}
                            `}
                        >
                            {task.priority}
                        </span>

                        {/* Difficulty Stars */}
                        <span className="text-yellow-500">
                            {getDifficultyStars(task.difficulty)}
                        </span>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                            {task.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {task.description}
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => completeTask(task.id)}
                        className="w-5 h-5"
                    />
                </div>
            ))}
        </div>
    );
}
```

#### TaskCreateForm Enhancement:
```jsx
// Priority ve Difficulty seçimi
<div className="grid grid-cols-2 gap-4">
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            Priority
        </label>
        <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
            <option value="CRITICAL">🔴 Critical</option>
            <option value="HIGH">🟡 High</option>
            <option value="MEDIUM">🟢 Medium</option>
            <option value="LOW">⚪ Low</option>
        </select>
    </div>

    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            Difficulty
        </label>
        <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
            <option value="EASY">⭐ Easy</option>
            <option value="MEDIUM">⭐⭐ Medium</option>
            <option value="HARD">⭐⭐⭐ Hard</option>
        </select>
    </div>
</div>
```

#### Dashboard Widget:
```jsx
// MostUrgent.jsx - "En Acil 5 Görev"
export default function MostUrgent({ tasks }) {
    const urgent = tasks
        .filter(t => !t.completed && (t.priority === 'CRITICAL' || t.priority === 'HIGH'))
        .sort((a, b) => {
            const diffOrder = { HARD: 0, MEDIUM: 1, EASY: 2 };
            return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        })
        .slice(0, 5);

    return (
        <div className="bg-white rounded-lg p-6 border-l-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4">
                🔴 En Acil 5 Görev
            </h2>
            {urgent.map((task) => (
                <div key={task.id} className="mb-3 pb-3 border-b">
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-xs text-gray-500">
                        {task.priority} • {task.difficulty}
                    </p>
                </div>
            ))}
        </div>
    );
}
```

#### IMPACT: 🔥🔥 **Task management 10x better!**

---

### 3️⃣ **🔄 RECURRING/SCHEDULED TASKS** (2 gün) ⭐⭐⭐

#### Problem:
```
❌ "Her hafta mock exam yapmam lazım" - manuel olarak tekrar oluştur?
❌ "Pazarları 3 saat çalış" - reminder atsın?
❌ "Haftanın pazartesisinde 5 görev tamamla" - tracking nasıl yapılır?
❌ Spaced repetition (tekrar tekrar gözden geçirme) otomatik değil
```

#### Çözüm:
```
✅ Recurring pattern: Günlük, Haftalık, Aylık, Custom
✅ Otomatik task generation (midnight'ta cron job)
✅ End date seçeneği ("30 gün boyunca tekrar et")
✅ Dashboard: Future scheduled tasks gösterilir
✅ Spaced repetition science (Leitner System)
```

#### BACKEND Implementation:
```java
// Update Task Entity
@Entity
public class Task {
    // ... existing fields
    
    @Enumerated(EnumType.STRING)
    private RecurrencePattern recurrencePattern;  // NONE, DAILY, WEEKLY, MONTHLY, CUSTOM
    
    private LocalDateTime recurrenceEndDate;      // Tekrar ne zaman bitsyn?
    
    private String recurrenceDays;                // "MON,WED,FRI" for weekly
    
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime nextOccurrenceDate;     // Sonraki tekrarının tarihi
    
    private UUID parentTaskId;                    // Eğer recurring ise ana task
}

// Enum
public enum RecurrencePattern {
    NONE,           // Tekrarlanmaz
    DAILY,          // Her gün
    WEEKLY,         // Haftanın belirtilen günleri
    MONTHLY,        // Her ayın aynı günü
    CUSTOM          // Özel pattern
}

// New Service: RecurrenceService
@Service
public class RecurrenceService {
    
    @Scheduled(cron = "0 0 0 * * *")  // Her gün midnight'ta
    @Transactional
    public void generateRecurringTasks() {
        List<Task> recurringTasks = taskRepository.findRecurring();
        
        for (Task task : recurringTasks) {
            if (task.getRecurrenceEndDate() != null 
                && LocalDate.now().isAfter(task.getRecurrenceEndDate())) {
                continue;  // Tekrar tarihi geçmiş, skip
            }
            
            // Yeni task instance oluştur
            Task newTask = new Task();
            newTask.setTitle(task.getTitle());
            newTask.setDescription(task.getDescription());
            newTask.setDueDate(calculateNextDate(task));
            newTask.setPriority(task.getPriority());
            newTask.setDifficulty(task.getDifficulty());
            newTask.setParentTaskId(task.getId());
            newTask.setUserId(task.getUserId());
            
            taskRepository.save(newTask);
        }
    }
    
    private LocalDateTime calculateNextDate(Task task) {
        LocalDateTime now = LocalDateTime.now();
        
        return switch (task.getRecurrencePattern()) {
            case DAILY -> now.plusDays(1);
            case WEEKLY -> {
                List<String> days = Arrays.asList(task.getRecurrenceDays().split(","));
                LocalDateTime next = now.plusDays(1);
                while (!days.contains(next.getDayOfWeek().toString())) {
                    next = next.plusDays(1);
                }
                yield next;
            }
            case MONTHLY -> now.plusMonths(1).withDayOfMonth(task.getDueDate().getDayOfMonth());
            default -> null;
        };
    }
}

// Repository query
public interface TaskRepository extends JpaRepository<Task, UUID> {
    @Query("SELECT t FROM Task t WHERE t.recurrencePattern != 'NONE'")
    List<Task> findRecurring();
}

// New API Endpoints
@PostMapping("/{taskId}/recurring")
public ResponseEntity<?> makeTaskRecurring(
    @PathVariable UUID taskId,
    @RequestBody RecurrenceRequest request  // pattern, endDate, days
)

@GetMapping("/scheduled")
public ResponseEntity<?> getScheduledTasks()
```

#### FRONTEND Implementation:
```jsx
// TaskCreateForm - Recurring Section
export default function TaskCreateForm() {
    const [recurrence, setRecurrence] = useState('NONE');
    const [recurrenceDays, setRecurrenceDays] = useState([]);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState(null);

    return (
        <form onSubmit={handleCreate}>
            {/* ... existing fields ... */}

            {/* Recurrence Section */}
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">
                    🔄 Recurrence Settings
                </h3>

                <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg mb-4"
                >
                    <option value="NONE">No Recurrence</option>
                    <option value="DAILY">Every Day</option>
                    <option value="WEEKLY">Every Week</option>
                    <option value="MONTHLY">Every Month</option>
                </select>

                {recurrence === 'WEEKLY' && (
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                            Select Days:
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                                <label key={day} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={recurrenceDays.includes(day)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setRecurrenceDays([...recurrenceDays, day]);
                                            } else {
                                                setRecurrenceDays(recurrenceDays.filter(d => d !== day));
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    <span>{day}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Recurrence (Optional):
                    </label>
                    <input
                        type="date"
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-indigo-300 rounded-lg"
                    />
                    {recurrenceEndDate && (
                        <p className="text-xs text-gray-500 mt-1">
                            ℹ️ This task will repeat until {recurrenceEndDate}
                        </p>
                    )}
                </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg">
                Create Task
            </button>
        </form>
    );
}
```

#### ScheduledTasks Widget:
```jsx
// Dashboard.jsx
export default function ScheduledTasksWidget() {
    const [scheduledTasks, setScheduledTasks] = useState([]);

    useEffect(() => {
        fetch('/api/tasks/scheduled')
            .then(res => res.json())
            .then(data => setScheduledTasks(data));
    }, []);

    return (
        <div className="bg-white rounded-lg p-6 border-t-4 border-indigo-500">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">
                📅 Yaklaşan Görevler
            </h2>
            {scheduledTasks.map((task) => (
                <div
                    key={task.id}
                    className="flex items-center justify-between p-3 mb-2 bg-indigo-50 rounded-lg"
                >
                    <div>
                        <p className="font-semibold text-gray-800">
                            {task.title}
                        </p>
                        <p className="text-sm text-gray-600">
                            📅 {new Date(task.nextOccurrenceDate).toLocaleDateString('tr-TR')}
                        </p>
                    </div>
                    <span className="text-sm px-2 py-1 bg-indigo-200 text-indigo-900 rounded">
                        {task.recurrencePattern}
                    </span>
                </div>
            ))}
        </div>
    );
}
```

#### Example Use Cases:
```
1. Mock Exam: "Her Pazarı 3 saat mock exam yap" 
   → WEEKLY, days: [SUN], duration: 180min

2. Review: "Pazarları notlarını gözden geçir"
   → WEEKLY, days: [FRI]

3. Daily Goal: "Her gün 5 saat çalış"
   → DAILY, priority: HIGH

4. Spaced Repetition: "Bu konu tekrar et (1 gün sonra, 3 gün sonra, 7 gün sonra, 14 gün sonra)"
   → 4 task generate et (otomatik)
```

#### IMPACT: 🔥🔥 **Spaced repetition science!**

---

### 4️⃣ **📧 EMAIL VERIFICATION + PASSWORD RESET** (1.5 gün) ⭐⭐⭐

#### Problem:
```
❌ Sahte email ile register edebiliyor
❌ Password forget olduktan sonra hiç reset yapamıyor
❌ Security riski (birisinin emaili üzerinden çalabilir)
```

#### Çözüm:
```
✅ Register → Email verification link gönder
✅ Verify link → Hesap aktifleş
✅ Forgot password → Reset link (24 saat geçerli)
✅ Yeni password set et
```

#### BACKEND Implementation:
```java
// Email Service
@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(User user, String verificationToken) {
        String verificationLink = "https://focusflow.com/verify?token=" + verificationToken;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("FocusFlow - Email Doğrulaması");
        message.setText("Kayıt olduğunuz için teşekkürler!\n\n" +
                "Lütfen hesabınızı doğrulamak için aşağıdaki linke tıklayınız:\n" +
                verificationLink + "\n\n" +
                "Bu link 24 saat boyunca geçerlidir.");
        
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(User user, String resetToken) {
        String resetLink = "https://focusflow.com/reset-password?token=" + resetToken;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("FocusFlow - Şifre Sıfırlama");
        message.setText("Şifrenizi sıfırlamak için aşağıdaki linke tıklayınız:\n" +
                resetLink + "\n\n" +
                "Bu link 24 saat boyunca geçerlidir.\n" +
                "Eğer siz bu isteği yapmadıysanız bu mesajı yoksayın.");
        
        mailSender.send(message);
    }
}

// Update AuthController
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    User user = new User();
    user.setEmail(request.getEmail());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setIsEmailVerified(false);
    
    // Generate verification token (valid for 24 hours)
    String token = UUID.randomUUID().toString();
    user.setEmailVerificationToken(token);
    user.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24));
    
    userRepository.save(user);
    emailService.sendVerificationEmail(user, token);
    
    return ResponseEntity.ok(new MessageResponse("Verification email sent!"));
}

@GetMapping("/verify")
public ResponseEntity<?> verifyEmail(@RequestParam String token) {
    User user = userRepository.findByEmailVerificationToken(token);
    
    if (user == null) {
        return ResponseEntity.badRequest().body(new MessageResponse("Invalid token"));
    }
    
    if (LocalDateTime.now().isAfter(user.getEmailVerificationExpiry())) {
        return ResponseEntity.badRequest().body(new MessageResponse("Token expired"));
    }
    
    user.setIsEmailVerified(true);
    user.setEmailVerificationToken(null);
    userRepository.save(user);
    
    return ResponseEntity.ok(new MessageResponse("Email verified successfully!"));
}

@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
    User user = userRepository.findByEmail(request.getEmail());
    
    if (user == null) {
        return ResponseEntity.badRequest().body(new MessageResponse("Email not found"));
    }
    
    String resetToken = UUID.randomUUID().toString();
    user.setPasswordResetToken(resetToken);
    user.setPasswordResetExpiry(LocalDateTime.now().plusHours(24));
    
    userRepository.save(user);
    emailService.sendPasswordResetEmail(user, resetToken);
    
    return ResponseEntity.ok(new MessageResponse("Reset email sent!"));
}

@PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
    User user = userRepository.findByPasswordResetToken(request.getToken());
    
    if (user == null) {
        return ResponseEntity.badRequest().body(new MessageResponse("Invalid token"));
    }
    
    if (LocalDateTime.now().isAfter(user.getPasswordResetExpiry())) {
        return ResponseEntity.badRequest().body(new MessageResponse("Token expired"));
    }
    
    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    user.setPasswordResetToken(null);
    userRepository.save(user);
    
    return ResponseEntity.ok(new MessageResponse("Password reset successfully!"));
}
```

#### Database Changes:
```sql
ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN email_verification_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN password_reset_expiry TIMESTAMP;
```

#### FRONTEND - Email Verification:
```jsx
// VerifyEmail.jsx
export default function VerifyEmail() {
    const [status, setStatus] = useState('loading');
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/auth/verify?token=${token}`);
                if (response.ok) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error');
            }
        };
        verifyEmail();
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-900 to-green-900">
            <div className="bg-white rounded-lg p-8 shadow-lg">
                {status === 'loading' && (
                    <div className="text-center">
                        <p className="text-xl font-semibold text-indigo-900">
                            ⏳ Verifying your email...
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <p className="text-3xl mb-4">✅</p>
                        <p className="text-xl font-semibold text-green-600">
                            Email verified successfully!
                        </p>
                        <p className="text-gray-600 mt-2">
                            You can now login to your account.
                        </p>
                        <a
                            href="/login"
                            className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Go to Login
                        </a>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <p className="text-3xl mb-4">❌</p>
                        <p className="text-xl font-semibold text-red-600">
                            Verification failed!
                        </p>
                        <p className="text-gray-600 mt-2">
                            The link may be invalid or expired.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
```

#### FRONTEND - Password Reset:
```jsx
// ForgotPasswordPage.jsx
export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-2xl font-semibold text-indigo-900">
                        ✅ Reset email sent!
                    </p>
                    <p className="text-gray-600">
                        Check your email for password reset instructions.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-900 to-green-900">
            <div className="bg-white rounded-lg p-8 shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center text-indigo-900 mb-6">
                    🔐 Password Reset
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                        Send Reset Link
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-4">
                    <a href="/login" className="text-indigo-600 hover:underline">
                        Back to Login
                    </a>
                </p>
            </div>
        </div>
    );
}
```

#### IMPACT: 🔥🔥 **Must-have for security + Premium feature!**

---

## ⚡ **TIER 2: IMPORTANT (1 hafta)**

### 5️⃣ **🔔 SMART NOTIFICATIONS** (1 gün) ⭐⭐⭐

#### Problem:
```
❌ User'ın timer bittiğini bilmiyor
❌ Badge unlocked ama hiç haber almıyor
❌ Goal tamamlandı ama farkında değil
❌ Hiç feedback yok → Demotive olur
```

#### Çözüm:
```
✅ Browser notification + Sound
✅ Notification bell dropdown
✅ Mark as read/unread
✅ Types: TimerEnd, BadgeUnlocked, GoalAchieved, StreakMilestone
```

#### BACKEND Implementation:
```java
// Notification Entity
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    private String title;
    private String message;
    private String actionUrl;
    private boolean isRead;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}

// Enum
public enum NotificationType {
    TIMER_ENDED,        // ⏰ Pomodoro finished
    BADGE_UNLOCKED,     // 🏆 New badge
    GOAL_ACHIEVED,      // 🎯 Goal completed
    STREAK_MILESTONE,   // 🔥 7-day streak
    TASK_COMPLETED,     // ✅ Task done
    CUSTOM              // 📢 Custom message
}

// Notification Service
@Service
public class NotificationService {
    
    public void notifyTimerEnded(User user) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(NotificationType.TIMER_ENDED);
        notification.setTitle("⏰ Time's up!");
        notification.setMessage("Your Pomodoro session is complete. Time for a break!");
        notificationRepository.save(notification);
        // Send real-time via WebSocket
        sendToUser(user.getId(), notification);
    }
    
    public void notifyBadgeUnlocked(User user, Badge badge) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(NotificationType.BADGE_UNLOCKED);
        notification.setTitle("🏆 " + badge.getName() + " Unlocked!");
        notification.setMessage("Congratulations! You earned the " + badge.getName() + " badge.");
        notificationRepository.save(notification);
        sendToUser(user.getId(), notification);
    }
    
    public void sendToUser(UUID userId, Notification notification) {
        // WebSocket ile real-time gönder
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/notifications",
            notification
        );
    }
}

// Controller Endpoints
@GetMapping("/notifications")
public ResponseEntity<?> getNotifications(
    @RequestParam(defaultValue = "0") Integer page,
    @RequestParam(defaultValue = "20") Integer pageSize,
    @RequestParam(defaultValue = "false") Boolean unreadOnly
) {
    Page<Notification> notifications = unreadOnly
        ? notificationRepository.findByUserIdAndIsReadFalse(userId, PageRequest.of(page, pageSize))
        : notificationRepository.findByUserId(userId, PageRequest.of(page, pageSize));
    
    return ResponseEntity.ok(notifications);
}

@PostMapping("/notifications/{notificationId}/read")
public ResponseEntity<?> markAsRead(@PathVariable UUID notificationId) {
    Notification notification = notificationRepository.findById(notificationId).orElse(null);
    if (notification != null) {
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    return ResponseEntity.ok("Marked as read");
}

@PostMapping("/notifications/mark-all-read")
public ResponseEntity<?> markAllAsRead() {
    notificationRepository.markAllAsReadForUser(userId);
    return ResponseEntity.ok("All marked as read");
}
```

#### FRONTEND Implementation:
```jsx
// NotificationBell.jsx
import { useState, useEffect } from 'react';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
        
        // WebSocket connection for real-time updates
        const ws = new WebSocket('ws://localhost:8080/ws/notifications');
        ws.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            setNotifications([notification, ...notifications]);
            setUnreadCount(unreadCount + 1);
            playNotificationSound();
            showBrowserNotification(notification);
        };
        
        return () => ws.close();
    }, []);

    const fetchNotifications = async () => {
        const response = await fetch('/api/notifications?unreadOnly=false&pageSize=20');
        const data = await response.json();
        setNotifications(data.content);
        setUnreadCount(data.content.filter(n => !n.isRead).length);
    };

    const playNotificationSound = () => {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(() => console.log('Sound play failed'));
    };

    const showBrowserNotification = (notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/logo.png'
            });
        }
    };

    const markAsRead = async (notificationId) => {
        await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
        fetchNotifications();
    };

    return (
        <div className="relative">
            {/* Notification Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-indigo-600"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={async () => {
                                        await fetch('/api/notifications/mark-all-read', { method: 'POST' });
                                        fetchNotifications();
                                    }}
                                    className="text-xs text-indigo-600 hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="divide-y">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`
                                    p-4 hover:bg-gray-50 cursor-pointer transition
                                    ${!notification.isRead ? 'bg-indigo-50' : ''}
                                `}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(notification.createdAt).toLocaleTimeString('tr-TR')}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full"></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
```

#### Notification Types Examples:
```javascript
// Timer ended
{
  type: "TIMER_ENDED",
  title: "⏰ Time's up!",
  message: "Your 25-minute Pomodoro session is complete. Time for a 5-minute break!",
  sound: "bell.mp3"
}

// Badge unlocked
{
  type: "BADGE_UNLOCKED",
  title: "🏆 Taskmaster Badge Unlocked!",
  message: "Congratulations! You completed 10 tasks and earned the Taskmaster badge.",
  actionUrl: "/profile"
}

// Goal achieved
{
  type: "GOAL_ACHIEVED",
  title: "🎯 Daily Goal Complete!",
  message: "You studied for 5 hours today! Keep up the great work!",
  actionUrl: "/stats"
}

// Streak milestone
{
  type: "STREAK_MILESTONE",
  title: "🔥 7-Day Streak!",
  message: "Amazing! You've been studying for 7 consecutive days!",
  actionUrl: "/profile"
}
```

#### IMPACT: 🔥🔥 **User engagement +50%!**

---

## ⚡ **TIER 3: NICE-TO-HAVE (2 hafta)**

### 6️⃣ **🌓 DARK/LIGHT MODE** (1.5 gün)

### 7️⃣ **🔍 SEARCH & FILTERING** (1.5 gün)

### 8️⃣ **💬 TASK COMMENTS & AI TUTOR** (2 gün)

### 9️⃣ **⏱️ TIME TRACKING (Estimated vs Actual)** (1 gün)

### 🔟 **📤 DATA EXPORT (CSV/PDF)** (1.5 gün)

---

## 📊 **IMPLEMENTATION TIMELINE**

```
SPRINT 1 (Week 1-2): 6 days
├─ Task Attachments (2d)
├─ Priority + Difficulty (1d)
├─ Recurring Tasks (2d)
└─ Email Verification (1.5d)

SPRINT 2 (Week 3-4): 5 days
├─ Notifications (1d)
├─ Password Reset (1.5d)
└─ Buffer & Testing (2.5d)

SPRINT 3 (Week 5-6): 5-6 days
├─ Dark Mode (1.5d)
├─ Search (1.5d)
├─ Comments/AI (2d)
└─ Buffer & Polish (1-1.5d)

TOTAL: ~16-17 days (Hafta başı-cuma çalışırsan RAHAT!)
```

---

## 🎯 **RECOMMENDATION**

**BU 5 FEATUREYİ YAPTIKTAN SONRA:**

```
1️⃣ Task Attachments (Senin feature!) ✅
2️⃣ Priority + Difficulty ✅
3️⃣ Recurring Tasks ✅
4️⃣ Email Verification + Password Reset ✅
5️⃣ Notifications ✅
```

**Proje şu hale gelecek:**
- 🎓 Gerçek bir öğrenci platformu (not TOY project)
- 👥 Arkadaşlarına gösterebilir (presentation ready)
- 💼 Resume'a yazabilir (portfolio piece)
- 🚀 Jüride strong impact yaratır

---

**Başlayalım mı? TASK ATTACHMENTS'tan kick-off yapalım mı?** 🎯🚀
