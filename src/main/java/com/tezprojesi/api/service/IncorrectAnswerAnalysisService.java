package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.*;
import com.tezprojesi.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncorrectAnswerAnalysisService {
    
    private final UserAnswerRepository userAnswerRepository;
    private final UserWeakAreaRepository userWeakAreaRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    /**
     * Başarısız cevapları analiz et ve zayıf alanları güncelle
     */
    public void analyzeAndRecordIncorrectAnswers(UUID userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return;

        User user = userOpt.get();

        // Kullanıcının başarısız cevaplarını getir
        List<UserAnswer> incorrectAnswers = userAnswerRepository.findByExamResultUserIdAndIsCorrectFalse(userId);
        
        if (incorrectAnswers.isEmpty()) return;

        // Konu başı başına başarısızlıkları grupla
        Map<UUID, List<UserAnswer>> incorrectByTopic = incorrectAnswers.stream()
                .filter(ua -> ua.getQuestion() != null && ua.getQuestion().getTopic() != null)
                .collect(Collectors.groupingBy(ua -> ua.getQuestion().getTopic().getId()));

        // Her konu için UserWeakArea oluştur veya güncelle
        for (Map.Entry<UUID, List<UserAnswer>> entry : incorrectByTopic.entrySet()) {
            UUID topicId = entry.getKey();
            List<UserAnswer> topicIncorrectAnswers = entry.getValue();

            Optional<Topic> topicOpt = topicRepository.findById(topicId);
            if (topicOpt.isEmpty()) continue;

            Topic topic = topicOpt.get();

            // Bu konu için başarı oranını hesapla
            double successRate = calculateSuccessRateForTopic(userId, topicId);

            // Weak area type'ı belirle
            UserWeakArea.WeakAreaType weakAreaType = determineWeakAreaType(successRate, topicIncorrectAnswers);

            // Var olan weak area'yı güncelle veya yeni oluştur
            Optional<UserWeakArea> existingWeakArea = userWeakAreaRepository.findByUserIdAndTopicId(userId, topicId);
            
            UserWeakArea weakArea;
            if (existingWeakArea.isPresent()) {
                weakArea = existingWeakArea.get();
                weakArea.setIncorrectCount(topicIncorrectAnswers.size());
                weakArea.setSuccessRate(successRate);
                weakArea.setWeakAreaType(weakAreaType);
            } else {
                int totalAttempts = (int) countByUserAndTopic(userId, topic);
                weakArea = UserWeakArea.builder()
                        .user(user)
                        .topic(topic)
                        .weakAreaType(weakAreaType)
                        .incorrectCount(topicIncorrectAnswers.size())
                        .successRate(successRate)
                        .totalAttempts(totalAttempts)
                        .relatedFailedQuestionIds(topicIncorrectAnswers.stream()
                                .map(ua -> ua.getQuestion().getId().toString())
                                .limit(5)
                                .collect(Collectors.joining(",")))
                        .build();
            }

            userWeakAreaRepository.save(weakArea);
        }
    }

    /**
     * Bir konu için başarı oranını hesapla
     */
    private double calculateSuccessRateForTopic(UUID userId, UUID topicId) {
        List<UserAnswer> allAnswersForTopic = userAnswerRepository.findByUserIdAndQuestionTopic(userId, topicId);
        
        if (allAnswersForTopic.isEmpty()) return 100.0;

        long correctAnswers = allAnswersForTopic.stream()
                .filter(ua -> ua.getIsCorrect() != null && ua.getIsCorrect())
                .count();

        return (correctAnswers * 100.0) / allAnswersForTopic.size();
    }

    /**
     * Başarısızlık türünü başarı oranına göre belirle
     */
    private UserWeakArea.WeakAreaType determineWeakAreaType(double successRate, List<UserAnswer> incorrectAnswers) {
        if (successRate < 35) {
            return UserWeakArea.WeakAreaType.PREREQUISITE_GAP; // Ön koşul eksik
        } else if (successRate < 55) {
            return UserWeakArea.WeakAreaType.CONCEPT_MISUNDERSTANDING; // Kavram yanılgısı
        } else {
            return UserWeakArea.WeakAreaType.PRACTICE_NEEDED; // Pratik eksik
        }
    }

    /**
     * Kullanıcının en kritik zayıf alanlarını getir
     */
    public List<UserWeakArea> getCriticalWeakAreas(UUID userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return userWeakAreaRepository.findCriticalWeakAreas(userId, 0.6, pageable);
    }

    /**
     * Tüm zayıf alanları getir (başarı oranına göre sıralı)
     */
    public List<UserWeakArea> getAllWeakAreas(UUID userId) {
        return userWeakAreaRepository.findByUserIdOrderBySuccessRate(userId);
    }

    private long countByUserAndTopic(UUID userId, Topic topic) {
        return userAnswerRepository.findByUserIdAndQuestionTopic(userId, topic.getId()).size();
    }
}
