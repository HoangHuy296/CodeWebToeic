package com.ivyts.backend.web.notification;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.NotificationInboxService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationInboxService notificationInboxService;
    private final RequestAuthService requestAuthService;

    public NotificationController(
        NotificationInboxService notificationInboxService,
        RequestAuthService requestAuthService
    ) {
        this.notificationInboxService = notificationInboxService;
        this.requestAuthService = requestAuthService;
    }

    @GetMapping
    public ApiSuccessResponse<?> listNotifications(HttpServletRequest request) {
        return ApiSuccessResponse.of(
            "Notifications fetched successfully",
            notificationInboxService.listNotifications(requestAuthService.requireUser(request))
        );
    }

    @PatchMapping("/{id}/read")
    public ApiSuccessResponse<?> markAsRead(@PathVariable String id, HttpServletRequest request) {
        return ApiSuccessResponse.of(
            "Notification updated successfully",
            notificationInboxService.markAsRead(id, requestAuthService.requireUser(request))
        );
    }

    @PatchMapping("/read-all")
    public ApiSuccessResponse<?> markAllAsRead(HttpServletRequest request) {
        return ApiSuccessResponse.of(
            "Notifications updated successfully",
            notificationInboxService.markAllAsRead(requestAuthService.requireUser(request))
        );
    }

    @DeleteMapping
    public ApiSuccessResponse<?> clearNotifications(HttpServletRequest request) {
        return ApiSuccessResponse.of(
            "Notifications cleared successfully",
            notificationInboxService.clearNotifications(requestAuthService.requireUser(request))
        );
    }
}
