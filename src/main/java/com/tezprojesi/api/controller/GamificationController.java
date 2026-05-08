package com.tezprojesi.api.controller;

import com.tezprojesi.api.domain.UserBadge;
import com.tezprojesi.api.domain.UserStreak;
import com.tezprojesi.api.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/gamification")
@RequiredArgsConstructor
@CrossOrigin("*")
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
}
