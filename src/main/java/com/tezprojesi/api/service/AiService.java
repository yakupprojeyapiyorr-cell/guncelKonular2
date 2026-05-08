package com.tezprojesi.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${openai.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateResponse(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "{\"error\": \"OpenAI API Key is not configured. Please set OPENAI_API_KEY in your environment.\"}";
        }

        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> request = Map.of(
                "model", "gpt-4-turbo-preview",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "response_format", Map.of("type", "json_object")
        );

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                    url,
                    entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object choicesObject = response.getBody().get("choices");
                if (choicesObject instanceof List<?> choices && !choices.isEmpty()) {
                    Object firstChoice = choices.get(0);
                    if (firstChoice instanceof Map<?, ?> choiceMap) {
                        Object message = choiceMap.get("message");
                        if (message instanceof Map<?, ?> messageMap) {
                            Object content = messageMap.get("content");
                            if (content instanceof String contentText) {
                                return contentText;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            return "{\"error\": \"AI generation failed: " + e.getMessage() + "\"}";
        }

        return "{\"error\": \"Unexpected response from AI provider\"}";
    }
}
