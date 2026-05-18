package com.ivyts.backend.web.course;

import com.ivyts.backend.web.shared.MigrationPlaceholderController;
import java.util.Map;
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
@RequestMapping("/api")
public class CourseController extends MigrationPlaceholderController {

    @GetMapping("/courses")
    public Object getCourses() { return notImplemented("courses.list"); }

    @GetMapping("/courses/manage/mine")
    public Object getManageCourses() { return notImplemented("courses.manage.mine"); }

    @GetMapping("/courses/{slug}")
    public Object getCourseDetail(@PathVariable String slug) { return notImplemented("courses.detail"); }

    @PostMapping("/courses")
    public Object createCourse(@RequestBody Map<String, Object> body) { return notImplemented("courses.create"); }

    @PatchMapping("/courses/{id}")
    public Object updateCourse(@PathVariable String id, @RequestBody Map<String, Object> body) { return notImplemented("courses.update"); }

    @DeleteMapping("/courses/{id}")
    public Object deleteCourse(@PathVariable String id) { return notImplemented("courses.delete"); }

    @PostMapping("/courses/{courseId}/lessons")
    public Object createLesson(@PathVariable String courseId, @RequestBody Map<String, Object> body) { return notImplemented("courses.lessons.create"); }

    @PatchMapping("/lessons/{id}")
    public Object updateLesson(@PathVariable String id, @RequestBody Map<String, Object> body) { return notImplemented("lessons.update"); }

    @DeleteMapping("/lessons/{id}")
    public Object deleteLesson(@PathVariable String id) { return notImplemented("lessons.delete"); }
}
