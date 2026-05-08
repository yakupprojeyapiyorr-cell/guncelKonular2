package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.UserScore;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.domain.ExamResult;
import com.tezprojesi.api.dto.UserScoreResponse;
import com.tezprojesi.api.repository.UserScoreRepository;
import com.tezprojesi.api.repository.ExamResultRepository;
import com.tezprojesi.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScoringService {

    private final UserScoreRepository userScoreRepository;
    private final ExamResultRepository examResultRepository;
    private final UserRepository userRepository;

    /**
     * Kullanıcının skorunu güncelle (her sınav sonrası çağır)
     */
    public void updateUserScore(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ExamResult> results = examResultRepository.findByUserId(userId);

        if (results.isEmpty()) {
            return;
        }

        BigDecimal totalScore = results.stream()
                .map(ExamResult::getNetScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageScore = totalScore.divide(BigDecimal.valueOf(results.size()), 2, java.math.RoundingMode.HALF_UP);

        long totalCorrect = results.stream().mapToInt(ExamResult::getCorrectCount).sum();
        long totalWrong = results.stream().mapToInt(ExamResult::getWrongCount).sum();

        UserScore userScore = userScoreRepository.findByUserId(userId)
                .orElse(UserScore.builder().user(user).build());

        userScore.setTotalScore(totalScore);
        userScore.setExamCount(results.size());
        userScore.setAverageScore(averageScore);
        userScore.setCorrectCount((int) totalCorrect);
        userScore.setWrongCount((int) totalWrong);

        userScoreRepository.save(userScore);
    }

    /**
     * Leaderboard: En yüksek skorlu kullanıcıları getir
     */
    public Page<UserScoreResponse> getLeaderboard(Pageable pageable) {
        return userScoreRepository.findAllByOrderByTotalScoreDesc(pageable)
                .map(this::mapToResponse);
    }

    /**
     * Kullanıcının skorunu getir
     */
    public UserScoreResponse getUserScore(UUID userId) {
        UserScore score = userScoreRepository.findByUserId(userId)
                .orElse(UserScore.builder()
                        .totalScore(BigDecimal.ZERO)
                        .examCount(0)
                        .averageScore(BigDecimal.ZERO)
                        .correctCount(0)
                        .wrongCount(0)
                        .build());
        return mapToResponse(score);
    }

    private UserScoreResponse mapToResponse(UserScore score) {
        return UserScoreResponse.builder()
                .userId(score.getUser().getId())
                .userName(score.getUser().getName())
                .totalScore(score.getTotalScore())
                .examCount(score.getExamCount())
                .averageScore(score.getAverageScore())
                .correctCount(score.getCorrectCount())
                .wrongCount(score.getWrongCount())
                .accuracy(score.getCorrectCount() + score.getWrongCount() > 0 
                        ? (double) score.getCorrectCount() / (score.getCorrectCount() + score.getWrongCount()) * 100 
                        : 0.0)
                .build();
    }
}
