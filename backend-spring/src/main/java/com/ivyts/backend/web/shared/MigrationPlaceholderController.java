package com.ivyts.backend.web.shared;

import com.ivyts.backend.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public abstract class MigrationPlaceholderController {

    protected <T> T notImplemented(String routeGroup) {
        throw new ApiException(
            HttpStatus.NOT_IMPLEMENTED,
            "Spring Boot migration for route group '" + routeGroup + "' has not been completed yet"
        );
    }
}
