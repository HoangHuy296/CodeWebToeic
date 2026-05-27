package com.ivyts.backend.domain.lesson;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LessonRepository extends MongoRepository<Lesson, String> {
    List<Lesson> findByCourseOrderByOrderAsc(String course);
    Optional<Lesson> findByCourseAndSlug(String course, String slug);
    boolean existsByCourseAndOrder(String course, int order);
    boolean existsByCourseAndOrderAndIdNot(String course, int order, String id);
    boolean existsByCourseAndSlug(String course, String slug);
    boolean existsByCourseAndSlugAndIdNot(String course, String slug, String id);
    long countByCourse(String course);
    void deleteByCourse(String course);
}
