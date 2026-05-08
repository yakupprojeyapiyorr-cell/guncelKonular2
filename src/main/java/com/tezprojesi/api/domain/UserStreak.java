package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_streaks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStreak {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    private Integer currentStreak = 0;
    @Builder.Default
    private Integer longestStreak = 0;
    private LocalDate lastActiveDate;
}
