package com.tezprojesi.api.controller;

import com.tezprojesi.api.domain.UserBadge;
import com.tezprojesi.api.domain.UserStreak;
import com.tezprojesi.api.dto.BadgeResponse;
import com.tezprojesi.api.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    @GetMapping("/streak")
    public ResponseEntity<UserStreak> getStreak(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(gamificationService.getStreak(userId));
    }

    @GetMapping("/badges")
    public ResponseEntity<List<UserBadge>> getBadges(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(gamificationService.getUserBadges(userId));
    }

    @GetMapping("/badges/all")
    public ResponseEntity<List<BadgeResponse>> getAllBadgesWithProgress(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(gamificationService.getAllBadgesWithProgress(userId));
    }
}
