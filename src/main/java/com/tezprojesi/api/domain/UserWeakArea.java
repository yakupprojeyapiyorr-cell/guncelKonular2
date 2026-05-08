package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_weak_areas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserWeakArea {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    // Zayıf alan türü: PREREQUISITE_GAP (Ön koşul eksik), CONCEPT_MISUNDERSTANDING (Kavram yanılgısı), PRACTICE_NEEDED (Pratik eksik)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeakAreaType weakAreaType;

    // Kaç soru yanlış yapıldı bu konuda
    @Column(nullable = false)
    @Builder.Default
    private Integer incorrectCount = 0;

    // Toplam çalışılan bu konudaki sorular
    @Column(nullable = false)
    @Builder.Default
    private Integer totalAttempts = 0;

    // Başarı yüzdesi
    @Column(nullable = false)
    @Builder.Default
    private Double successRate = 0.0;

    // İlgili başarısız soruların ID'leri (JSON string olarak saklanabilir)
    @Column(columnDefinition = "TEXT")
    private String relatedFailedQuestionIds;

    // Sonuncu güncelleme
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime lastUpdatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        lastUpdatedAt = LocalDateTime.now();
    }

    public enum WeakAreaType {
        PREREQUISITE_GAP("Ön koşul eksik"),
        CONCEPT_MISUNDERSTANDING("Kavram yanılgısı"),
        PRACTICE_NEEDED("Pratik eksik");

        private final String description;

        WeakAreaType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
