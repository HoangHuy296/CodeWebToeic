package com.ivyts.backend.common.api;

import java.util.List;

public record ApiErrorResponse(
    boolean success,
    String message,
    List<ApiErrorItem> errors
) {
    public static ApiErrorResponse of(String message, List<ApiErrorItem> errors) {
        return new ApiErrorResponse(false, message, errors);
    }
}
