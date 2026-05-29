package com.ivyts.backend.relational.course;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseJpaRepository extends JpaRepository<CourseEntity, String> {

    Optional<CourseEntity> findBySlug(String slug);

    List<CourseEntity> findByIsPublishedTrue();

    List<CourseEntity> findByOwnerId(String ownerId);
}
