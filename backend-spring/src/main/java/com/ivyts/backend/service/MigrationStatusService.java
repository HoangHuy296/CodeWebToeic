package com.ivyts.backend.service;

import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class MigrationStatusService {

    public Map<String, Object> overview() {
        return Map.of(
            "status", "in_progress",
            "sourceBackend", "backend/",
            "targetBackend", "backend-spring/",
            "implemented", new String[]{"system", "configuration", "mongodb-foundation", "security-foundation", "route-skeletons"},
            "next", new String[]{"auth-service", "course-service", "enrollment-service", "mock-test-service", "message-service"}
        );
    }
}
