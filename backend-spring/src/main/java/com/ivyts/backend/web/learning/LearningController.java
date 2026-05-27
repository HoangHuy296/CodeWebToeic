package com.ivyts.backend.web.learning;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.LearningService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/learning")
public class LearningController {

    private final LearningService learningService;
    private final RequestAuthService requestAuthService;

    public LearningController(LearningService learningService, RequestAuthService requestAuthService) {
        this.learningService = learningService;
        this.requestAuthService = requestAuthService;
    }

    @GetMapping("/{courseId}")
    public ApiSuccessResponse<?> getLearningPayload(@PathVariable String courseId, HttpServletRequest request) {
        return ApiSuccessResponse.of("Learning payload fetched successfully", learningService.getLearningData(courseId, requestAuthService.requireUser(request)));
    }
}
