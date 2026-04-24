package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.QuestionCreateRequest;
import com.tezprojesi.api.dto.QuestionResponse;
import com.tezprojesi.api.dto.QuestionAnswerRequest;
import com.tezprojesi.api.dto.QuestionAnswerResponse;
import com.tezprojesi.api.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getQuestion(@PathVariable UUID id) {
        return ResponseEntity.ok(questionService.getQuestion(id));
    }

    @GetMapping
    public ResponseEntity<Page<QuestionResponse>> getQuestions(
            @RequestParam UUID topicId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<QuestionResponse> questions;
        
        if (difficulty != null && !difficulty.isEmpty()) {
            questions = questionService.getQuestionsByTopicAndDifficulty(
                    topicId, 
                    com.tezprojesi.api.domain.Question.Difficulty.valueOf(difficulty.toUpperCase()),
                    pageable
            );
        } else {
            questions = questionService.getQuestionsByTopic(topicId, pageable);
        }
        
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<QuestionAnswerResponse> answerQuestion(
            @PathVariable UUID id,
            @RequestBody QuestionAnswerRequest request) {
        var question = questionService.getQuestion(id);
        
        boolean isCorrect = question.getCorrectOption().equals(request.getSelectedOption());
        BigDecimal points = isCorrect ? 
                question.getCoefficient() : 
                question.getCoefficient().negate().divide(BigDecimal.valueOf(4));

        var response = QuestionAnswerResponse.builder()
                .isCorrect(isCorrect)
                .correctOption(question.getCorrectOption())
                .pointsEarned(points)
                .generalExplanation(isCorrect ? 
                        "Doğru cevap seçtiniz!" : 
                        "Bu cevap yanlış. Lütfen açıklamaları okuyunuz.")
                .options(question.getOptions().stream()
                        .map(opt -> QuestionAnswerResponse.OptionExplanation.builder()
                                .index(opt.getIndex())
                                .text(opt.getText())
                                .whyText(opt.getWhyText())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        return ResponseEntity.ok(response);
    }
}
