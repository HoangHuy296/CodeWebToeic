package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.enrollment.Enrollment;
import com.ivyts.backend.domain.enrollment.EnrollmentStatus;
import com.ivyts.backend.domain.enrollment.LessonProgressItem;
import com.ivyts.backend.domain.lesson.Lesson;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.notification.NotificationEventsService;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.service.coursestore.CourseStore;
import com.ivyts.backend.service.coursestore.LessonStore;
import com.ivyts.backend.service.enrollmentstore.EnrollmentStore;
import com.ivyts.backend.service.userstore.UserStore;
import com.ivyts.backend.web.enrollment.EnrollmentMapper;
import com.ivyts.backend.web.enrollment.dto.CreateEnrollmentRequest;
import com.ivyts.backend.web.enrollment.dto.UpdateProgressRequest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class EnrollmentService {

    private final EnrollmentStore enrollmentStore;
    private final CourseStore courseStore;
    private final LessonStore lessonStore;
    private final UserStore userStore;
    private final EnrollmentMapper enrollmentMapper;
    private final NotificationEventsService notificationEventsService;

    public EnrollmentService(
        EnrollmentStore enrollmentStore,
        CourseStore courseStore,
        LessonStore lessonStore,
        UserStore userStore,
        EnrollmentMapper enrollmentMapper,
        NotificationEventsService notificationEventsService
    ) {
        this.enrollmentStore = enrollmentStore;
        this.courseStore = courseStore;
        this.lessonStore = lessonStore;
        this.userStore = userStore;
        this.enrollmentMapper = enrollmentMapper;
        this.notificationEventsService = notificationEventsService;
    }

    public Map<String, Object> enrollCourse(CreateEnrollmentRequest request, AuthUser authUser) {
        ensureStudent(authUser);
        Course course = findPublishedCourseOrThrow(request.courseId());

        enrollmentStore.findByCourseAndStudent(course.getId(), authUser.userId())
            .ifPresent(existing -> {
                throw new ApiException(HttpStatus.CONFLICT, "You are already enrolled in this course");
            });

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(authUser.userId());
        enrollment.setCourse(course.getId());
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollment.setProgressPercent(0);
        enrollment.setCompletedLessonIds(new ArrayList<>());
        enrollment.setLessonProgress(new ArrayList<>());
        enrollment.setEnrolledAt(Instant.now());
        enrollment = enrollmentStore.save(enrollment);
        User student = userStore.findById(authUser.userId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));
        User owner = userStore.findById(course.getOwner())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course owner not found"));
        notificationEventsService.emitEnrollmentCreated(
            student.getId(),
            student.getFullName(),
            course.getId(),
            course.getTitle(),
            owner.getId(),
            owner.getRole().name().toLowerCase()
        );

        return toEnrollmentView(enrollment);
    }

    public List<Map<String, Object>> getMyEnrollments(AuthUser authUser) {
        ensureStudent(authUser);
        return enrollmentStore.findByStudentAndStatusInOrderByCreatedAtDesc(
                authUser.userId(),
                List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED)
            )
            .stream()
            .map(this::toEnrollmentView)
            .toList();
    }

    public List<Map<String, Object>> getCourseEnrollments(String courseId, AuthUser authUser) {
        Course course = findCourseOrThrow(courseId);
        if (!canManageCourse(authUser, course)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to view these enrollments");
        }

        return enrollmentStore.findByCourseOrderByCreatedAtDesc(courseId).stream()
            .map(this::toEnrollmentView)
            .toList();
    }

    public Map<String, Object> updateLearningProgress(String courseId, UpdateProgressRequest request, AuthUser authUser) {
        ensureStudent(authUser);
        Enrollment enrollment = findEnrollmentOrThrow(courseId, authUser.userId());
        Lesson lesson = lessonStore.findById(request.lessonId())
            .filter(current -> current.getCourse().equals(courseId))
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Lesson not found in this course"));

        int totalLessons = lessonStore.findByCourseOrderByOrderAsc(courseId).size();
        Instant nextAccessedAt = request.lastAccessedAt() != null ? request.lastAccessedAt() : Instant.now();

        LessonProgressItem progressItem = enrollment.getLessonProgress().stream()
            .filter(item -> item.getLesson().equals(request.lessonId()))
            .findFirst()
            .orElse(null);

        if (progressItem == null) {
            progressItem = new LessonProgressItem();
            progressItem.setLesson(request.lessonId());
            progressItem.setWatchedSeconds(0);
            progressItem.setCompleted(false);
            enrollment.getLessonProgress().add(progressItem);
        }

        if (request.watchedSeconds() != null) {
            progressItem.setWatchedSeconds(Math.max(progressItem.getWatchedSeconds(), request.watchedSeconds()));
        }
        if (request.isCompleted() != null) {
            progressItem.setCompleted(request.isCompleted());
        }
        progressItem.setLastAccessedAt(nextAccessedAt);
        progressItem.setCompletedAt(progressItem.isCompleted()
            ? progressItem.getCompletedAt() != null ? progressItem.getCompletedAt() : Instant.now()
            : null);

        List<String> completedLessonIds = enrollment.getLessonProgress().stream()
            .filter(LessonProgressItem::isCompleted)
            .map(LessonProgressItem::getLesson)
            .distinct()
            .toList();

        enrollment.setCompletedLessonIds(new ArrayList<>(completedLessonIds));
        enrollment.setProgressPercent(computeProgressPercent(completedLessonIds.size(), totalLessons));
        enrollment.setLastLessonId(lesson.getId());
        enrollment.setStartedAt(enrollment.getStartedAt() != null ? enrollment.getStartedAt() : Instant.now());
        enrollment.setStatus(enrollment.getProgressPercent() == 100 && totalLessons > 0 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE);
        enrollment.setCompletedAt(enrollment.getStatus() == EnrollmentStatus.COMPLETED
            ? enrollment.getCompletedAt() != null ? enrollment.getCompletedAt() : Instant.now()
            : null);

        enrollment = enrollmentStore.save(enrollment);
        return toEnrollmentView(enrollment);
    }

    private Course findPublishedCourseOrThrow(String courseId) {
        Course course = findCourseOrThrow(courseId);
        if (!course.isPublished()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Course not found");
        }
        return course;
    }

    private Course findCourseOrThrow(String courseId) {
        return courseStore.findById(courseId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    private Enrollment findEnrollmentOrThrow(String courseId, String studentId) {
        return enrollmentStore.findByCourseAndStudent(courseId, studentId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Enrollment not found"));
    }

    private Map<String, Object> toEnrollmentView(Enrollment enrollment) {
        User student = userStore.findById(enrollment.getStudent())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));
        Course course = findCourseOrThrow(enrollment.getCourse());
        return enrollmentMapper.toEnrollmentView(enrollment, student, course);
    }

    private int computeProgressPercent(int completedCount, int totalLessons) {
        if (totalLessons <= 0) {
            return 0;
        }
        return Math.round((completedCount * 100.0f) / totalLessons);
    }

    private boolean canManageCourse(AuthUser authUser, Course course) {
        return authUser.role() == UserRole.ADMIN
            || (authUser.role() == UserRole.TEACHER && authUser.userId().equals(course.getOwner()));
    }

    private void ensureStudent(AuthUser authUser) {
        if (authUser.role() != UserRole.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only students can access this resource");
        }
    }
}
