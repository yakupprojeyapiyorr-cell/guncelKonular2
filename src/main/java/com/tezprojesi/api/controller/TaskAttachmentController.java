package com.tezprojesi.api.controller;

import com.tezprojesi.api.domain.Task;
import com.tezprojesi.api.domain.TaskAttachment;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.TaskAttachmentResponse;
import com.tezprojesi.api.repository.TaskAttachmentRepository;
import com.tezprojesi.api.repository.TaskRepository;
import com.tezprojesi.api.repository.UserRepository;
import com.tezprojesi.api.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskAttachmentController {

    private final TaskAttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    @PostMapping("/{taskId}/attachments")
    public ResponseEntity<?> uploadAttachment(
            @PathVariable UUID taskId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        String userIdStr = authentication.getName();
        User user = userRepository.findById(UUID.fromString(userIdStr))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Only task owner can upload
        if (!task.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to add attachments to this task");
        }

        String storedFileName = fileUploadService.storeFile(file);
        
        // Use download endpoint for fileUrl
        String fileDownloadUri = "/api/tasks/attachments/download/" + storedFileName;

        TaskAttachment attachment = TaskAttachment.builder()
                .task(task)
                .fileName(file.getOriginalFilename())
                .fileUrl(fileDownloadUri)
                .fileType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .uploadedBy(user.getEmail())
                .build();

        attachment = attachmentRepository.save(attachment);

        TaskAttachmentResponse response = TaskAttachmentResponse.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileUrl(attachment.getFileUrl())
                .fileType(attachment.getFileType())
                .fileSizeBytes(attachment.getFileSizeBytes())
                .uploadedBy(attachment.getUploadedBy())
                .uploadedAt(attachment.getUploadedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{taskId}/attachments")
    public ResponseEntity<?> getAttachments(@PathVariable UUID taskId, Authentication authentication) {
        String userIdStr = authentication.getName();
        User user = userRepository.findById(UUID.fromString(userIdStr))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to view attachments for this task");
        }

        List<TaskAttachment> attachments = attachmentRepository.findByTaskId(taskId);
        
        List<TaskAttachmentResponse> responses = attachments.stream().map(att -> 
            TaskAttachmentResponse.builder()
                .id(att.getId())
                .fileName(att.getFileName())
                .fileUrl(att.getFileUrl())
                .fileType(att.getFileType())
                .fileSizeBytes(att.getFileSizeBytes())
                .uploadedBy(att.getUploadedBy())
                .uploadedAt(att.getUploadedAt())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(@PathVariable UUID attachmentId, Authentication authentication) {
        String userIdStr = authentication.getName();
        User user = userRepository.findById(UUID.fromString(userIdStr))
                .orElseThrow(() -> new RuntimeException("User not found"));

        TaskAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        if (!attachment.getTask().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to delete this attachment");
        }

        fileUploadService.deleteFile(attachment.getFileUrl());
        attachmentRepository.delete(attachment);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/attachments/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, Authentication authentication) {
        try {
            // Verify user is authenticated
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // Load file with path traversal protection
            Path filePath = fileUploadService.loadFileAsResource(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            String fileUrl = "/api/tasks/attachments/download/" + fileName;
            TaskAttachment attachment = attachmentRepository.findFirstByFileUrl(fileUrl).orElse(null);
            
            // Verify user owns the task that contains this attachment
            if (attachment != null) {
                String userIdStr = authentication.getName();
                User user = userRepository.findById(UUID.fromString(userIdStr)).orElse(null);
                if (user == null || !attachment.getTask().getUser().getId().equals(user.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }
            
            String displayName = attachment != null ? attachment.getFileName() : resource.getFilename();
            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

            if (attachment != null && attachment.getFileType() != null && !attachment.getFileType().isBlank()) {
                mediaType = MediaType.parseMediaType(attachment.getFileType());
            }

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + displayName + "\"")
                        .contentType(mediaType)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
