package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.Question;
import com.tezprojesi.api.domain.Question.Difficulty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
    Page<Question> findByTopicId(UUID topicId, Pageable pageable);
    Page<Question> findByTopicIdAndDifficulty(UUID topicId, Difficulty difficulty, Pageable pageable);
}
