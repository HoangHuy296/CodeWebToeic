package com.ivyts.backend.domain.mocktest;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByMockTestOrderByOrderAsc(String mockTest);
    long countByMockTest(String mockTest);
    boolean existsByMockTestAndOrder(String mockTest, int order);
    void deleteByMockTest(String mockTest);
}
