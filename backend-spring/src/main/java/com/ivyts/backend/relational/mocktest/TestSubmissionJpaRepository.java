package com.ivyts.backend.relational.mocktest;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestSubmissionJpaRepository extends JpaRepository<TestSubmissionEntity, String> {

    List<TestSubmissionEntity> findByMockTestId(String mockTestId);

    List<TestSubmissionEntity> findAllByOrderBySubmittedAtDescCreatedAtDesc();

    List<TestSubmissionEntity> findByStudentIdOrderBySubmittedAtDescCreatedAtDesc(String studentId);

    List<TestSubmissionEntity> findByMockTestIdInOrderBySubmittedAtDescCreatedAtDesc(Collection<String> mockTestIds);

    void deleteByMockTestId(String mockTestId);
}
