package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.GeneratedQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface GeneratedQuestionRepository extends JpaRepository<GeneratedQuestion, UUID> {
    List<GeneratedQuestion> findByTopicIdAndIsValidatedAndDifficulty(UUID topicId, boolean isValidated, GeneratedQuestion.Difficulty difficulty);
    List<GeneratedQuestion> findByValidationStatus(GeneratedQuestion.ValidationStatus status);
}
