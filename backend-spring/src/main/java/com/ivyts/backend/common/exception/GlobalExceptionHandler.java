package com.ivyts.backend.common.exception;

import com.ivyts.backend.common.api.ApiErrorItem;
import com.ivyts.backend.common.api.ApiErrorResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(ApiException exception) {
        return ResponseEntity.status(exception.getStatus())
            .body(ApiErrorResponse.of(exception.getCode(), exception.getMessage(), List.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        List<ApiErrorItem> errors = exception.getBindingResult()
            .getAllErrors()
            .stream()
            .map(error -> {
                if (error instanceof FieldError fieldError) {
                    return new ApiErrorItem(fieldError.getField(), fieldError.getDefaultMessage());
                }
                return new ApiErrorItem(null, error.getDefaultMessage());
            })
            .toList();

        return ResponseEntity.badRequest().body(ApiErrorResponse.of(null, "Validation failed", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnknown(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiErrorResponse.of(null, exception.getMessage() == null ? "Unexpected error" : exception.getMessage(), List.of()));
    }
}
