package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.enrollment.Enrollment;
import com.ivyts.backend.domain.lesson.Lesson;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.service.coursestore.CourseStore;
import com.ivyts.backend.service.coursestore.LessonStore;
import com.ivyts.backend.service.enrollmentstore.EnrollmentStore;
import com.ivyts.backend.service.userstore.UserStore;
import com.ivyts.backend.web.course.CourseMapper;
import com.ivyts.backend.web.enrollment.EnrollmentMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class LearningService {

    private final CourseStore courseStore;
    private final LessonStore lessonStore;
    private final EnrollmentStore enrollmentStore;
    private final UserStore userStore;
    private final CourseMapper courseMapper;
    private final EnrollmentMapper enrollmentMapper;

    public LearningService(
        CourseStore courseStore,
        LessonStore lessonStore,
        EnrollmentStore enrollmentStore,
        UserStore userStore,
        CourseMapper courseMapper,
        EnrollmentMapper enrollmentMapper
    ) {
        this.courseStore = courseStore;
        this.lessonStore = lessonStore;
        this.enrollmentStore = enrollmentStore;
        this.userStore = userStore;
        this.courseMapper = courseMapper;
        this.enrollmentMapper = enrollmentMapper;
    }

    public Map<String, Object> getLearningData(String courseId, AuthUser authUser) {
        if (authUser.role() != UserRole.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only students can access learning data");
        }

        Course course = courseStore.findById(courseId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));
        Enrollment enrollment = enrollmentStore.findByCourseAndStudent(courseId, authUser.userId())
            .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "You must enroll in this course before accessing learning data"));

        List<Lesson> lessons = lessonStore.findByCourseOrderByOrderAsc(courseId);
        Lesson currentLesson = lessons.stream()
            .filter(lesson -> lesson.getId().equals(enrollment.getLastLessonId()))
            .findFirst()
            .orElse(lessons.isEmpty() ? null : lessons.get(0));
        Lesson nextLesson = currentLesson == null
            ? null
            : lessons.stream().filter(lesson -> lesson.getOrder() == currentLesson.getOrder() + 1).findFirst().orElse(null);

        User owner = findUserOrThrow(course.getOwner());
        User student = findUserOrThrow(authUser.userId());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("course", courseMapper.toCourseView(course, owner, lessons));
        data.put("lessons", lessons.stream().map(courseMapper::toLessonView).toList());
        data.put("enrollment", enrollmentMapper.toEnrollmentView(enrollment, student, course));
        data.put("currentLessonId", currentLesson != null ? currentLesson.getId() : null);
        data.put("nextLessonId", nextLesson != null ? nextLesson.getId() : null);
        return data;
    }

    private User findUserOrThrow(String userId) {
        return userStore.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
