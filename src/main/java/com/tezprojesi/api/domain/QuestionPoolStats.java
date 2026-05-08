package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "question_pool_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionPoolStats {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private int totalQuestions;
    private int generatedCount;
    private int manualCount;
    private int verifiedGenerated;
    private LocalDateTime lastGeneratedAt;
}
