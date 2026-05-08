package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, UUID> {
    List<UserAnswer> findByExamResultId(UUID examResultId);
    List<UserAnswer> findByExamResultUserId(UUID userId);
    List<UserAnswer> findByExamResultUserIdAndIsCorrectFalse(UUID userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT ua FROM UserAnswer ua WHERE ua.examResult.user.id = :userId AND ua.question.topic.id = :topicId")
    List<UserAnswer> findByUserIdAndQuestionTopic(UUID userId, UUID topicId);
}
