package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "push_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PushSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 500, nullable = false)
    private String endpoint;

    @Column(nullable = false)
    private String authKey;

    @Column(nullable = false)
    private String p256dhKey;

    @Builder.Default
    private boolean isActive = true;

    private LocalDateTime subscribedAt;

    private LocalDateTime lastUsedAt;
}
