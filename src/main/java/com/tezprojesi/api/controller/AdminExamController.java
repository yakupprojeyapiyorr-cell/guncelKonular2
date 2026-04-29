package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.ExamResponse;
import com.tezprojesi.api.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/exams")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminExamController {

    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamResponse> createExam() {
        // TODO: implement with proper request body
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamResponse> publishExam(@PathVariable UUID id) {
        // TODO: implement
        return ResponseEntity.ok().build();
    }
}
