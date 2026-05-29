package com.ivyts.backend.relational.course;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonJpaRepository extends JpaRepository<LessonEntity, String> {

    List<LessonEntity> findByCourseIdOrderByLessonOrderAsc(String courseId);

    Optional<LessonEntity> findByCourseIdAndSlug(String courseId, String slug);

    boolean existsByCourseIdAndLessonOrder(String courseId, int lessonOrder);

    boolean existsByCourseIdAndLessonOrderAndIdNot(String courseId, int lessonOrder, String id);

    boolean existsByCourseIdAndSlug(String courseId, String slug);

    boolean existsByCourseIdAndSlugAndIdNot(String courseId, String slug, String id);

    void deleteByCourseId(String courseId);
}
