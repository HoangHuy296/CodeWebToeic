package com.ivyts.backend.service.orderstore;

import com.ivyts.backend.domain.order.Order;
import com.ivyts.backend.domain.order.OrderStatus;
import com.ivyts.backend.relational.order.OrderEntity;
import com.ivyts.backend.relational.order.OrderJpaRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class MySqlOrderStore implements OrderStore {

    private final OrderJpaRepository orderJpaRepository;

    public MySqlOrderStore(OrderJpaRepository orderJpaRepository) {
        this.orderJpaRepository = orderJpaRepository;
    }

    @Override
    public List<Order> findAll() {
        return orderJpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        return orderJpaRepository.findByStatus(status.name().toLowerCase(Locale.ROOT)).stream().map(this::toDomain).toList();
    }

    private Order toDomain(OrderEntity entity) {
        Order order = new Order();
        order.setId(entity.getId());
        order.setStudent(entity.getStudentId());
        order.setCourse(entity.getCourseId());
        order.setAmount(entity.getAmount().doubleValue());
        order.setCurrency(entity.getCurrency());
        order.setStatus(OrderStatus.valueOf(entity.getStatus().toUpperCase(Locale.ROOT).replace('-', '_')));
        order.setPaymentMethod(entity.getPaymentMethod());
        order.setTransactionId(entity.getTransactionRef());
        order.setPaidAt(entity.getPaidAt());
        order.setCreatedAt(entity.getCreatedAt());
        order.setUpdatedAt(entity.getUpdatedAt());
        return order;
    }
}
