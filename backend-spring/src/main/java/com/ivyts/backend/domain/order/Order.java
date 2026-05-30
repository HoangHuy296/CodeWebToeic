package com.ivyts.backend.domain.order;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Locale;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Order {

    private String id;
    private String student;
    private String course;
    private double amount;
    private String currency;
    private String status = "pending";
    private String paymentMethod;
    private String paymentProvider;
    private String transactionId;
    private Instant paidAt;
    private Instant createdAt;
    private Instant updatedAt;

    public OrderStatus getStatus() { return OrderStatus.valueOf(normalizeEnum(status, "pending")); }
    public void setStatus(OrderStatus status) { this.status = status.name().toLowerCase(Locale.ROOT); }

    private String normalizeEnum(String value, String fallback) {
        return (value == null ? fallback : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
