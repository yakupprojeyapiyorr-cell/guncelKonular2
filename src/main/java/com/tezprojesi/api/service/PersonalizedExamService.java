package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.*;
import com.tezprojesi.api.dto.PersonalizedExamResponse;
import com.tezprojesi.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class PersonalizedExamService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final QuestionRepository questionRepository;
    private final TopicRepository topicRepository;
    private final StatisticsService statisticsService;

    /**
     * Basit kişiye özel sınav üret
     * - Zayıf konulara daha fazla soru at
     * - Rastgele sorular seç
     * - Sınav oluştur
     */
    public PersonalizedExamResponse generatePersonalizedExam(UUID userId, int totalQuestions) {
        // Konu başarı oranlarını al
        var topicStats = statisticsService.getTopicStats(userId);
        
        // Zayıf konuları belirle (< %60 başarı)
        List<Topic> weakTopics = new ArrayList<>();
        List<Topic> normalTopics = new ArrayList<>();
        
        for (var stat : topicStats) {
            double accuracy = stat.getCorrectCount() + stat.getWrongCount() > 0 
                    ? (double) stat.getCorrectCount() / (stat.getCorrectCount() + stat.getWrongCount()) * 100 
                    : 0;
            
            Topic topic = topicRepository.findById(stat.getTopicId()).orElse(null);
            if (topic != null) {
                if (accuracy < 60) {
                    weakTopics.add(topic);
                } else {
                    normalTopics.add(topic);
                }
            }
        }

        // Dağılım: Zayıf konulara %60, normal konulara %40
        int weakCount = (int) (totalQuestions * 0.6);
        int normalCount = totalQuestions - weakCount;

        // Sorular seç
        List<UUID> selectedQuestionIds = new ArrayList<>();
        
        // Zayıf konulardan sorular
        for (Topic topic : weakTopics) {
            int perTopic = weakCount / Math.max(weakTopics.size(), 1);
            if (perTopic <= 0) continue;
            List<Question> topicQuestions = questionRepository.findByTopicId(topic.getId(), PageRequest.of(0, perTopic))
                    .getContent();
            
            topicQuestions.forEach(q -> selectedQuestionIds.add(q.getId()));
        }

        // Normal konulardan sorular
        for (Topic topic : normalTopics) {
            int perTopic = normalCount / Math.max(normalTopics.size(), 1);
            if (perTopic <= 0) continue;
            List<Question> topicQuestions = questionRepository.findByTopicId(topic.getId(), PageRequest.of(0, perTopic))
                    .getContent();
            
            topicQuestions.forEach(q -> selectedQuestionIds.add(q.getId()));
        }

        // Sınav oluştur
        Exam exam = Exam.builder()
                .title("Kişisel Deneme Sınavı - " + new java.text.SimpleDateFormat("dd.MM").format(new Date()))
                .durationMinutes(135)
                .isPublished(true)
                .createdBy(User.builder().id(userId).build())
                .build();

        exam = examRepository.save(exam);

        // Soruları sınava ekle
        int order = 0;
        for (UUID questionId : selectedQuestionIds) {
            Question question = questionRepository.findById(questionId).orElse(null);
            if (question != null) {
                ExamQuestion examQuestion = ExamQuestion.builder()
                        .exam(exam)
                        .question(question)
                        .orderIndex(order++)
                        .build();
                examQuestionRepository.save(examQuestion);
            }
        }

        // Dağılımı göster
        Map<String, Integer> distribution = new LinkedHashMap<>();
        for (Topic topic : weakTopics) {
            long count = selectedQuestionIds.stream()
                    .filter(qId -> questionRepository.findById(qId)
                            .map(q -> q.getTopic().getId().equals(topic.getId()))
                            .orElse(false))
                    .count();
            if (count > 0) {
                distribution.put(topic.getName(), (int) count);
            }
        }

        return PersonalizedExamResponse.builder()
                .examId(exam.getId())
                .examName(exam.getTitle())
                .totalQuestions(selectedQuestionIds.size())
                .questionDistribution(distribution)
                .build();
    }
}
