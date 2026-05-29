package com.ivyts.backend.service.mockteststore;

import com.ivyts.backend.domain.mocktest.MockTest;
import java.util.List;
import java.util.Optional;

public interface MockTestStore {

    Optional<MockTest> findById(String id);

    List<MockTest> findAll();

    MockTest save(MockTest mockTest);

    void delete(MockTest mockTest);
}
