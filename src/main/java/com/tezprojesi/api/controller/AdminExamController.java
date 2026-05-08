package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.ExamResponse;
import com.tezprojesi.api.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import java.util.UUID;

@RestController
@RequestMapping("/admin/exams")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminExamController {

    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamResponse> createExam(@RequestBody com.tezprojesi.api.dto.ExamCreateRequest request, Authentication authentication) {
        UUID adminId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(examService.createExam(request, adminId));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamResponse> publishExam(@PathVariable UUID id) {
        return ResponseEntity.ok(examService.publishExam(id));
    }
}
