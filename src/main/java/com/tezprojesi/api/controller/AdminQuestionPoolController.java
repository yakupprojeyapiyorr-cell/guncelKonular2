package com.tezprojesi.api.controller;

import com.tezprojesi.api.service.QuestionPoolManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/pool")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionPoolController {

    private final QuestionPoolManagementService poolService;

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        poolService.deleteQuestion(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/categorize")
    public ResponseEntity<Void> categorize(@RequestBody Map<String, Object> request) {
        List<String> idsStr = extractStringList(request.get("questionIds"));
        List<UUID> ids = idsStr.stream().map(UUID::fromString).collect(java.util.stream.Collectors.toList());
        List<String> tags = extractStringList(request.get("tags"));
        poolService.bulkCategorize(ids, (String) request.get("category"), tags);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(poolService.getPoolAnalytics());
    }

    private List<String> extractStringList(Object value) {
        if (!(value instanceof List<?> rawList)) {
            return List.of();
        }

        return rawList.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .toList();
    }
}
