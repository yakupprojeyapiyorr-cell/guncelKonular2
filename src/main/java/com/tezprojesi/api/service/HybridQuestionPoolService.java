package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.GeneratedQuestion;
import com.tezprojesi.api.domain.Question;
import com.tezprojesi.api.repository.GeneratedQuestionRepository;
import com.tezprojesi.api.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HybridQuestionPoolService {

    private final QuestionRepository questionRepository;
    private final GeneratedQuestionRepository generatedQuestionRepository;

    public List<Object> getHybridPool(UUID topicId, int count, String difficulty) {
        int manualCount = (int) (count * 0.7);
        int generatedCount = count - manualCount;

        List<Question> manualQuestions = questionRepository.findByTopicIdAndDifficulty(
                topicId, Question.Difficulty.valueOf(difficulty.toUpperCase()), Pageable.ofSize(manualCount)).getContent();

        List<GeneratedQuestion> generatedQuestions = generatedQuestionRepository.findByTopicIdAndIsValidatedAndDifficulty(
                topicId, true, GeneratedQuestion.Difficulty.valueOf(difficulty.toUpperCase()));

        // Limit generated questions to requested count
        List<GeneratedQuestion> limitedGenerated = generatedQuestions.stream()
                .limit(generatedCount)
                .collect(Collectors.toList());

        List<Object> pool = new ArrayList<>();
        pool.addAll(manualQuestions);
        pool.addAll(limitedGenerated);
        
        Collections.shuffle(pool);
        return pool;
    }
}
