package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Question;
import com.tezprojesi.api.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionPoolManagementService {

    private final QuestionRepository questionRepository;

    @Transactional
    public void deleteQuestion(UUID id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setActive(false);
        questionRepository.save(question);
    }

    @Transactional
    public void bulkCategorize(List<UUID> ids, String category, List<String> tags) {
        List<Question> questions = questionRepository.findAllById(ids);
        for (Question q : questions) {
            if (q.getTags() == null) {
                q.setTags(tags);
            } else {
                q.getTags().addAll(tags);
            }
        }
        questionRepository.saveAll(questions);
    }

    public Map<String, Object> getPoolAnalytics() {
        List<Question> allQuestions = questionRepository.findAll();
        
        long manualCount = allQuestions.stream().filter(q -> q.getSource() == Question.QuestionSource.MANUAL).count();
        long generatedCount = allQuestions.stream().filter(q -> q.getSource() == Question.QuestionSource.GENERATED).count();
        
        Map<Question.Difficulty, Long> difficultyDistribution = allQuestions.stream()
                .collect(Collectors.groupingBy(Question::getDifficulty, Collectors.counting()));

        return Map.of(
            "total", allQuestions.size(),
            "manualCount", manualCount,
            "generatedCount", generatedCount,
            "difficultyDistribution", difficultyDistribution
        );
    }
}
