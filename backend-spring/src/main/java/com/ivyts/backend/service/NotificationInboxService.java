package com.ivyts.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.notification.AppNotification;
import com.ivyts.backend.notification.NotificationDispatchInput;
import com.ivyts.backend.relational.notification.NotificationEntity;
import com.ivyts.backend.relational.notification.NotificationJpaRepository;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.service.userstore.UserStore;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class NotificationInboxService {

    private final NotificationJpaRepository notificationJpaRepository;
    private final UserStore userStore;
    private final ObjectMapper objectMapper;

    public NotificationInboxService(
        NotificationJpaRepository notificationJpaRepository,
        UserStore userStore,
        ObjectMapper objectMapper
    ) {
        this.notificationJpaRepository = notificationJpaRepository;
        this.userStore = userStore;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Map<String, AppNotification> persistForDispatch(NotificationDispatchInput input, AppNotification notification) {
        Set<String> targetUserIds = resolveTargetUserIds(input);
        if (targetUserIds.isEmpty()) {
            return Map.of();
        }

        Map<String, AppNotification> notificationsByUserId = new LinkedHashMap<>();
        for (String userId : targetUserIds) {
            String notificationId = UUID.randomUUID().toString().replace("-", "");
            NotificationEntity entity = new NotificationEntity();
            entity.setId(notificationId);
            entity.setRecipientUserId(userId);
            entity.setTitle(notification.title());
            entity.setMessage(notification.message());
            entity.setSeverity(notification.severity());
            entity.setEntityType(notification.entityType());
            entity.setChannel(notification.channel());
            entity.setActorRole(notification.actorRole());
            entity.setActorUserId(notification.actorUserId());
            entity.setMetadataJson(writeMetadata(notification.metadata()));
            entity.setRead(false);
            entity.setCreatedAt(Instant.parse(notification.createdAt()));
            notificationJpaRepository.save(entity);

            notificationsByUserId.put(userId, new AppNotification(
                notificationId,
                notification.title(),
                notification.message(),
                notification.severity(),
                notification.entityType(),
                notification.channel(),
                notification.createdAt(),
                notification.actorRole(),
                notification.actorUserId(),
                notification.metadata()
            ));
        }

        return notificationsByUserId;
    }

    public Map<String, Object> listNotifications(AuthUser authUser) {
        List<Map<String, Object>> notifications = notificationJpaRepository
            .findTop30ByRecipientUserIdOrderByCreatedAtDesc(authUser.userId())
            .stream()
            .map(this::toView)
            .toList();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", notifications);
        data.put("unreadCount", notificationJpaRepository.countByRecipientUserIdAndIsReadFalse(authUser.userId()));
        return data;
    }

    @Transactional
    public Map<String, Object> markAsRead(String notificationId, AuthUser authUser) {
        NotificationEntity entity = notificationJpaRepository
            .findByIdAndRecipientUserId(notificationId, authUser.userId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!entity.isRead()) {
            entity.setRead(true);
            entity.setReadAt(Instant.now());
            notificationJpaRepository.save(entity);
        }

        return toView(entity);
    }

    @Transactional
    public Map<String, Object> markAllAsRead(AuthUser authUser) {
        int updated = notificationJpaRepository.markAllAsRead(authUser.userId(), Instant.now());
        return Map.of("updatedCount", updated);
    }

    @Transactional
    public Map<String, Object> clearNotifications(AuthUser authUser) {
        notificationJpaRepository.deleteByRecipientUserId(authUser.userId());
        return Map.of("cleared", true);
    }

    private Set<String> resolveTargetUserIds(NotificationDispatchInput input) {
        Set<String> targetUserIds = new LinkedHashSet<>();
        if (input.userIds() != null) {
            targetUserIds.addAll(input.userIds());
        }

        if (input.roles() != null && !input.roles().isEmpty()) {
            Set<String> roles = input.roles().stream().map(String::toLowerCase).collect(java.util.stream.Collectors.toSet());
            userStore.findAll().stream()
                .filter(user -> roles.contains(user.getRole().name().toLowerCase()))
                .map(com.ivyts.backend.domain.user.User::getId)
                .forEach(targetUserIds::add);
        }

        if (input.excludeUserIds() != null && !input.excludeUserIds().isEmpty()) {
            targetUserIds.removeAll(input.excludeUserIds());
        }

        return targetUserIds;
    }

    private Map<String, Object> toView(NotificationEntity entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", entity.getId());
        data.put("title", entity.getTitle());
        data.put("message", entity.getMessage());
        data.put("severity", entity.getSeverity());
        data.put("entityType", entity.getEntityType());
        data.put("channel", entity.getChannel());
        data.put("createdAt", entity.getCreatedAt() == null ? null : entity.getCreatedAt().toString());
        data.put("actorRole", entity.getActorRole());
        data.put("actorUserId", entity.getActorUserId());
        data.put("metadata", readMetadata(entity.getMetadataJson()));
        data.put("isRead", entity.isRead());
        data.put("readAt", entity.getReadAt() == null ? null : entity.getReadAt().toString());
        return data;
    }

    private String writeMetadata(Map<String, Object> metadata) {
        try {
            return metadata == null ? null : objectMapper.writeValueAsString(metadata);
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to serialize notification metadata");
        }
    }

    private Map<String, Object> readMetadata(String value) {
        try {
            if (value == null || value.isBlank()) {
                return Map.of();
            }
            return objectMapper.readValue(value, new TypeReference<Map<String, Object>>() {});
        } catch (Exception exception) {
            return Map.of();
        }
    }
}
