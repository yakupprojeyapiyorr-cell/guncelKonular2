package com.tezprojesi.api.controller;

import com.tezprojesi.api.domain.UserProfile;
import com.tezprojesi.api.repository.UserProfileRepository;
import com.tezprojesi.api.repository.UserRepository;
import com.tezprojesi.api.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ProfileController {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;

    @GetMapping
    public ResponseEntity<UserProfile> getProfile(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(userProfileRepository.findByUserId(userId).orElse(null));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<UserProfile> completeOnboarding(
            @RequestBody UserProfile profileData,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        var user = userRepository.findById(userId).orElseThrow();
        
        var profile = userProfileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().user(user).build());
        
        profile.setExamType(profileData.getExamType());
        profile.setTargetTytNet(profileData.getTargetTytNet());
        profile.setTargetAytNet(profileData.getTargetAytNet());
        profile.setDailyStudyHours(profileData.getDailyStudyHours());
        profile.setOnboardingCompleted(true);
        
        return ResponseEntity.ok(userProfileRepository.save(profile));
    }

    @GetMapping("/gamification")
    public ResponseEntity<java.util.Map<String, Object>> getGamification(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        var streak = gamificationService.getStreak(userId);
        var badges = gamificationService.getUserBadges(userId);
        
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("streak", streak);
        data.put("badges", badges);
        
        return ResponseEntity.ok(data);
    }
}
