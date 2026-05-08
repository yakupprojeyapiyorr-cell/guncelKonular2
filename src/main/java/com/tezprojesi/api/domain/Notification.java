package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    private String actionUrl;
    private String icon;
    private String badge;
    private String tag;

    @Builder.Default
    private Boolean isRead = false;
    @Builder.Default
    private Boolean sentViaPush = false;
    @Builder.Default
    private Boolean inAppShown = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    public enum NotificationType {
        FRIEND_REQUEST,
        EXAM_START,
        WEAK_POINT,
        GOAL_REACHED,
        STREAK_MILESTONE,
        SYSTEM_INFO,
        POMODORO_END,
        EXAM_REMINDER,
        STREAK_RISK,
        WEAK_TOPIC_ALERT,
        GOAL_ACHIEVED
    }
}
