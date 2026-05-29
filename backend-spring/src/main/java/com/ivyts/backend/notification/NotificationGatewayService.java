package com.ivyts.backend.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ivyts.backend.service.NotificationInboxService;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Service
public class NotificationGatewayService {

    private static final Logger log = LoggerFactory.getLogger(NotificationGatewayService.class);
    private final ObjectMapper objectMapper;
    private final NotificationInboxService notificationInboxService;
    private final Map<String, ConnectedClient> clients = new ConcurrentHashMap<>();

    public NotificationGatewayService(ObjectMapper objectMapper, NotificationInboxService notificationInboxService) {
        this.objectMapper = objectMapper;
        this.notificationInboxService = notificationInboxService;
    }

    public void register(WebSocketSession session, String userId, String role) throws IOException {
        clients.put(session.getId(), new ConnectedClient(session, userId, role));
        log.info("Notification websocket connected: sessionId={}, userId={}, role={}", session.getId(), userId, role);
        sendEnvelope(session, new NotificationEnvelope(
            "connected",
            Map.of(
                "userId", userId,
                "role", role,
                "connectedAt", Instant.now().toString()
            )
        ));
    }

    public void unregister(WebSocketSession session) {
        log.info("Notification websocket disconnected: sessionId={}", session.getId());
        clients.remove(session.getId());
    }

    public void dispatch(NotificationDispatchInput input) {
        AppNotification notification = new AppNotification(
            UUID.randomUUID().toString(),
            input.title(),
            input.message(),
            input.severity().name().toLowerCase(),
            input.entityType(),
            input.channel() == null ? "system" : input.channel(),
            Instant.now().toString(),
            input.actorRole(),
            input.actorUserId(),
            input.metadata()
        );

        Map<String, AppNotification> notificationsByUserId = notificationInboxService.persistForDispatch(input, notification);
        Set<String> roles = input.roles() == null ? Set.of() : Set.copyOf(input.roles());
        Set<String> userIds = notificationsByUserId.keySet();
        Set<String> excludedUserIds = input.excludeUserIds() == null ? Set.of() : Set.copyOf(input.excludeUserIds());
        log.info(
            "Dispatching notification: title='{}', roles={}, userIds={}, excludedUserIds={}, activeClients={}",
            input.title(),
            roles,
            userIds,
            excludedUserIds,
            clients.size()
        );

        clients.values().forEach(client -> {
            if (excludedUserIds.contains(client.userId())) {
                return;
            }

            boolean matchesRole = !roles.isEmpty() && roles.contains(client.role());
            boolean matchesUser = !userIds.isEmpty() && userIds.contains(client.userId());

            if ((roles.isEmpty() && userIds.isEmpty()) || (!matchesRole && !matchesUser)) {
                return;
            }

            AppNotification persistedNotification = notificationsByUserId.get(client.userId());
            if (persistedNotification == null) {
                return;
            }

            try {
                sendEnvelope(client.session(), new NotificationEnvelope("notification", persistedNotification));
                log.info("Notification delivered: title='{}', sessionId={}, userId={}", input.title(), client.session().getId(), client.userId());
            } catch (IOException exception) {
                log.warn("Notification delivery failed: sessionId={}, userId={}, error={}", client.session().getId(), client.userId(), exception.getMessage());
                unregister(client.session());
                try {
                    client.session().close();
                } catch (IOException ignored) {
                    // no-op
                }
            }
        });
    }

    public void notifyUsers(List<String> targetUserIds, NotificationDispatchInput input) {
        dispatch(new NotificationDispatchInput(
            input.title(),
            input.message(),
            input.severity(),
            input.entityType(),
            input.actorRole(),
            input.actorUserId(),
            input.metadata(),
            input.roles(),
            targetUserIds,
            input.excludeUserIds(),
            input.channel()
        ));
    }

    public void notifyRoles(List<String> targetRoles, NotificationDispatchInput input) {
        dispatch(new NotificationDispatchInput(
            input.title(),
            input.message(),
            input.severity(),
            input.entityType(),
            input.actorRole(),
            input.actorUserId(),
            input.metadata(),
            targetRoles,
            input.userIds(),
            input.excludeUserIds(),
            input.channel()
        ));
    }

    private void sendEnvelope(WebSocketSession session, NotificationEnvelope envelope) throws IOException {
        if (!session.isOpen()) {
            unregister(session);
            return;
        }

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(envelope)));
    }
}
