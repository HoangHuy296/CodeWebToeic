package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.course.CourseRepository;
import com.ivyts.backend.domain.course.CourseReviewStatus;
import com.ivyts.backend.domain.lesson.Lesson;
import com.ivyts.backend.domain.lesson.LessonRepository;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRepository;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.util.SlugUtils;
import com.ivyts.backend.web.course.CourseMapper;
import com.ivyts.backend.web.course.dto.CreateCourseRequest;
import com.ivyts.backend.web.course.dto.CreateLessonRequest;
import com.ivyts.backend.web.course.dto.UpdateCourseRequest;
import com.ivyts.backend.web.course.dto.UpdateLessonRequest;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final CourseMapper courseMapper;

    public CourseService(CourseRepository courseRepository, LessonRepository lessonRepository, UserRepository userRepository, CourseMapper courseMapper) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
        this.courseMapper = courseMapper;
    }

    public List<Map<String, Object>> listCourses() {
        return courseRepository.findByIsPublishedTrue().stream()
            .map(course -> courseMapper.toCourseView(course, findOwner(course.getOwner()), null))
            .toList();
    }

    public List<Map<String, Object>> listManageCourses(AuthUser authUser) {
        List<Course> courses = authUser.role() == UserRole.ADMIN
            ? courseRepository.findAll()
            : courseRepository.findByOwner(authUser.userId());

        return courses.stream()
            .map(course -> courseMapper.toCourseView(course, findOwner(course.getOwner()), null))
            .toList();
    }

    public Map<String, Object> getCourseBySlug(String slug, AuthUser authUser) {
        Course course = courseRepository.findBySlug(slug)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.isPublished() && !canManageCourse(authUser, course)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Course not found");
        }

        List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(course.getId());
        return courseMapper.toCourseView(course, findOwner(course.getOwner()), lessons);
    }

    public Map<String, Object> createCourse(CreateCourseRequest request, AuthUser authUser) {
        String slug = SlugUtils.toSlug(request.slug() != null && !request.slug().isBlank() ? request.slug() : request.title());
        ensureUniqueCourseSlug(slug, null);

        boolean teacherCreated = authUser.role() == UserRole.TEACHER;

        Course course = new Course();
        course.setTitle(request.title().trim());
        course.setSlug(slug);
        course.setShortDescription(request.shortDescription().trim());
        course.setDescription(request.description().trim());
        course.setCategory(request.category().trim());
        course.setLevel(request.level());
        course.setPrice(request.price());
        course.setSalePrice(request.salePrice());
        course.setThumbnail(request.thumbnail().trim());
        course.setIntroVideo(request.introVideo());
        course.setMaterials(request.materials() == null ? List.of() : request.materials());
        course.setOwner(authUser.userId());
        course.setTags(request.tags() == null ? List.of() : request.tags());
        course.setBenefits(request.benefits() == null ? List.of() : request.benefits());
        course.setPublished(!teacherCreated && Boolean.TRUE.equals(request.isPublished()));
        course.setReviewStatus(teacherCreated
            ? CourseReviewStatus.PENDING_REVIEW
            : Boolean.TRUE.equals(request.isPublished()) ? CourseReviewStatus.APPROVED : CourseReviewStatus.PENDING_REVIEW);
        course.setReviewNote(request.reviewNote());
        course.setPublishedAt(course.isPublished() ? Instant.now() : null);

        courseRepository.save(course);

        User owner = findOwner(course.getOwner());
        if (owner.getOwnedCourseIds() != null && !owner.getOwnedCourseIds().contains(course.getId())) {
            owner.getOwnedCourseIds().add(course.getId());
            userRepository.save(owner);
        }

        return courseMapper.toCourseView(course, owner, List.of());
    }

    public Map<String, Object> updateCourse(String courseId, UpdateCourseRequest request, AuthUser authUser) {
        Course course = ensureManagePermission(courseId, authUser);
        boolean previousPublishedState = course.isPublished();

        if (authUser.role() == UserRole.TEACHER && request.isPublished() != null && request.isPublished() != course.isPublished()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Teachers cannot publish courses directly. Submit the draft for admin review.");
        }
        if (authUser.role() == UserRole.TEACHER && (request.reviewStatus() != null || request.reviewNote() != null)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Teachers cannot change admin review status.");
        }

        String nextSlug = request.slug() != null
            ? SlugUtils.toSlug(request.slug())
            : request.title() != null ? SlugUtils.toSlug(request.title()) : null;
        if (nextSlug != null && !nextSlug.equals(course.getSlug())) {
            ensureUniqueCourseSlug(nextSlug, courseId);
            course.setSlug(nextSlug);
        }

        if (request.title() != null) course.setTitle(request.title().trim());
        if (request.shortDescription() != null) course.setShortDescription(request.shortDescription().trim());
        if (request.description() != null) course.setDescription(request.description().trim());
        if (request.category() != null) course.setCategory(request.category().trim());
        if (request.level() != null) course.setLevel(request.level());
        if (request.price() != null) course.setPrice(request.price());
        if (request.salePrice() != null) course.setSalePrice(request.salePrice());
        if (request.thumbnail() != null) course.setThumbnail(request.thumbnail().trim());
        if (request.introVideo() != null) course.setIntroVideo(request.introVideo());
        if (request.materials() != null) course.setMaterials(request.materials());
        if (request.tags() != null) course.setTags(request.tags());
        if (request.benefits() != null) course.setBenefits(request.benefits());

        boolean teacherSubmittingForReview = authUser.role() == UserRole.TEACHER;
        boolean nextPublished = request.isPublished() != null ? request.isPublished() : course.isPublished();
        CourseReviewStatus nextReviewStatus = authUser.role() == UserRole.ADMIN
            ? request.reviewStatus() != null ? request.reviewStatus() : (nextPublished ? CourseReviewStatus.APPROVED : course.getReviewStatus())
            : CourseReviewStatus.PENDING_REVIEW;

        course.setReviewStatus(nextReviewStatus);
        course.setReviewNote(teacherSubmittingForReview ? null : request.reviewNote() != null ? request.reviewNote() : course.getReviewNote());
        course.setPublished(teacherSubmittingForReview ? false : nextPublished);

        if (authUser.role() == UserRole.ADMIN) {
            if (nextReviewStatus == CourseReviewStatus.APPROVED) {
                course.setPublished(true);
            }
            if (nextReviewStatus == CourseReviewStatus.CHANGES_REQUESTED || nextReviewStatus == CourseReviewStatus.REJECTED) {
                course.setPublished(false);
                course.setPublishedAt(null);
            }
        }

        if (teacherSubmittingForReview) {
            course.setPublishedAt(null);
        } else if (course.isPublished()) {
            course.setPublishedAt(previousPublishedState ? course.getPublishedAt() : Instant.now());
        } else {
            course.setPublishedAt(null);
        }

        courseRepository.save(course);
        return courseMapper.toCourseView(course, findOwner(course.getOwner()), lessonRepository.findByCourseOrderByOrderAsc(course.getId()));
    }

    public void deleteCourse(String courseId, AuthUser authUser) {
        Course course = ensureManagePermission(courseId, authUser);
        lessonRepository.deleteByCourse(course.getId());
        courseRepository.delete(course);
    }

    public Map<String, Object> createLesson(String courseId, CreateLessonRequest request, AuthUser authUser) {
        Course course = ensureManagePermission(courseId, authUser);
        String slug = SlugUtils.toSlug(request.slug() != null && !request.slug().isBlank() ? request.slug() : request.title());

        if (lessonRepository.existsByCourseAndSlug(courseId, slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "Lesson slug already exists in this course");
        }
        if (lessonRepository.existsByCourseAndOrder(courseId, request.order())) {
            throw new ApiException(HttpStatus.CONFLICT, "Lesson order already exists in this course");
        }

        Lesson lesson = new Lesson();
        lesson.setCourse(courseId);
        lesson.setTitle(request.title().trim());
        lesson.setSlug(slug);
        lesson.setDescription(request.description().trim());
        lesson.setContent(request.content());
        lesson.setVideo(request.video());
        lesson.setOrder(request.order());
        lesson.setPreview(Boolean.TRUE.equals(request.isPreview()));
        lesson.setMaterials(request.materials() == null ? List.of() : request.materials());
        lessonRepository.save(lesson);

        syncCourseLessonStats(course);
        return courseMapper.toLessonView(lesson);
    }

    public Map<String, Object> updateLesson(String lessonId, UpdateLessonRequest request, AuthUser authUser) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Lesson not found"));
        Course course = ensureManagePermission(lesson.getCourse(), authUser);

        String nextSlug = request.slug() != null ? SlugUtils.toSlug(request.slug()) : request.title() != null ? SlugUtils.toSlug(request.title()) : null;
        if (nextSlug != null && !nextSlug.equals(lesson.getSlug())) {
            if (lessonRepository.existsByCourseAndSlugAndIdNot(lesson.getCourse(), nextSlug, lessonId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Lesson slug already exists in this course");
            }
            lesson.setSlug(nextSlug);
        }
        if (request.order() != null && request.order() != lesson.getOrder()
            && lessonRepository.existsByCourseAndOrderAndIdNot(lesson.getCourse(), request.order(), lessonId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Lesson order already exists in this course");
        }

        if (request.title() != null) lesson.setTitle(request.title().trim());
        if (request.description() != null) lesson.setDescription(request.description().trim());
        if (request.content() != null) lesson.setContent(request.content());
        if (request.video() != null) lesson.setVideo(request.video());
        if (request.order() != null) lesson.setOrder(request.order());
        if (request.isPreview() != null) lesson.setPreview(request.isPreview());
        if (request.materials() != null) lesson.setMaterials(request.materials());

        lessonRepository.save(lesson);
        syncCourseLessonStats(course);
        return courseMapper.toLessonView(lesson);
    }

    public void deleteLesson(String lessonId, AuthUser authUser) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Lesson not found"));
        Course course = ensureManagePermission(lesson.getCourse(), authUser);
        lessonRepository.delete(lesson);
        syncCourseLessonStats(course);
    }

    private Course ensureManagePermission(String courseId, AuthUser authUser) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!canManageCourse(authUser, course)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to manage this course");
        }
        return course;
    }

    private boolean canManageCourse(AuthUser authUser, Course course) {
        return authUser != null && (authUser.role() == UserRole.ADMIN || (authUser.role() == UserRole.TEACHER && authUser.userId().equals(course.getOwner())));
    }

    private void ensureUniqueCourseSlug(String slug, String excludeCourseId) {
        courseRepository.findBySlug(slug).ifPresent(existing -> {
            if (excludeCourseId == null || !existing.getId().equals(excludeCourseId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Course slug already exists");
            }
        });
    }

    private void syncCourseLessonStats(Course course) {
        List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(course.getId());
        int totalDuration = lessons.stream()
            .map(Lesson::getVideo)
            .filter(video -> video != null && video.getDuration() != null)
            .mapToInt(video -> video.getDuration())
            .sum();

        course.setLessonCount(lessons.size());
        course.setTotalDuration(totalDuration);
        courseRepository.save(course);
    }

    private User findOwner(String ownerId) {
        return userRepository.findById(ownerId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course owner not found"));
    }
}
