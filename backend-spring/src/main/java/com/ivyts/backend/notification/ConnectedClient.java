package com.ivyts.backend.notification;

import org.springframework.web.socket.WebSocketSession;

public record ConnectedClient(
    WebSocketSession session,
    String userId,
    String role
) {
}
