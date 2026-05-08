package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.GoalCreateRequest;
import com.tezprojesi.api.dto.GoalResponse;
import com.tezprojesi.api.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
@CrossOrigin("*")
public class GoalController {

    private final GoalService goalService;

    @GetMapping("/active")
    public ResponseEntity<List<GoalResponse>> getActiveGoals(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(goalService.getActiveGoals(userId));
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getAllGoals(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(goalService.getAllGoals(userId));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(
            @RequestBody GoalCreateRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(goalService.createGoal(userId, request));
    }
}
