package com.ivyts.backend.common.api;

public record ApiSuccessResponse<T>(
    boolean success,
    String message,
    T data
) {
    public static <T> ApiSuccessResponse<T> of(String message, T data) {
        return new ApiSuccessResponse<>(true, message, data);
    }
}
