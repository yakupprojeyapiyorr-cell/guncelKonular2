package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAttachmentResponse {
    private UUID id;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSizeBytes;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
}
