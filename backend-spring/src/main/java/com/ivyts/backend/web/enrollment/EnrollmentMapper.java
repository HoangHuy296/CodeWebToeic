package com.ivyts.backend.web.enrollment;

import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.enrollment.Enrollment;
import com.ivyts.backend.domain.enrollment.LessonProgressItem;
import com.ivyts.backend.domain.user.User;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class EnrollmentMapper {

    public Map<String, Object> toEnrollmentView(Enrollment enrollment, User student, Course course) {
        Map<String, Object> studentView = new LinkedHashMap<>();
        studentView.put("id", student.getId());
        studentView.put("fullName", student.getFullName());
        studentView.put("email", student.getEmail());

        Map<String, Object> courseView = new LinkedHashMap<>();
        courseView.put("id", course.getId());
        courseView.put("title", course.getTitle());
        courseView.put("slug", course.getSlug());
        courseView.put("thumbnail", course.getThumbnail());
        courseView.put("category", course.getCategory());
        courseView.put("level", course.getLevel().name().toLowerCase());
        courseView.put("lessonCount", course.getLessonCount());
        courseView.put("totalDuration", course.getTotalDuration());

        List<Map<String, Object>> lessonProgress = enrollment.getLessonProgress().stream()
            .map(this::toLessonProgressView)
            .toList();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", enrollment.getId());
        data.put("student", studentView);
        data.put("course", courseView);
        data.put("status", enrollment.getStatus().name().toLowerCase());
        data.put("progressPercent", enrollment.getProgressPercent());
        data.put("completedLessonIds", enrollment.getCompletedLessonIds());
        data.put("lessonProgress", lessonProgress);
        data.put("lastLessonId", enrollment.getLastLessonId());
        data.put("enrolledAt", enrollment.getEnrolledAt());
        data.put("startedAt", enrollment.getStartedAt());
        data.put("completedAt", enrollment.getCompletedAt());
        return data;
    }

    private Map<String, Object> toLessonProgressView(LessonProgressItem item) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("lessonId", item.getLesson());
        data.put("watchedSeconds", item.getWatchedSeconds());
        data.put("isCompleted", item.isCompleted());
        data.put("completedAt", item.getCompletedAt());
        data.put("lastAccessedAt", item.getLastAccessedAt());
        return data;
    }
}
