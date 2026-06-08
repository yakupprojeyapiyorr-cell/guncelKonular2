package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Difficulty;
import com.tezprojesi.api.domain.Goal;
import com.tezprojesi.api.domain.Priority;
import com.tezprojesi.api.domain.RecurrenceInterval;
import com.tezprojesi.api.domain.Task;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.TaskRequest;
import com.tezprojesi.api.dto.TaskResponse;
import com.tezprojesi.api.repository.TaskRepository;
import com.tezprojesi.api.repository.TaskAttachmentRepository;
import com.tezprojesi.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAttachmentRepository taskAttachmentRepository;
    private final UserRepository userRepository;
    private final GoalService goalService;
    private final FileUploadService fileUploadService;

    private static final Comparator<Task> TASK_PRIORITY_COMPARATOR = Comparator
            .comparing((Task t) -> priorityOrder(t.getPriority()))
            .thenComparing(t -> difficultyOrder(t.getDifficulty()))
            .thenComparing(Task::getCreatedAt, Comparator.reverseOrder());

    @Transactional
    public TaskResponse createTask(UUID userId, TaskRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Free tier restriction
        if (user.getSubscriptionType() == User.SubscriptionType.FREE) {
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            long tasksToday = taskRepository.countByUserAndCreatedAtAfter(user, startOfDay);
            if (tasksToday >= 5) {
                throw new RuntimeException("Ücretsiz planda günde en fazla 5 görev ekleyebilirsiniz. Lütfen Premium'a geçin.");
            }
        }

        Task task = Task.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .folderName(request.getFolderName())
                .parentTaskId(request.getParentTaskId())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : Difficulty.MEDIUM)
                .recurrence(request.getRecurrence() != null ? request.getRecurrence() : RecurrenceInterval.NONE)
                .category(request.getCategory() != null ? request.getCategory() : com.tezprojesi.api.domain.Category.OTHER)
                .completed(false)
                .build();

        Task savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getUserTasks(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        return taskRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .sorted(TASK_PRIORITY_COMPARATOR)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskResponse toggleTaskCompletion(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Görev bulunamadı"));

        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bu görevi düzenleme yetkiniz yok");
        }

        boolean shouldComplete = !task.isCompleted();
        boolean wasCompleted = task.isCompleted();
        task.setCompleted(shouldComplete);

        int newlyCompletedTaskCount = wasCompleted || !shouldComplete ? 0 : 1;
        if (shouldComplete && task.getParentTaskId() == null) {
            newlyCompletedTaskCount += completeOpenSubTasks(task, userId);
        }

        Task updatedTask = taskRepository.save(task);

        if (newlyCompletedTaskCount > 0) {
            goalService.updateProgress(userId, Goal.TargetType.QUESTION_COUNT, newlyCompletedTaskCount);

            // Recurring task logic: clone if recurring
            if (updatedTask.getRecurrence() != null && updatedTask.getRecurrence() != RecurrenceInterval.NONE) {
                Task clonedTask = Task.builder()
                        .user(updatedTask.getUser())
                        .title(updatedTask.getTitle())
                        .description(updatedTask.getDescription())
                        .folderName(updatedTask.getFolderName())
                        .parentTaskId(updatedTask.getParentTaskId())
                        .priority(updatedTask.getPriority())
                        .difficulty(updatedTask.getDifficulty())
                        .recurrence(updatedTask.getRecurrence()) // Keep recurrence on the clone
                        .category(updatedTask.getCategory())
                        .completed(false)
                        .build();
                
                taskRepository.save(clonedTask);
                
                // Remove recurrence from the current completed task so it becomes just a historical record
                updatedTask.setRecurrence(RecurrenceInterval.NONE);
                updatedTask = taskRepository.save(updatedTask);
            }
        }

        return mapToResponse(updatedTask);
    }

    private int completeOpenSubTasks(Task parentTask, UUID userId) {
        List<Task> subTasks = taskRepository.findByUserIdAndParentTaskId(userId, parentTask.getId());
        int completedCount = 0;

        for (Task subTask : subTasks) {
            if (!subTask.isCompleted()) {
                subTask.setCompleted(true);
                completedCount++;
            }
        }

        if (!subTasks.isEmpty()) {
            taskRepository.saveAll(subTasks);
        }

        return completedCount;
    }

    @Transactional
    public void deleteTask(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Görev bulunamadı"));

        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bu görevi silme yetkiniz yok");
        }

        deleteAttachmentsForTask(task.getId());

        List<Task> subTasks = taskRepository.findByUserIdAndParentTaskId(userId, task.getId());
        for (Task subTask : subTasks) {
            deleteAttachmentsForTask(subTask.getId());
        }

        taskRepository.deleteAll(subTasks);
        taskRepository.delete(task);
    }

    private void deleteAttachmentsForTask(UUID taskId) {
        taskAttachmentRepository.findByTaskId(taskId).forEach(attachment -> {
            fileUploadService.deleteFile(attachment.getFileUrl());
            taskAttachmentRepository.delete(attachment);
        });
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .completed(task.isCompleted())
                .folderName(task.getFolderName())
                .parentTaskId(task.getParentTaskId())
                .priority(task.getPriority())
                .difficulty(task.getDifficulty())
                .recurrence(task.getRecurrence())
                .category(task.getCategory())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private static int priorityOrder(Priority priority) {
        if (priority == null) return 2;
        return switch (priority) {
            case CRITICAL -> 0;
            case HIGH -> 1;
            case MEDIUM -> 2;
            case LOW -> 3;
        };
    }

    private static int difficultyOrder(Difficulty difficulty) {
        if (difficulty == null) return 1;
        return switch (difficulty) {
            case HARD -> 0;
            case MEDIUM -> 1;
            case EASY -> 2;
        };
    }
}
