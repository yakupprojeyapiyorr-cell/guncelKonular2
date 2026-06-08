package com.tezprojesi.api.controller;

import com.tezprojesi.api.service.AiStudyPlanService;
import com.tezprojesi.api.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiStudyPlanService aiStudyPlanService;
    private final AiService aiService;

    @PostMapping("/study-plan/generate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> generateStudyPlan(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(aiStudyPlanService.generateWeeklyPlan(userId));
    }

    @GetMapping("/suggestions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getProductivitySuggestions(
            @RequestParam(defaultValue = "120") int focusMinutes,
            @RequestParam(defaultValue = "3") int completedTasks,
            @RequestParam(defaultValue = "2") int pendingTasks) {
        
        String suggestion = aiService.getProductivitySuggestion(focusMinutes, completedTasks, pendingTasks);
        return ResponseEntity.ok(Map.of("suggestion", suggestion));
    }

    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> chatWithAi(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        String aiResponse = aiService.askAi(prompt);
        // The frontend expects JSON with 'reply' or we can just send 'reply' as requested in the frontend's modified code.
        // Wait, the tutorial frontend uses: data.candidates?.[0]?.content?.parts?.[0]?.text
        // BUT my AiService callGeminiWithFallback ALREADY parses and returns ONLY the text string!
        // So I should return it in a JSON wrapper that the frontend expects.
        // Let's return {"reply": aiResponse} to be clean.
        return ResponseEntity.ok(Map.of("reply", aiResponse));
    }
}
