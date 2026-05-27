package com.ivyts.backend.domain.enrollment;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EnrollmentRepository extends MongoRepository<Enrollment, String> {
    Optional<Enrollment> findByCourseAndStudent(String course, String student);
    List<Enrollment> findByStudentOrderByCreatedAtDesc(String student);
    List<Enrollment> findByStudentAndStatusInOrderByCreatedAtDesc(String student, List<EnrollmentStatus> statuses);
    List<Enrollment> findByCourseOrderByCreatedAtDesc(String course);
}
