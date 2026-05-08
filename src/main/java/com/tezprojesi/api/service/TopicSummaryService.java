package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.TopicSummary;
import com.tezprojesi.api.dto.TopicSummaryRequest;
import com.tezprojesi.api.dto.TopicSummaryResponse;
import com.tezprojesi.api.repository.TopicRepository;
import com.tezprojesi.api.repository.TopicSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicSummaryService {

    private final TopicSummaryRepository topicSummaryRepository;
    private final TopicRepository topicRepository;

    @Transactional
    public TopicSummaryResponse saveSummary(TopicSummaryRequest request) {
        var topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        var summary = topicSummaryRepository.findByTopicId(request.getTopicId())
                .orElse(new TopicSummary());

        summary.setTopic(topic);
        summary.setContentMarkdown(request.getContentMarkdown());
        summary.setSourcePdfUrl(request.getSourcePdfUrl());

        summary = topicSummaryRepository.save(summary);

        return mapToResponse(summary);
    }

    public TopicSummaryResponse getSummary(UUID topicId) {
        return topicSummaryRepository.findByTopicId(topicId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    private TopicSummaryResponse mapToResponse(TopicSummary summary) {
        return TopicSummaryResponse.builder()
                .id(summary.getId())
                .topicId(summary.getTopic().getId())
                .topicName(summary.getTopic().getName())
                .contentMarkdown(summary.getContentMarkdown())
                .sourcePdfUrl(summary.getSourcePdfUrl())
                .build();
    }
}
