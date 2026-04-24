package com.tezprojesi.api.controller;

import com.tezprojesi.api.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/topics")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TopicController {

    private final TopicService topicService;

    @GetMapping("/{id}/summary")
    public ResponseEntity<String> getTopicSummary(@PathVariable UUID id) {
        return ResponseEntity.ok(topicService.getTopicSummary(id));
    }
}
