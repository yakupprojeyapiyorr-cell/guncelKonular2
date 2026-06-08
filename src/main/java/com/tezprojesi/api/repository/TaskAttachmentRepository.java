package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.TaskAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, UUID> {
    List<TaskAttachment> findByTaskId(UUID taskId);
    Optional<TaskAttachment> findFirstByFileUrl(String fileUrl);
    void deleteByTaskId(UUID taskId);
}
