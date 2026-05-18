package com.ivyts.backend.web.enrollment;

import com.ivyts.backend.web.shared.MigrationPlaceholderController;
import java.util.Map;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api")
public class EnrollmentController extends MigrationPlaceholderController {

    @PostMapping("/enrollments")
    public Object enroll(@RequestBody Map<String, Object> body) { return notImplemented("enrollments.create"); }

    @GetMapping("/enrollments/me")
    public Object getMyEnrollments() { return notImplemented("enrollments.me"); }

    @GetMapping("/enrollments/course/{courseId}")
    public Object getCourseEnrollments(@PathVariable String courseId) { return notImplemented("enrollments.course"); }

    @PatchMapping("/enrollments/{courseId}/progress")
    public Object updateProgress(@PathVariable String courseId, @RequestBody Map<String, Object> body) { return notImplemented("enrollments.progress"); }
}
