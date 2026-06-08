package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.TaskRequest;
import com.tezprojesi.api.dto.TaskResponse;
import com.tezprojesi.api.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(taskService.getUserTasks(userId));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(taskService.createTask(userId, request));
    }

    @PatchMapping("/{taskId}/toggle")
    public ResponseEntity<TaskResponse> toggleTaskCompletion(
            @PathVariable UUID taskId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(taskService.toggleTaskCompletion(taskId, userId));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID taskId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        taskService.deleteTask(taskId, userId);
        return ResponseEntity.noContent().build();
    }
}
