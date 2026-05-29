package com.ivyts.backend.relational.order;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderJpaRepository extends JpaRepository<OrderEntity, String> {

    List<OrderEntity> findByStatus(String status);
}
