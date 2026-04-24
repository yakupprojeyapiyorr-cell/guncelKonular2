package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import lombok.EqualsAndHashCode;
import java.util.UUID;

@Entity
@Table(name = "exam_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ExamQuestionId.class)
public class ExamQuestion {
    @Id
    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Id
    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    private Integer orderIndex;
}

@EqualsAndHashCode
class ExamQuestionId implements java.io.Serializable {
    private UUID exam;
    private UUID question;
}
