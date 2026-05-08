package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.UserScoreResponse;
import com.tezprojesi.api.service.ScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/scores")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ScoreController {

    private final ScoringService scoringService;

    @GetMapping("/me")
    public ResponseEntity<UserScoreResponse> getMyScore(
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        UserScoreResponse score = scoringService.getUserScore(userId);
        return ResponseEntity.ok(score);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<Page<UserScoreResponse>> getLeaderboard(Pageable pageable) {
        Page<UserScoreResponse> leaderboard = scoringService.getLeaderboard(pageable);
        return ResponseEntity.ok(leaderboard);
    }
}
