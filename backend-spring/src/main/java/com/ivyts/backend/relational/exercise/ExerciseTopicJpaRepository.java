package com.ivyts.backend.relational.exercise;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseTopicJpaRepository extends JpaRepository<ExerciseTopicEntity, String> {

    Optional<ExerciseTopicEntity> findBySlug(String slug);
}
