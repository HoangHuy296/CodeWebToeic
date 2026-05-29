package com.ivyts.backend.relational.mocktest;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MockTestQuestionOptionJpaRepository extends JpaRepository<MockTestQuestionOptionEntity, Long> {

    List<MockTestQuestionOptionEntity> findByQuestionIdOrderByIdAsc(String questionId);

    List<MockTestQuestionOptionEntity> findByQuestionIdInOrderByIdAsc(List<String> questionIds);

    void deleteByQuestionIdIn(List<String> questionIds);
}
