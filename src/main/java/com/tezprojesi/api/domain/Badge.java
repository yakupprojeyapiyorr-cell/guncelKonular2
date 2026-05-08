package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String code; // STREAK_7, PERFECT_EXAM, etc.

    @Column(nullable = false)
    private String name;

    private String description;
    private String iconUrl;
}
