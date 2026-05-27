package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.course.CourseRepository;
import com.ivyts.backend.domain.enrollment.Enrollment;
import com.ivyts.backend.domain.enrollment.EnrollmentRepository;
import com.ivyts.backend.domain.lesson.Lesson;
import com.ivyts.backend.domain.lesson.LessonRepository;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRepository;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.web.course.CourseMapper;
import com.ivyts.backend.web.enrollment.EnrollmentMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class LearningService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseMapper courseMapper;
    private final EnrollmentMapper enrollmentMapper;

    public LearningService(
        CourseRepository courseRepository,
        LessonRepository lessonRepository,
        EnrollmentRepository enrollmentRepository,
        UserRepository userRepository,
        CourseMapper courseMapper,
        EnrollmentMapper enrollmentMapper
    ) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseMapper = courseMapper;
        this.enrollmentMapper = enrollmentMapper;
    }

    public Map<String, Object> getLearningData(String courseId, AuthUser authUser) {
        if (authUser.role() != UserRole.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only students can access learning data");
        }

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));
        Enrollment enrollment = enrollmentRepository.findByCourseAndStudent(courseId, authUser.userId())
            .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "You must enroll in this course before accessing learning data"));

        List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(courseId);
        Lesson currentLesson = lessons.stream()
            .filter(lesson -> lesson.getId().equals(enrollment.getLastLessonId()))
            .findFirst()
            .orElse(lessons.isEmpty() ? null : lessons.getFirst());
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
        return userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
