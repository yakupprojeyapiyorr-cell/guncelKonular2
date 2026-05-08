package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private GoalType type; // DAILY, WEEKLY, MONTHLY

    @Enumerated(EnumType.STRING)
    private TargetType targetType; // STUDY_MINUTES, QUESTION_COUNT, TOPIC_COMPLETION

    @Column(nullable = false)
    private Integer targetValue;

    @Builder.Default
    private Integer currentValue = 0;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;

    private LocalDate startDate;
    private LocalDate endDate;

    @Builder.Default
    private Boolean isCompleted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum GoalType {
        DAILY, WEEKLY, MONTHLY
    }

    public enum TargetType {
        STUDY_MINUTES, QUESTION_COUNT, TOPIC_COMPLETION
    }
}
