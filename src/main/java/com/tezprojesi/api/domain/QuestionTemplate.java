package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "question_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String templateText;

    private String difficultyLevel;

    @ElementCollection
    private List<String> topics;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> exampleOutput;

    private LocalDateTime createdAt;
}
