package com.ivyts.backend.web.course;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.CourseService;
import com.ivyts.backend.web.course.dto.CreateCourseRequest;
import com.ivyts.backend.web.course.dto.CreateLessonRequest;
import com.ivyts.backend.web.course.dto.UpdateCourseRequest;
import com.ivyts.backend.web.course.dto.UpdateLessonRequest;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api")
public class CourseController {

    private final CourseService courseService;
    private final RequestAuthService requestAuthService;

    public CourseController(CourseService courseService, RequestAuthService requestAuthService) {
        this.courseService = courseService;
        this.requestAuthService = requestAuthService;
    }

    @GetMapping("/courses")
    public ApiSuccessResponse<?> getCourses() {
        return ApiSuccessResponse.of("Courses fetched successfully", courseService.listCourses());
    }

    @GetMapping("/courses/manage/mine")
    public ApiSuccessResponse<?> getManageCourses(HttpServletRequest request) {
        return ApiSuccessResponse.of("Manage courses fetched successfully", courseService.listManageCourses(requestAuthService.requireUser(request)));
    }

    @GetMapping("/courses/{slug}")
    public ApiSuccessResponse<?> getCourseDetail(@PathVariable String slug, HttpServletRequest request) {
        return ApiSuccessResponse.of("Course fetched successfully", courseService.getCourseBySlug(slug, requestAuthService.optionalUser(request)));
    }

    @PostMapping("/courses")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSuccessResponse<?> createCourse(HttpServletRequest request, @Valid @RequestBody CreateCourseRequest body) {
        return ApiSuccessResponse.of("Course created successfully", courseService.createCourse(body, requestAuthService.requireUser(request)));
    }

    @PatchMapping("/courses/{id}")
    public ApiSuccessResponse<?> updateCourse(@PathVariable String id, HttpServletRequest request, @Valid @RequestBody UpdateCourseRequest body) {
        return ApiSuccessResponse.of("Course updated successfully", courseService.updateCourse(id, body, requestAuthService.requireUser(request)));
    }

    @DeleteMapping("/courses/{id}")
    public ApiSuccessResponse<?> deleteCourse(@PathVariable String id, HttpServletRequest request) {
        courseService.deleteCourse(id, requestAuthService.requireUser(request));
        return ApiSuccessResponse.of("Course deleted successfully", Map.of());
    }

    @PostMapping("/courses/{courseId}/lessons")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSuccessResponse<?> createLesson(@PathVariable String courseId, HttpServletRequest request, @Valid @RequestBody CreateLessonRequest body) {
        return ApiSuccessResponse.of("Lesson created successfully", courseService.createLesson(courseId, body, requestAuthService.requireUser(request)));
    }

    @PatchMapping("/lessons/{id}")
    public ApiSuccessResponse<?> updateLesson(@PathVariable String id, HttpServletRequest request, @Valid @RequestBody UpdateLessonRequest body) {
        return ApiSuccessResponse.of("Lesson updated successfully", courseService.updateLesson(id, body, requestAuthService.requireUser(request)));
    }

    @DeleteMapping("/lessons/{id}")
    public ApiSuccessResponse<?> deleteLesson(@PathVariable String id, HttpServletRequest request) {
        courseService.deleteLesson(id, requestAuthService.requireUser(request));
        return ApiSuccessResponse.of("Lesson deleted successfully", Map.of());
    }
}
