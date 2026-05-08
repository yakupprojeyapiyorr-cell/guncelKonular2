package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.QuestionCreateRequest;
import com.tezprojesi.api.dto.QuestionResponse;
import com.tezprojesi.api.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/questions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminQuestionController {

    private final QuestionService questionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.data.domain.Page<QuestionResponse>> getQuestions(
            @RequestParam UUID topicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(questionService.getQuestionsByTopic(topicId, org.springframework.data.domain.PageRequest.of(page, size)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionResponse> createQuestion(
            @RequestBody QuestionCreateRequest request) {
        return ResponseEntity.ok(questionService.createQuestion(request, null));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionResponse> updateQuestion(
            @PathVariable UUID id,
            @RequestBody QuestionCreateRequest request) {
        return ResponseEntity.ok(questionService.updateQuestion(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
