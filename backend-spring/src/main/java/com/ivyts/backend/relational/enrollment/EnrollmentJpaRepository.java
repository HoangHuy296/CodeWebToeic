package com.ivyts.backend.relational.enrollment;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentJpaRepository extends JpaRepository<EnrollmentEntity, String> {

    Optional<EnrollmentEntity> findByCourseIdAndStudentId(String courseId, String studentId);

    List<EnrollmentEntity> findByStudentIdAndStatusInOrderByCreatedAtDesc(String studentId, List<String> statuses);

    List<EnrollmentEntity> findByCourseIdOrderByCreatedAtDesc(String courseId);
}
