package com.ivyts.backend.web.admin;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.AdminService;
import com.ivyts.backend.web.admin.dto.UpdateAdminUserRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final RequestAuthService requestAuthService;

    public AdminController(AdminService adminService, RequestAuthService requestAuthService) {
        this.adminService = adminService;
        this.requestAuthService = requestAuthService;
    }

    @GetMapping("/stats")
    public ApiSuccessResponse<?> stats(HttpServletRequest request) {
        return ApiSuccessResponse.of("Admin stats fetched successfully", adminService.getStats(requestAuthService.requireUser(request)));
    }

    @GetMapping("/charts/revenue")
    public ApiSuccessResponse<?> revenueChart(HttpServletRequest request) {
        return ApiSuccessResponse.of("Revenue chart fetched successfully", adminService.getRevenueChart(requestAuthService.requireUser(request)));
    }

    @GetMapping("/charts/enrollments")
    public ApiSuccessResponse<?> enrollmentChart(HttpServletRequest request) {
        return ApiSuccessResponse.of("Enrollment chart fetched successfully", adminService.getEnrollmentChart(requestAuthService.requireUser(request)));
    }

    @GetMapping("/users")
    public ApiSuccessResponse<?> listUsers(HttpServletRequest request) {
        return ApiSuccessResponse.of("Users fetched successfully", adminService.listUsers(requestAuthService.requireUser(request)));
    }

    @GetMapping("/users/{id}")
    public ApiSuccessResponse<?> getUser(@PathVariable String id, HttpServletRequest request) {
        return ApiSuccessResponse.of("User fetched successfully", adminService.getUser(id, requestAuthService.requireUser(request)));
    }

    @PatchMapping("/users/{id}")
    public ApiSuccessResponse<?> updateUser(@PathVariable String id, HttpServletRequest request, @Valid @RequestBody UpdateAdminUserRequest body) {
        return ApiSuccessResponse.of("User updated successfully", adminService.updateUser(id, body, requestAuthService.requireUser(request)));
    }

    @DeleteMapping("/users/{id}")
    public ApiSuccessResponse<?> deactivateUser(@PathVariable String id, HttpServletRequest request) {
        return ApiSuccessResponse.of("User deactivated successfully", adminService.deactivateUser(id, requestAuthService.requireUser(request)));
    }
}
