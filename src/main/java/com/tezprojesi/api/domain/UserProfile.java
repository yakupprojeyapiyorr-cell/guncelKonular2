package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String examType; // TYT, AYT, BOTH
    private Double targetTytNet;
    private Double targetAytNet;
    private Integer dailyStudyHours;
    @Builder.Default
    private Boolean onboardingCompleted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
