package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionExplainRequest {
    private UUID questionId;
    // Öğrencinin seçtiği yanlış şık (0=A, 1=B, 2=C, 3=D, 4=E)
    private Integer selectedOption;
    // Öğrencinin sormak istediği ek soru (opsiyonel)
    private String followUpQuestion;
    // Öğrencinin dışarıdan attığı soru fotoğrafı URL'si (opsiyonel)
    // Sistemde olmayan sorular için - GPT-4 Vision okur ve açıklar
    private String studentImageUrl;
}
