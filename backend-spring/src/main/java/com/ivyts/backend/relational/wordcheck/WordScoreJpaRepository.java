package com.ivyts.backend.relational.wordcheck;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WordScoreJpaRepository extends JpaRepository<WordScoreEntity, String> {
}
