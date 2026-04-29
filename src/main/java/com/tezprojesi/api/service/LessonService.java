package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Lesson;
import com.tezprojesi.api.dto.LessonResponse;
import com.tezprojesi.api.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;

    public List<LessonResponse> getAllLessons() {
        return lessonRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LessonResponse getLesson(UUID id) {
        var lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        return mapToResponse(lesson);
    }

    public LessonResponse createLesson(com.tezprojesi.api.dto.LessonRequest request) {
        Lesson lesson = Lesson.builder()
                .name(request.getName())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex())
                .build();
        return mapToResponse(lessonRepository.save(lesson));
    }

    public LessonResponse updateLesson(UUID id, com.tezprojesi.api.dto.LessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        lesson.setName(request.getName());
        lesson.setDescription(request.getDescription());
        lesson.setOrderIndex(request.getOrderIndex());
        return mapToResponse(lessonRepository.save(lesson));
    }

    public void deleteLesson(UUID id) {
        lessonRepository.deleteById(id);
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .name(lesson.getName())
                .description(lesson.getDescription())
                .orderIndex(lesson.getOrderIndex())
                .build();
    }
}
