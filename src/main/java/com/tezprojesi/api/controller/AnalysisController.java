package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.WeakPointAnalysisResponse;
import com.tezprojesi.api.service.SimplifiedWeakPointAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AnalysisController {

    private final SimplifiedWeakPointAnalysisService analysisService;

    @PostMapping("/weak-points")
    public ResponseEntity<WeakPointAnalysisResponse> analyzeWeakPoints(
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        WeakPointAnalysisResponse response = analysisService.analyzeWeakPoints(userId);
        return ResponseEntity.ok(response);
    }
}
