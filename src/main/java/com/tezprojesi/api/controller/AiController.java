package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.QuestionCreateRequest;
import com.tezprojesi.api.dto.QuestionExplainRequest;
import com.tezprojesi.api.dto.QuestionExplainResponse;
import com.tezprojesi.api.service.AiQuestionService;
import com.tezprojesi.api.service.AiStudyPlanService;
import com.tezprojesi.api.service.QuestionExplainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AiController {

    private final AiQuestionService aiQuestionService;
    private final AiStudyPlanService aiStudyPlanService;
    private final QuestionExplainService questionExplainService;

    @PostMapping("/questions/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<QuestionCreateRequest>> generateQuestions(
            @RequestParam UUID topicId,
            @RequestParam(defaultValue = "MEDIUM") String difficulty,
            @RequestParam(defaultValue = "5") int count) {
        return ResponseEntity.ok(aiQuestionService.generateQuestions(topicId, difficulty, count));
    }

    @PostMapping("/study-plan/generate")
    public ResponseEntity<Map<String, Object>> generateStudyPlan(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(aiStudyPlanService.generateWeeklyPlan(userId));
    }

    /**
     * Soru açıklama endpoint'i.
     * - questionId varsa: sistemdeki soruyu açıkla (özet + çözüm görseli kullanılır)
     * - studentImageUrl varsa: öğrencinin attığı fotoğrafı GPT-4 Vision ile oku
     * - İkisi de olabilir veya sadece biri
     */
    @PostMapping("/explain")
    public ResponseEntity<QuestionExplainResponse> explainQuestion(
            @RequestBody QuestionExplainRequest request) {
        return ResponseEntity.ok(questionExplainService.explain(request));
    }
}
