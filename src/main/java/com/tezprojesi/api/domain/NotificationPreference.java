package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    private boolean pushFriendRequests = true;
    @Builder.Default
    private boolean pushExamReminders = true;
    @Builder.Default
    private boolean pushWeakPoints = true;
    @Builder.Default
    private boolean pushAchievements = true;
    @Builder.Default
    private boolean pushDailyGoals = true;

    private String quietHoursStart; // "22:00"
    private String quietHoursEnd;   // "08:00"

    private LocalDateTime updatedAt;
}
