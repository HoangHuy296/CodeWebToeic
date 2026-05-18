package com.ivyts.backend.web.system;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.service.MigrationStatusService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SystemController {

    private final MigrationStatusService migrationStatusService;

    public SystemController(MigrationStatusService migrationStatusService) {
        this.migrationStatusService = migrationStatusService;
    }

    @GetMapping("/")
    public ApiSuccessResponse<Map<String, Object>> root() {
        return ApiSuccessResponse.of("Spring Boot backend is running", migrationStatusService.overview());
    }

    @GetMapping("/api/health")
    public ApiSuccessResponse<Map<String, Object>> health() {
        return ApiSuccessResponse.of("Service healthy", Map.of("service", "backend-spring", "status", "ok"));
    }
}
