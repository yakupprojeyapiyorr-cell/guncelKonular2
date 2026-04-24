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

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionResponse> createQuestion(
            @RequestBody QuestionCreateRequest request) {
        return ResponseEntity.ok(questionService.createQuestion(request, null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
