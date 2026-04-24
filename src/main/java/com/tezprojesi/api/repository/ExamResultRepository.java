package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.ExamResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, UUID> {
    List<ExamResult> findByExamId(UUID examId);
    Page<ExamResult> findByExamIdOrderByNetScoreDesc(UUID examId, Pageable pageable);
    List<ExamResult> findByUserId(UUID userId);
}
