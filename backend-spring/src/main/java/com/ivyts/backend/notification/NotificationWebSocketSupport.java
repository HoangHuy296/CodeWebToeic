package com.ivyts.backend.notification;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.web.socket.WebSocketSession;

public final class NotificationWebSocketSupport {

    private NotificationWebSocketSupport() {
    }

    public static String extractToken(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null || uri.getQuery() == null || uri.getQuery().isBlank()) {
            return null;
        }

        for (String pair : uri.getQuery().split("&")) {
            String[] parts = pair.split("=", 2);
            if (parts.length == 2 && "token".equals(parts[0])) {
                return URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            }
        }
        return null;
    }
}
