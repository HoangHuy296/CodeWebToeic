package com.ivyts.backend.notification;

import java.util.List;
import java.util.Map;

public record NotificationDispatchInput(
    String title,
    String message,
    NotificationSeverity severity,
    String entityType,
    String actorRole,
    String actorUserId,
    Map<String, Object> metadata,
    List<String> roles,
    List<String> userIds,
    List<String> excludeUserIds,
    String channel
) {
}
