package com.ivyts.backend.relational.mocktest;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestSubmissionAnswerJpaRepository extends JpaRepository<TestSubmissionAnswerEntity, Long> {

    List<TestSubmissionAnswerEntity> findBySubmissionIdOrderByIdAsc(String submissionId);

    void deleteBySubmissionIdIn(List<String> submissionIds);
}
