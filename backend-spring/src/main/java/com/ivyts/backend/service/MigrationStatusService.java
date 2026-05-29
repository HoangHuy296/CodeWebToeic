package com.ivyts.backend.service;

import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class MigrationStatusService {

    public Map<String, Object> overview() {
        return Map.of(
            "status", "spring-production-default",
            "sourceBackend", "backend-spring/",
            "targetBackend", "backend-spring/",
            "implemented", new String[]{"auth", "courses", "lessons", "enrollments", "learning", "mock-tests", "messages", "posts", "admin", "websocket", "notification-inbox", "flyway-seed"},
            "next", new String[]{"archive-backend-node", "admin-role-hardening", "ci-smoke-automation"}
        );
    }
}
