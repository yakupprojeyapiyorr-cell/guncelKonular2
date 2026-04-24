package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.*;
import com.tezprojesi.api.dto.ExamResultResponse;
import com.tezprojesi.api.dto.ExamResponse;
import com.tezprojesi.api.dto.UserAnswerRequest;
import com.tezprojesi.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final QuestionRepository questionRepository;

    public List<ExamResponse> getPublishedExams() {
        return examRepository.findByIsPublishedTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ExamResponse getExam(UUID examId) {
        var exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        return mapToResponse(exam);
    }

    public ExamResultResponse submitExam(UUID examId, UUID userId, List<UserAnswerRequest> answers) {
        var exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        int correct = 0;
        int wrong = 0;
        int blank = 0;

        var examResult = ExamResult.builder()
                .exam(exam)
                .user(User.builder().id(userId).build())
                .correctCount(0)
                .wrongCount(0)
                .blankCount(0)
                .netScore(BigDecimal.ZERO)
                .build();

        examResult = examResultRepository.save(examResult);

        for (var answer : answers) {
            var question = questionRepository.findById(answer.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));

            boolean isCorrect = false;
            if (answer.getSelectedOption() != null && answer.getSelectedOption() >= 0) {
                isCorrect = question.getCorrectOption().equals(answer.getSelectedOption());
                if (isCorrect) correct++;
                else wrong++;
            } else {
                blank++;
            }

            var userAnswer = UserAnswer.builder()
                    .examResult(examResult)
                    .question(question)
                    .selectedOption(answer.getSelectedOption())
                    .isCorrect(isCorrect)
                    .build();

            userAnswerRepository.save(userAnswer);
        }

        BigDecimal netScore = BigDecimal.valueOf(correct).subtract(
                BigDecimal.valueOf(wrong).divide(BigDecimal.valueOf(4), 2, java.math.RoundingMode.HALF_UP)
        );

        examResult.setCorrectCount(correct);
        examResult.setWrongCount(wrong);
        examResult.setBlankCount(blank);
        examResult.setNetScore(netScore);
        examResult = examResultRepository.save(examResult);

        return mapResultToResponse(examResult);
    }

    public ExamResultResponse getExamResult(UUID resultId) {
        var result = examResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));
        return mapResultToResponse(result);
    }

    public Page<ExamResultResponse> getExamLeaderboard(UUID examId, Pageable pageable) {
        return examResultRepository.findByExamIdOrderByNetScoreDesc(examId, pageable)
                .map(this::mapResultToResponse);
    }

    private ExamResponse mapToResponse(Exam exam) {
        return ExamResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .durationMinutes(exam.getDurationMinutes())
                .isPublished(exam.getIsPublished())
                .createdAt(exam.getCreatedAt())
                .build();
    }

    private ExamResultResponse mapResultToResponse(ExamResult result) {
        return ExamResultResponse.builder()
                .id(result.getId())
                .examId(result.getExam().getId())
                .correctCount(result.getCorrectCount())
                .wrongCount(result.getWrongCount())
                .blankCount(result.getBlankCount())
                .netScore(result.getNetScore())
                .completedAt(result.getCompletedAt())
                .build();
    }
}
