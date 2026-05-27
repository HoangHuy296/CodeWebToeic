package com.ivyts.backend.domain.mocktest;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface TestSubmissionRepository extends MongoRepository<TestSubmission, String> {
    void deleteByMockTest(String mockTest);
}
