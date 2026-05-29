package com.ivyts.backend.notification;

import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.security.JwtService;
import java.io.IOException;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(NotificationWebSocketHandler.class);
    private final JwtService jwtService;
    private final NotificationGatewayService notificationGatewayService;

    public NotificationWebSocketHandler(JwtService jwtService, NotificationGatewayService notificationGatewayService) {
        this.jwtService = jwtService;
        this.notificationGatewayService = notificationGatewayService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String token = NotificationWebSocketSupport.extractToken(session);
        log.info("WebSocket handshake established: sessionId={}, uri={}", session.getId(), session.getUri());
        if (token == null) {
            log.warn("WebSocket missing token: sessionId={}", session.getId());
            session.close(CloseStatus.POLICY_VIOLATION.withReason("Missing token"));
            return;
        }

        try {
            AuthUser authUser = jwtService.verifyAccessToken(token);
            log.info("WebSocket token verified: sessionId={}, userId={}, role={}", session.getId(), authUser.userId(), authUser.role());
            notificationGatewayService.register(
                session,
                authUser.userId(),
                authUser.role().name().toLowerCase()
            );
        } catch (Exception exception) {
            log.warn("WebSocket token invalid: sessionId={}, error={}", session.getId(), exception.getMessage());
            session.close(CloseStatus.POLICY_VIOLATION.withReason("Invalid token"));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        if (Objects.equals(message.getPayload(), "ping")) {
            session.sendMessage(new TextMessage("{\"type\":\"pong\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        notificationGatewayService.unregister(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        notificationGatewayService.unregister(session);
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }
}
