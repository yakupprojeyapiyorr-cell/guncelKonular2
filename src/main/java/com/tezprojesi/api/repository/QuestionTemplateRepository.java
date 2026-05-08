package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.QuestionTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuestionTemplateRepository extends JpaRepository<QuestionTemplate, UUID> {
}
