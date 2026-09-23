package com.ivyts.backend.relational.wordcheck;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordScoreJpaRepository extends JpaRepository<WordScoreEntity, String> {

    List<WordScoreEntity> findByModeOrderByFinishedAtDesc(String mode);
}
