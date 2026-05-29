package com.ivyts.backend.relational.mocktest;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MockTestJpaRepository extends JpaRepository<MockTestEntity, String> {

    List<MockTestEntity> findByCreatedById(String createdById);
}
