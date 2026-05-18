package com.ivyts.backend.domain.mocktest;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MockTestRepository extends MongoRepository<MockTest, String> {
    List<MockTest> findByStatus(MockTestStatus status);
    List<MockTest> findByCreatedBy(String createdBy);
}
