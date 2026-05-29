package com.ivyts.backend.service.mockteststore;

import com.ivyts.backend.domain.mocktest.Question;
import java.util.List;

public interface QuestionStore {

    List<Question> findByMockTestOrderByOrderAsc(String mockTestId);

    List<Question> saveAll(List<Question> questions);

    void deleteByMockTest(String mockTestId);
}
