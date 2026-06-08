package com.tezprojesi.api.config;

import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.domain.Badge;
import com.tezprojesi.api.repository.UserRepository;
import com.tezprojesi.api.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.tezprojesi.api.repository.TaskRepository taskRepository;
    private final com.tezprojesi.api.repository.PomodoroSessionRepository pomodoroSessionRepository;
    private final com.tezprojesi.api.repository.StudyPlanRepository studyPlanRepository;
    private final com.tezprojesi.api.repository.UserProfileRepository userProfileRepository;
    private final BadgeRepository badgeRepository;

    @Override
    public void run(String... args) {
        seedBadges();
        ensureAdminUser();
        ensureStudentUser();
        seedDummyData();
    }

    private User ensureAdminUser() {
        return userRepository.findByEmail("admin@focusflow.com")
                .orElseGet(() -> {
                    User admin = User.builder()
                            .name("Admin")
                            .surname("Focus")
                            .email("admin@focusflow.com")
                            .passwordHash(passwordEncoder.encode("admin123"))
                            .role(User.UserRole.ADMIN)
                            .build();
                    return userRepository.save(admin);
                });
    }

    private void ensureStudentUser() {
        userRepository.findByEmail("ogrenci@focusflow.com")
                .orElseGet(() -> {
                    User user = User.builder()
                            .name("Yakup")
                            .surname("Yilmaz")
                            .email("ogrenci@focusflow.com")
                            .passwordHash(passwordEncoder.encode("user123"))
                            .role(User.UserRole.STUDENT)
                            .subscriptionType(User.SubscriptionType.FREE)
                            .build();
                    user = userRepository.save(user);

                    com.tezprojesi.api.domain.UserProfile profile = com.tezprojesi.api.domain.UserProfile.builder()
                            .user(user)
                            .onboardingCompleted(true)
                            .dailyStudyHours(6)
                            .examType("YKS")
                            .build();
                    userProfileRepository.save(profile);

                    return user;
                });
    }

    private void seedDummyData() {
        if (userRepository.count() > 2) return; // Zaten doluysa ekleme

        java.util.List<User> dummies = java.util.List.of(
            User.builder().name("Ayşe").surname("Yılmaz").email("ayse@test.com").passwordHash(passwordEncoder.encode("test123")).role(User.UserRole.STUDENT).subscriptionType(User.SubscriptionType.PREMIUM).grade("12. Sınıf").targetUniversity("Boğaziçi Bilgisayar Mühendisliği").build(),
            User.builder().name("Mehmet").surname("Kaya").email("mehmet@test.com").passwordHash(passwordEncoder.encode("test123")).role(User.UserRole.STUDENT).subscriptionType(User.SubscriptionType.FREE).grade("Mezun").targetUniversity("ODTÜ Elektrik Elektronik").build(),
            User.builder().name("Zeynep").surname("Demir").email("zeynep@test.com").passwordHash(passwordEncoder.encode("test123")).role(User.UserRole.STUDENT).subscriptionType(User.SubscriptionType.PREMIUM).grade("11. Sınıf").targetUniversity("Hacettepe Tıp").build(),
            User.builder().name("Ali").surname("Can").email("ali@test.com").passwordHash(passwordEncoder.encode("test123")).role(User.UserRole.STUDENT).subscriptionType(User.SubscriptionType.FREE).grade("12. Sınıf").targetUniversity("İTÜ Makine Mühendisliği").build(),
            User.builder().name("Elif").surname("Şahin").email("elif@test.com").passwordHash(passwordEncoder.encode("test123")).role(User.UserRole.STUDENT).subscriptionType(User.SubscriptionType.PREMIUM).grade("12. Sınıf").targetUniversity("Bilkent Endüstri Mühendisliği").build()
        );

        userRepository.saveAll(dummies);

        String[] planKonulari = {
            "TYT Matematik - Problemler Soru Çözümü",
            "AYT Fizik - Newton'un Hareket Yasaları Konu Tekrarı",
            "AYT Kimya - Organik Kimya Okuması",
            "Paragraf Soru Çözümü (30 Soru)",
            "TYT Türkçe - Dil Bilgisi Karma Test",
            "AYT Biyoloji - Sistemler Tekrarı ve Çıkmış Sorular"
        };

        for (User user : dummies) {
            // Rastgele 2-5 adet görev ekle
            int taskCount = (int)(Math.random() * 4) + 2;
            for (int i = 0; i < taskCount; i++) {
                com.tezprojesi.api.domain.Task task = com.tezprojesi.api.domain.Task.builder()
                        .user(user)
                        .title("Örnek Görev " + (i + 1))
                        .description("Test amaçlı oluşturulmuş görev.")
                        .completed(Math.random() > 0.5)
                        .build();
                taskRepository.save(task);
            }

            // Rastgele 3-8 adet pomodoro seansı ekle
            int pomodoroCount = (int)(Math.random() * 6) + 3;
            for (int i = 0; i < pomodoroCount; i++) {
                com.tezprojesi.api.domain.PomodoroSession session = com.tezprojesi.api.domain.PomodoroSession.builder()
                        .user(user)
                        .durationMinutes(25)
                        .startedAt(java.time.LocalDateTime.now().minusDays((int)(Math.random() * 7)).minusHours((int)(Math.random() * 5)))
                        .endedAt(java.time.LocalDateTime.now())
                        .build();
                pomodoroSessionRepository.save(session);
            }

            // Profesyonel Çalışma Planları Ekle (Geçmiş ve Gelecek)
            int planCount = (int)(Math.random() * 5) + 4; // Her kullanıcıya 4-8 arası plan
            for (int i = 0; i < planCount; i++) {
                int randomDaysOffset = (int)(Math.random() * 14) - 7; // -7 ile +7 gün arası
                String randomTopic = planKonulari[(int)(Math.random() * planKonulari.length)];
                
                com.tezprojesi.api.domain.StudyPlan plan = com.tezprojesi.api.domain.StudyPlan.builder()
                        .user(user)
                        .planDate(java.time.LocalDate.now().plusDays(randomDaysOffset))
                        .durationMinutes(new int[]{45, 60, 90, 120}[(int)(Math.random() * 4)])
                        .content(randomTopic)
                        .isCompleted(randomDaysOffset < 0 ? Math.random() > 0.3 : false) // Geçmiştekilerin çoğu tamamlanmış, gelecektekiler false
                        .build();
                studyPlanRepository.save(plan);
            }

            // Onboarding'i atlamaları için profil oluştur
            com.tezprojesi.api.domain.UserProfile profile = com.tezprojesi.api.domain.UserProfile.builder()
                    .user(user)
                    .onboardingCompleted(true)
                    .dailyStudyHours(6)
                    .examType("YKS")
                    .build();
            userProfileRepository.save(profile);
        }
    }

    private void seedBadges() {
        if (badgeRepository.count() > 0) return; // Zaten rozetler var

        java.util.List<Badge> badges = java.util.List.of(
            Badge.builder()
                    .code("FIRST_TASK")
                    .name("İlk Adım")
                    .description("1 görevi tamamladığın için tebrikler!")
                    .iconUrl("🎯")
                    .build(),
            Badge.builder()
                    .code("TASK_LEGEND_10")
                    .name("Görev Öncüsü")
                    .description("10 görevi tamamladığın için tebrikler!")
                    .iconUrl("⭐")
                    .build(),
            Badge.builder()
                    .code("TASK_MASTER_50")
                    .name("Görev Ustası")
                    .description("50 görevi tamamladığın için tebrikler!")
                    .iconUrl("🏆")
                    .build(),
            Badge.builder()
                    .code("TASK_LEGEND_100")
                    .name("Görev Efsanesi")
                    .description("100 görevi tamamladığın için tebrikler!")
                    .iconUrl("👑")
                    .build(),
            Badge.builder()
                    .code("TASK_IMMORTAL_150")
                    .name("Ölümsüz Görev Tanrısı")
                    .description("150 görevi tamamladığın için tebrikler!")
                    .iconUrl("💎")
                    .build()
        );

        badgeRepository.saveAll(badges);
    }
}
