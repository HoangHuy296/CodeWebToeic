package com.ivyts.backend.service.mockteststore;

import com.ivyts.backend.domain.mocktest.TestSubmission;
import java.util.List;
import java.util.Optional;

public interface SubmissionStore {

    TestSubmission save(TestSubmission submission);

    Optional<TestSubmission> findById(String submissionId);

    List<TestSubmission> findAllOrderBySubmittedAtDesc();

    List<TestSubmission> findByStudentOrderBySubmittedAtDesc(String studentId);

    List<TestSubmission> findByMockTestIdsOrderBySubmittedAtDesc(List<String> mockTestIds);

    void deleteByMockTest(String mockTestId);
}
