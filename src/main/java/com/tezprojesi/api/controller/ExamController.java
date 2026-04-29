package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.ExamResponse;
import com.tezprojesi.api.dto.ExamResultResponse;
import com.tezprojesi.api.dto.UserAnswerRequest;
import com.tezprojesi.api.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/exams")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    public ResponseEntity<List<ExamResponse>> getPublishedExams() {
        return ResponseEntity.ok(examService.getPublishedExams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamResponse> getExam(@PathVariable UUID id) {
        return ResponseEntity.ok(examService.getExam(id));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ExamResultResponse> submitExam(
            @PathVariable UUID id,
            @RequestBody List<UserAnswerRequest> answers,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(examService.submitExam(id, userId, answers));
    }

    @GetMapping("/{examId}/leaderboard")
    public ResponseEntity<Page<ExamResultResponse>> getLeaderboard(
            @PathVariable UUID examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(examService.getExamLeaderboard(examId, pageable));
    }

    @GetMapping("/{id}/results/{resultId}")
    public ResponseEntity<ExamResultResponse> getExamResult(
            @PathVariable UUID resultId) {
        return ResponseEntity.ok(examService.getExamResult(resultId));
    }
}
