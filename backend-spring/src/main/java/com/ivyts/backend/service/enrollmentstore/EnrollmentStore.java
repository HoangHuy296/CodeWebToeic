package com.ivyts.backend.service.enrollmentstore;

import com.ivyts.backend.domain.enrollment.Enrollment;
import com.ivyts.backend.domain.enrollment.EnrollmentStatus;
import java.util.List;
import java.util.Optional;

public interface EnrollmentStore {

    Optional<Enrollment> findById(String id);

    Optional<Enrollment> findByCourseAndStudent(String courseId, String studentId);

    List<Enrollment> findAll();

    List<Enrollment> findByStudentAndStatusInOrderByCreatedAtDesc(String studentId, List<EnrollmentStatus> statuses);

    List<Enrollment> findByCourseOrderByCreatedAtDesc(String courseId);

    Enrollment save(Enrollment enrollment);
}
