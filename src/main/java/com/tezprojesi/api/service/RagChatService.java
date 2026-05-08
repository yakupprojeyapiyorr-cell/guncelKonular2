package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.AiChatMessage;
import com.tezprojesi.api.domain.Topic;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.AiChatResponse;
import com.tezprojesi.api.repository.AiChatMessageRepository;
import com.tezprojesi.api.repository.TopicRepository;
import com.tezprojesi.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RagChatService {

    private final AiChatMessageRepository chatMessageRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    public AiChatResponse chat(UUID userId, UUID topicId, String userMessage) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String topicContext = topic.getSummary() != null
                ? topic.getSummary().getContentMarkdown()
                : "Konu adi: " + topic.getName();

        String systemPrompt = """
                Sen FocusFlow egitim platformunun YKS asistanisin. Turkce, acik ve anlasilir sekilde konulari aciklarken:
                1. Asagidaki MEB kaynakli icerigi baz al
                2. Ogrenci sorusuna net ve kisa cevap ver
                3. Formuller icin LaTeX kullan ($$formula$$ seklinde)
                4. Adim adim acikla
                5. Ilgili ornek ver

                KONU OZETI:
                """ + topicContext;

        String aiResponse = aiService.generateResponse(systemPrompt, userMessage);

        AiChatMessage message = AiChatMessage.builder()
                .user(user)
                .topic(topic)
                .userMessage(userMessage)
                .aiResponse(aiResponse)
                .build();
        chatMessageRepository.save(message);

        return AiChatResponse.builder()
                .id(message.getId())
                .reply(aiResponse)
                .source("MEB " + topic.getName() + " ozetinden")
                .createdAt(message.getCreatedAt())
                .build();
    }

    public List<Map<String, Object>> getChatHistory(UUID userId, UUID topicId) {
        List<AiChatMessage> messages = chatMessageRepository.findByUserIdAndTopicIdOrderByCreatedAtDesc(userId, topicId);

        return messages.stream().map(msg -> {
            Map<String, Object> historyItem = new HashMap<>();
            historyItem.put("role", msg.getUserMessage() != null ? "user" : "assistant");
            historyItem.put("content", msg.getUserMessage() != null ? msg.getUserMessage() : msg.getAiResponse());
            historyItem.put("timestamp", msg.getCreatedAt());
            return historyItem;
        }).toList();
    }
}
