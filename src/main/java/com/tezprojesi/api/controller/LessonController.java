package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.LessonResponse;
import com.tezprojesi.api.dto.TopicResponse;
import com.tezprojesi.api.service.LessonService;
import com.tezprojesi.api.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/lessons")
@RequiredArgsConstructor
@CrossOrigin("*")
public class LessonController {

    private final LessonService lessonService;
    private final TopicService topicService;

    @GetMapping
    public ResponseEntity<List<LessonResponse>> getAllLessons() {
        return ResponseEntity.ok(lessonService.getAllLessons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> getLesson(@PathVariable UUID id) {
        return ResponseEntity.ok(lessonService.getLesson(id));
    }

    @GetMapping("/{id}/topics")
    public ResponseEntity<List<TopicResponse>> getTopics(@PathVariable UUID id) {
        return ResponseEntity.ok(topicService.getTopicsByLesson(id));
    }
}
