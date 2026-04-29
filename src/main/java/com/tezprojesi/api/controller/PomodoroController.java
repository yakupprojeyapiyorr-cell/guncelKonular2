package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.PomodoroSessionResponse;
import com.tezprojesi.api.service.PomodoroService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/pomodoro")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PomodoroController {

    private final PomodoroService pomodoroService;

    @PostMapping("/sessions/start")
    public ResponseEntity<PomodoroSessionResponse> startSession(
            @RequestParam(required = false) UUID topicId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(pomodoroService.startSession(userId, topicId));
    }

    @PostMapping("/sessions/{id}/end")
    public ResponseEntity<PomodoroSessionResponse> endSession(
            @PathVariable UUID id,
            @RequestParam(required = false) Integer durationMinutes) {
        return ResponseEntity.ok(pomodoroService.endSession(id, durationMinutes));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<PomodoroSessionResponse>> getSessions(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(pomodoroService.getSessionsByDate(userId, date));
    }

    @GetMapping("/stats/today")
    public ResponseEntity<Map<String, Object>> getTodayStats(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        Integer totalMinutes = pomodoroService.getTotalMinutesForToday(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMinutesToday", totalMinutes);
        stats.put("totalHours", totalMinutes / 60.0);
        stats.put("sessionsToday", pomodoroService.getSessionsByDate(userId, LocalDate.now()).size());
        
        return ResponseEntity.ok(stats);
    }
}
