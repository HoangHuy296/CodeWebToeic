package com.ivyts.backend.service.coursestore;

import com.ivyts.backend.domain.course.Course;
import java.util.List;
import java.util.Optional;

public interface CourseStore {

    Optional<Course> findById(String id);

    Optional<Course> findBySlug(String slug);

    List<Course> findAll();

    List<Course> findAllByIds(List<String> ids);

    List<Course> findPublished();

    List<Course> findByOwner(String ownerId);

    Course save(Course course);

    void delete(Course course);
}
