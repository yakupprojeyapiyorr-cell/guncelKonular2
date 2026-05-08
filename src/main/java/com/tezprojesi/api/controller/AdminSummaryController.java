package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.TopicSummaryRequest;
import com.tezprojesi.api.dto.TopicSummaryResponse;
import com.tezprojesi.api.service.TopicSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/summaries")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminSummaryController {

    private final TopicSummaryService topicSummaryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TopicSummaryResponse> saveSummary(@RequestBody TopicSummaryRequest request) {
        return ResponseEntity.ok(topicSummaryService.saveSummary(request));
    }

    @GetMapping("/{topicId}")
    public ResponseEntity<TopicSummaryResponse> getSummary(@PathVariable UUID topicId) {
        return ResponseEntity.ok(topicSummaryService.getSummary(topicId));
    }
}
