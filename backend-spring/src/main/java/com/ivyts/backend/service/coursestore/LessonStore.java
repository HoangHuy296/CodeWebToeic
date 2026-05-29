package com.ivyts.backend.service.coursestore;

import com.ivyts.backend.domain.lesson.Lesson;
import java.util.List;
import java.util.Optional;

public interface LessonStore {

    Optional<Lesson> findById(String id);

    List<Lesson> findByCourseOrderByOrderAsc(String courseId);

    boolean existsByCourseAndOrder(String courseId, int order);

    boolean existsByCourseAndOrderAndIdNot(String courseId, int order, String lessonId);

    boolean existsByCourseAndSlug(String courseId, String slug);

    boolean existsByCourseAndSlugAndIdNot(String courseId, String slug, String lessonId);

    Lesson save(Lesson lesson);

    void delete(Lesson lesson);

    void deleteByCourse(String courseId);
}
