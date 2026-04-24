package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Topic;
import com.tezprojesi.api.dto.TopicResponse;
import com.tezprojesi.api.repository.TopicRepository;
import com.tezprojesi.api.repository.TopicSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final TopicSummaryRepository topicSummaryRepository;

    public List<TopicResponse> getTopicsByLesson(UUID lessonId) {
        return topicRepository.findByLessonId(lessonId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TopicResponse getTopic(UUID id) {
        var topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        return mapToResponse(topic);
    }

    public String getTopicSummary(UUID topicId) {
        var summary = topicSummaryRepository.findByTopicId(topicId)
                .orElseThrow(() -> new RuntimeException("Topic summary not found"));
        return summary.getContentMarkdown();
    }

    private TopicResponse mapToResponse(Topic topic) {
        return TopicResponse.builder()
                .id(topic.getId())
                .lessonId(topic.getLesson().getId())
                .name(topic.getName())
                .orderIndex(topic.getOrderIndex())
                .build();
    }
}
