package com.ivyts.backend.notification;

import java.util.Map;

public record AppNotification(
    String id,
    String title,
    String message,
    String severity,
    String entityType,
    String channel,
    String createdAt,
    String actorRole,
    String actorUserId,
    Map<String, Object> metadata
) {
}
