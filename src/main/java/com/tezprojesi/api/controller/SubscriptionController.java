package com.tezprojesi.api.controller;

import com.tezprojesi.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final AuthService authService;

    @PostMapping("/upgrade-premium")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> upgradePremium(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        authService.upgradePremium(userId);
        return ResponseEntity.ok().build();
    }
}
