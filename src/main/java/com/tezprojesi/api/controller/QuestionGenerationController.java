package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.GeneratedQuestionRequest;
import com.tezprojesi.api.dto.GeneratedQuestionResponse;
import com.tezprojesi.api.service.QuestionGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/questions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class QuestionGenerationController {

    private final QuestionGenerationService questionGenerationService;

    @PostMapping("/generate")
    public ResponseEntity<List<GeneratedQuestionResponse>> generateQuestions(@RequestBody GeneratedQuestionRequest request) {
        List<GeneratedQuestionResponse> questions = questionGenerationService.generateQuestionsByTopic(
                request.getTopicId(), request.getDifficulty(), request.getCount());
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<GeneratedQuestionResponse>> getPendingQuestions() {
        return ResponseEntity.ok(questionGenerationService.getPendingQuestions());
    }

    @PostMapping("/validate/{id}")
    public ResponseEntity<Void> validateQuestion(
            @PathVariable UUID id,
            @RequestParam String feedback,
            @RequestParam boolean isApproved) {
        questionGenerationService.validateGeneratedQuestion(id, feedback, isApproved);
        return ResponseEntity.ok().build();
    }
}
