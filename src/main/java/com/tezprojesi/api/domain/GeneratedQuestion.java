package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "generated_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratedQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Enumerated(EnumType.STRING)
    private QuestionType questionType;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> options;

    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private String generatedBy;

    private LocalDateTime generatedAt;

    @Builder.Default
    private boolean isValidated = false;

    @Enumerated(EnumType.STRING)
    private ValidationStatus validationStatus;

    @Builder.Default
    private int usageCount = 0;

    private Double rating;

    public enum QuestionType {
        MULTIPLE_CHOICE, TRUE_FALSE, ESSAY
    }

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public enum ValidationStatus {
        PENDING, APPROVED, REJECTED
    }
}
