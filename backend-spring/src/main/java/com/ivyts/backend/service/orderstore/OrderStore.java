package com.ivyts.backend.service.orderstore;

import com.ivyts.backend.domain.order.Order;
import com.ivyts.backend.domain.order.OrderStatus;
import java.util.List;

public interface OrderStore {

    List<Order> findAll();

    List<Order> findByStatus(OrderStatus status);
}
