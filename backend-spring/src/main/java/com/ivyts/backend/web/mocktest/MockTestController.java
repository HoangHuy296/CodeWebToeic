package com.ivyts.backend.web.mocktest;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.MockTestService;
import com.ivyts.backend.web.mocktest.dto.CreateMockTestRequest;
import com.ivyts.backend.web.mocktest.dto.SubmitMockTestRequest;
import com.ivyts.backend.web.mocktest.dto.UpdateMockTestRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/mock-tests")
public class MockTestController {

    private final MockTestService mockTestService;
    private final RequestAuthService requestAuthService;

    public MockTestController(MockTestService mockTestService, RequestAuthService requestAuthService) {
        this.mockTestService = mockTestService;
        this.requestAuthService = requestAuthService;
    }

    @GetMapping
    public ApiSuccessResponse<?> getMockTests(HttpServletRequest request) {
        return ApiSuccessResponse.of("Mock tests fetched successfully", mockTestService.listMockTests(requestAuthService.optionalUser(request)));
    }

    @GetMapping("/manage/mine")
    public ApiSuccessResponse<?> getManagedMockTests(HttpServletRequest request) {
        return ApiSuccessResponse.of("Managed mock tests fetched successfully", mockTestService.listManagedMockTests(requestAuthService.requireUser(request)));
    }

    @GetMapping("/{id}")
    public ApiSuccessResponse<?> getMockTestDetail(@PathVariable String id, HttpServletRequest request) {
        return ApiSuccessResponse.of("Mock test fetched successfully", mockTestService.getMockTestDetail(id, requestAuthService.optionalUser(request)));
    }

    @PostMapping
    public ApiSuccessResponse<?> createMockTest(HttpServletRequest request, @Valid @RequestBody CreateMockTestRequest body) {
        return ApiSuccessResponse.of("Mock test created successfully", mockTestService.createMockTest(body, requestAuthService.requireUser(request)));
    }

    @PatchMapping("/{id}")
    public ApiSuccessResponse<?> updateMockTest(@PathVariable String id, HttpServletRequest request, @Valid @RequestBody UpdateMockTestRequest body) {
        return ApiSuccessResponse.of("Mock test updated successfully", mockTestService.updateMockTest(id, body, requestAuthService.requireUser(request)));
    }

    @DeleteMapping("/{id}")
    public ApiSuccessResponse<?> deleteMockTest(@PathVariable String id, HttpServletRequest request) {
        mockTestService.deleteMockTest(id, requestAuthService.requireUser(request));
        return ApiSuccessResponse.of("Mock test deleted successfully", null);
    }

    @PostMapping("/{id}/submit")
    public ApiSuccessResponse<?> submitMockTest(@PathVariable String id, HttpServletRequest request, @Valid @RequestBody SubmitMockTestRequest body) {
        return ApiSuccessResponse.of("Mock test submitted successfully", mockTestService.submitMockTest(id, body, requestAuthService.requireUser(request)));
    }
}
