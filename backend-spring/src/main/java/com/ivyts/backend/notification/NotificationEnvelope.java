package com.ivyts.backend.notification;

public record NotificationEnvelope(
    String type,
    Object payload
) {
}
