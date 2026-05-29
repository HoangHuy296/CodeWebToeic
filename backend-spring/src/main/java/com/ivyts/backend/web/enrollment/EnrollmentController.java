package com.ivyts.backend.web.enrollment;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.EnrollmentService;
import com.ivyts.backend.web.enrollment.dto.CreateEnrollmentRequest;
import com.ivyts.backend.web.enrollment.dto.UpdateProgressRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final RequestAuthService requestAuthService;

    public EnrollmentController(EnrollmentService enrollmentService, RequestAuthService requestAuthService) {
        this.enrollmentService = enrollmentService;
        this.requestAuthService = requestAuthService;
    }

    @PostMapping("/enrollments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSuccessResponse<?> enroll(HttpServletRequest request, @Valid @RequestBody CreateEnrollmentRequest body) {
        return ApiSuccessResponse.of("Enrollment created successfully", enrollmentService.enrollCourse(body, requestAuthService.requireUser(request)));
    }

    @GetMapping("/enrollments/me")
    public ApiSuccessResponse<?> getMyEnrollments(HttpServletRequest request) {
        return ApiSuccessResponse.of("Enrollments fetched successfully", enrollmentService.getMyEnrollments(requestAuthService.requireUser(request)));
    }

    @GetMapping("/enrollments/course/{courseId}")
    public ApiSuccessResponse<?> getCourseEnrollments(@PathVariable String courseId, HttpServletRequest request) {
        return ApiSuccessResponse.of("Course enrollments fetched successfully", enrollmentService.getCourseEnrollments(courseId, requestAuthService.requireUser(request)));
    }

    @PatchMapping("/enrollments/{courseId}/progress")
    public ApiSuccessResponse<?> updateProgress(@PathVariable String courseId, HttpServletRequest request, @Valid @RequestBody UpdateProgressRequest body) {
        return ApiSuccessResponse.of("Learning progress updated successfully", enrollmentService.updateLearningProgress(courseId, body, requestAuthService.requireUser(request)));
    }
}
