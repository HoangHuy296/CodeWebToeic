package com.ivyts.backend.domain.course;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CourseRepository extends MongoRepository<Course, String> {
    Optional<Course> findBySlug(String slug);
    List<Course> findByIsPublishedTrue();
    List<Course> findByOwner(String owner);
}
