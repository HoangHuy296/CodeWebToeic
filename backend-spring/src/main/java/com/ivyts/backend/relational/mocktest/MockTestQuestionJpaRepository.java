package com.ivyts.backend.relational.mocktest;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MockTestQuestionJpaRepository extends JpaRepository<MockTestQuestionEntity, String> {

    List<MockTestQuestionEntity> findByMockTestIdOrderByQuestionOrderAsc(String mockTestId);

    void deleteByMockTestId(String mockTestId);
}
