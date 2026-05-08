package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    // Soru görseli (tüm dersler) - öğrenci bunu görüyor, ama fotoğraf olduğunu bilmiyor
    // Admin fotoğraf yükler, GPT metne çevirir, öğrenci temiz metin görür
    private String questionImageUrl;

    // Çözüm görseli (sadece sayısal dersler) - öğrenci HİÇ görmez, AI arka planda kullanır
    private String solutionImageUrl;

    private String imageUrl; // Legacy - admin panelinde görünen görsel URL'si
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    private BigDecimal coefficient;

    @Column(nullable = false)
    private Integer correctOption;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionOption> options;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private QuestionSource source = QuestionSource.MANUAL;

    @ElementCollection
    private List<String> tags;

    @Builder.Default
    private int poolVersion = 1;

    @Builder.Default
    private boolean isActive = true;

    public enum QuestionSource {
        MANUAL, GENERATED, IMPORTED
    }

    public enum Difficulty {
        EASY, MEDIUM, HARD, EXAM
    }
}
