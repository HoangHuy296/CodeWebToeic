package com.ivyts.backend.web.exercise;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.MockTestService;
import com.ivyts.backend.service.exercise.ExerciseTopicService;
import com.ivyts.backend.web.mocktest.dto.CreateMockTestRequest;
import com.ivyts.backend.web.mocktest.dto.SubmitMockTestRequest;
import com.ivyts.backend.web.mocktest.dto.UpdateMockTestRequest;
import com.ivyts.backend.web.exercise.dto.ExerciseTopicRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseTopicService exerciseTopicService;
    private final MockTestService mockTestService;
    private final RequestAuthService requestAuthService;

    public ExerciseController(
        ExerciseTopicService exerciseTopicService,
        MockTestService mockTestService,
        RequestAuthService requestAuthService
    ) {
        this.exerciseTopicService = exerciseTopicService;
        this.mockTestService = mockTestService;
        this.requestAuthService = requestAuthService;
    }

    @GetMapping("/topics")
    public ApiSuccessResponse<?> listTopics() {
        return ApiSuccessResponse.of("Exercise topics fetched successfully", exerciseTopicService.listTopics());
    }

    @GetMapping("/topics/{slug}")
    public ApiSuccessResponse<?> getTopic(@PathVariable String slug) {
        return ApiSuccessResponse.of("Exercise topic fetched successfully", exerciseTopicService.getTopicBySlug(slug));
    }

    @PostMapping("/topics")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSuccessResponse<?> createTopic(HttpServletRequest request, @Valid @RequestBody ExerciseTopicRequest body) {
        return ApiSuccessResponse.of("Exercise topic created successfully", exerciseTopicService.createTopic(body, requestAuthService.requireUser(request)));
    }

    @PatchMapping("/topics/{id}")
    public ApiSuccessResponse<?> updateTopic(@PathVariable String id, HttpServletRequest request, @Valid @RequestBody ExerciseTopicRequest body) {
        return ApiSuccessResponse.of("Exercise topic updated successfully", exerciseTopicService.updateTopic(id, body, requestAuthService.requireUser(request)));
    }

    @DeleteMapping("/topics/{id}")
    public ApiSuccessResponse<?> deleteTopic(@PathVariable String id, HttpServletRequest request) {
        return ApiSuccessResponse.of("Exercise topic deleted successfully", exerciseTopicService.deleteTopic(id, requestAuthService.requireUser(request)));
    }

    @GetMapping("/items")
    public ApiSuccessResponse<?> listItems(HttpServletRequest request, @RequestParam(name = "topicSlug", required = false) String topicSlug) {
        return ApiSuccessResponse.of(
            "Exercise items fetched successfully",
            mockTestService.listExerciseItems(requestAuthService.optionalUser(request), topicSlug)
        );
    }

    @GetMapping("/items/manage/mine")
    public ApiSuccessResponse<?> listManagedItems(HttpServletRequest request) {
        return ApiSuccessResponse.of(
            "Managed exercise items fetched successfully",
            mockTestService.listManagedExerciseItems(requestAuthService.requireUser(request))
        );
    }

    @GetMapping("/items/{id}")
    public ApiSuccessResponse<?> getItemDetail(@PathVariable String id, HttpServletRequest request) {
        return ApiSuccessResponse.of(
            "Exercise item fetched successfully",
            mockTestService.getExerciseItemDetail(id, requestAuthService.optionalUser(request))
        );
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSuccessResponse<?> createItem(HttpServletRequest request, @Valid @RequestBody CreateMockTestRequest body) {
        return ApiSuccessResponse.of(
            "Exercise item created successfully",
            mockTestService.createExerciseItem(body, requestAuthService.requireUser(request))
        );
    }

    @PatchMapping("/items/{id}")
    public ApiSuccessResponse<?> updateItem(@PathVariable String id, HttpServletRequest request, @Valid @RequestBody UpdateMockTestRequest body) {
        return ApiSuccessResponse.of(
            "Exercise item updated successfully",
            mockTestService.updateExerciseItem(id, body, requestAuthService.requireUser(request))
        );
    }

    @DeleteMapping("/items/{id}")
    public ApiSuccessResponse<?> deleteItem(@PathVariable String id, HttpServletRequest request) {
        mockTestService.deleteExerciseItem(id, requestAuthService.requireUser(request));
        return ApiSuccessResponse.of("Exercise item deleted successfully", Map.of());
    }

    @PostMapping("/items/{id}/submit")
    public ApiSuccessResponse<?> submitItem(@PathVariable String id, HttpServletRequest request, @Valid @RequestBody SubmitMockTestRequest body) {
        return ApiSuccessResponse.of(
            "Exercise item submitted successfully",
            mockTestService.submitExerciseItem(id, body, requestAuthService.requireUser(request))
        );
    }

    @GetMapping("/submissions")
    public ApiSuccessResponse<?> listSubmissions(HttpServletRequest request) {
        return ApiSuccessResponse.of(
            "Exercise submissions fetched successfully",
            mockTestService.listExerciseSubmissionResults(requestAuthService.requireUser(request))
        );
    }

    @GetMapping("/submissions/{submissionId}")
    public ApiSuccessResponse<?> getSubmissionDetail(@PathVariable String submissionId, HttpServletRequest request) {
        return ApiSuccessResponse.of(
            "Exercise submission fetched successfully",
            mockTestService.getExerciseSubmissionDetail(submissionId, requestAuthService.requireUser(request))
        );
    }
}
