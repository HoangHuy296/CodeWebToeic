package com.ivyts.backend.relational.enrollment;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentLessonProgressJpaRepository extends JpaRepository<EnrollmentLessonProgressEntity, Long> {

    List<EnrollmentLessonProgressEntity> findByEnrollmentIdOrderByIdAsc(String enrollmentId);

    void deleteByEnrollmentId(String enrollmentId);
}
