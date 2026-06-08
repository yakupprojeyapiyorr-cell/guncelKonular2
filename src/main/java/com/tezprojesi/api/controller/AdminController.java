package com.tezprojesi.api.controller;

import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.AdminStatsResponse;
import com.tezprojesi.api.repository.PomodoroSessionRepository;
import com.tezprojesi.api.repository.TaskRepository;
import com.tezprojesi.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getSystemStats() {
        long totalUsers = userRepository.count();
        long premiumUsers = userRepository.countBySubscriptionType(User.SubscriptionType.PREMIUM);
        long totalTasks = taskRepository.count();
        Long totalMinutesObj = pomodoroSessionRepository.sumAllDurations();
        long totalMinutes = totalMinutesObj != null ? totalMinutesObj : 0L;

        AdminStatsResponse response = AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .premiumUsers(premiumUsers)
                .totalTasks(totalTasks)
                .totalPomodoroMinutes(totalMinutes)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<java.util.List<com.tezprojesi.api.dto.UserDTO>> getAllUsers() {
        var users = userRepository.findAll().stream().map(user -> 
            com.tezprojesi.api.dto.UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .surname(user.getSurname())
                .email(user.getEmail())
                .role(user.getRole())
                .subscriptionType(user.getSubscriptionType())
                .createdAt(user.getCreatedAt())
                .build()
        ).toList();
        
        return ResponseEntity.ok(users);
    }

    @org.springframework.web.bind.annotation.PostMapping("/users/{userId}/premium")
    public ResponseEntity<String> makeUserPremium(@org.springframework.web.bind.annotation.PathVariable java.util.UUID userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        user.setSubscriptionType(User.SubscriptionType.PREMIUM);
        userRepository.save(user);
        return ResponseEntity.ok("Kullanıcı başarıyla PREMIUM yapıldı.");
    }

    @org.springframework.web.bind.annotation.PostMapping("/users/{userId}/free")
    public ResponseEntity<String> makeUserFree(@org.springframework.web.bind.annotation.PathVariable java.util.UUID userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        user.setSubscriptionType(User.SubscriptionType.FREE);
        userRepository.save(user);
        return ResponseEntity.ok("Kullanıcı başarıyla FREE yapıldı.");
    }
}
