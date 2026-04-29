package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.StatisticsResponse;
import com.tezprojesi.api.dto.WeakTopicResponse;
import com.tezprojesi.api.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/me")
    public ResponseEntity<StatisticsResponse> getMyStats(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(statisticsService.getStats(userId));
    }

    @GetMapping("/me/weak-topics")
    public ResponseEntity<List<WeakTopicResponse>> getWeakTopics(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(statisticsService.getWeakTopics(userId));
    }
}
