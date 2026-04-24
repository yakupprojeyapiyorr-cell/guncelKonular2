package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Question;
import com.tezprojesi.api.domain.Question.Difficulty;
import com.tezprojesi.api.domain.QuestionOption;
import com.tezprojesi.api.dto.QuestionCreateRequest;
import com.tezprojesi.api.dto.QuestionResponse;
import com.tezprojesi.api.repository.QuestionRepository;
import com.tezprojesi.api.repository.QuestionOptionRepository;
import com.tezprojesi.api.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final TopicRepository topicRepository;

    public QuestionResponse getQuestion(UUID questionId) {
        var question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        return mapToResponse(question);
    }

    public Page<QuestionResponse> getQuestionsByTopic(UUID topicId, Pageable pageable) {
        return questionRepository.findByTopicId(topicId, pageable)
                .map(this::mapToResponse);
    }

    public Page<QuestionResponse> getQuestionsByTopicAndDifficulty(UUID topicId, Difficulty difficulty, Pageable pageable) {
        return questionRepository.findByTopicIdAndDifficulty(topicId, difficulty, pageable)
                .map(this::mapToResponse);
    }

    public QuestionResponse createQuestion(QuestionCreateRequest request, UUID createdBy) {
        var topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        var question = Question.builder()
                .topic(topic)
                .imageUrl(request.getImageUrl())
                .questionText(request.getQuestionText())
                .difficulty(Difficulty.valueOf(request.getDifficulty()))
                .coefficient(request.getCoefficient())
                .correctOption(request.getCorrectOption())
                .createdBy(null) // Will be set by controller
                .build();

        question = questionRepository.save(question);

        // Add options
        for (var optionReq : request.getOptions()) {
            var option = QuestionOption.builder()
                    .question(question)
                    .optionIndex(optionReq.getIndex())
                    .optionText(optionReq.getText())
                    .whyText(optionReq.getWhyText())
                    .build();
            questionOptionRepository.save(option);
        }

        return getQuestion(question.getId());
    }

    public void deleteQuestion(UUID questionId) {
        questionRepository.deleteById(questionId);
    }

    private QuestionResponse mapToResponse(Question question) {
        var options = question.getOptions().stream()
                .map(opt -> QuestionResponse.OptionResponse.builder()
                        .index(opt.getOptionIndex())
                        .text(opt.getOptionText())
                        .whyText(opt.getWhyText())
                        .build())
                .collect(Collectors.toList());

        return QuestionResponse.builder()
                .id(question.getId())
                .topicId(question.getTopic().getId())
                .imageUrl(question.getImageUrl())
                .questionText(question.getQuestionText())
                .difficulty(question.getDifficulty().toString())
                .coefficient(question.getCoefficient())
                .correctOption(question.getCorrectOption())
                .options(options)
                .build();
    }
}
