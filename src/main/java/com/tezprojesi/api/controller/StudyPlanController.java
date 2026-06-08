package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.StudyPlanRequest;
import com.tezprojesi.api.dto.StudyPlanResponse;
import com.tezprojesi.api.service.StudyPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    @GetMapping
    public ResponseEntity<List<StudyPlanResponse>> getPlans(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(studyPlanService.getPlansByDate(userId, date));
    }

    @PostMapping
    public ResponseEntity<StudyPlanResponse> createPlan(
            @RequestBody StudyPlanRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(studyPlanService.createPlan(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyPlanResponse> updatePlan(
            @PathVariable UUID id,
            @RequestBody StudyPlanRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(studyPlanService.updatePlan(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        studyPlanService.deletePlan(id, userId);
        return ResponseEntity.noContent().build();
    }
}
