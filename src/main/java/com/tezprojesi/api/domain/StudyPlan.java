package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "study_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate planDate;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;

    private Integer durationMinutes;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    private Boolean isCompleted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
