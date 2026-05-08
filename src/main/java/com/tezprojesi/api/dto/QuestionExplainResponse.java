package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionExplainResponse {
    private String explanation;      // GPT'nin adım adım çözümü
    private String correctAnswerKey; // "A", "B", "C", "D", "E"
    private String topicName;        // Konunun adı
    private String screenshotUrl;    // Video çözüm görseli (varsa)
    private boolean hasScreenshot;
    private boolean hasSummary;
}
