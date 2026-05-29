package com.ivyts.backend.service.enrollmentstore;

import com.ivyts.backend.domain.enrollment.Enrollment;
import com.ivyts.backend.domain.enrollment.EnrollmentStatus;
import com.ivyts.backend.domain.enrollment.LessonProgressItem;
import com.ivyts.backend.relational.enrollment.EnrollmentEntity;
import com.ivyts.backend.relational.enrollment.EnrollmentJpaRepository;
import com.ivyts.backend.relational.enrollment.EnrollmentLessonProgressEntity;
import com.ivyts.backend.relational.enrollment.EnrollmentLessonProgressJpaRepository;
import com.ivyts.backend.service.userstore.UserJsonCodec;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class MySqlEnrollmentStore implements EnrollmentStore {

    private final EnrollmentJpaRepository enrollmentJpaRepository;
    private final EnrollmentLessonProgressJpaRepository progressJpaRepository;
    private final UserJsonCodec userJsonCodec;

    public MySqlEnrollmentStore(
        EnrollmentJpaRepository enrollmentJpaRepository,
        EnrollmentLessonProgressJpaRepository progressJpaRepository,
        UserJsonCodec userJsonCodec
    ) {
        this.enrollmentJpaRepository = enrollmentJpaRepository;
        this.progressJpaRepository = progressJpaRepository;
        this.userJsonCodec = userJsonCodec;
    }

    @Override
    public Optional<Enrollment> findById(String id) {
        return enrollmentJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Enrollment> findByCourseAndStudent(String courseId, String studentId) {
        return enrollmentJpaRepository.findByCourseIdAndStudentId(courseId, studentId).map(this::toDomain);
    }

    @Override
    public List<Enrollment> findAll() {
        return enrollmentJpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Enrollment> findByStudentAndStatusInOrderByCreatedAtDesc(String studentId, List<EnrollmentStatus> statuses) {
        List<String> statusValues = statuses.stream().map(status -> status.name().toLowerCase()).toList();
        return enrollmentJpaRepository.findByStudentIdAndStatusInOrderByCreatedAtDesc(studentId, statusValues)
            .stream()
            .map(this::toDomain)
            .toList();
    }

    @Override
    public List<Enrollment> findByCourseOrderByCreatedAtDesc(String courseId) {
        return enrollmentJpaRepository.findByCourseIdOrderByCreatedAtDesc(courseId).stream().map(this::toDomain).toList();
    }

    @Override
    @Transactional
    public Enrollment save(Enrollment enrollment) {
        String enrollmentId = enrollment.getId() == null ? UUID.randomUUID().toString().replace("-", "") : enrollment.getId();
        EnrollmentEntity entity = enrollment.getId() == null
            ? new EnrollmentEntity()
            : enrollmentJpaRepository.findById(enrollment.getId()).orElseGet(EnrollmentEntity::new);

        entity.setId(enrollmentId);
        entity.setStudentId(enrollment.getStudent());
        entity.setCourseId(enrollment.getCourse());
        entity.setStatus(enrollment.getStatus().name().toLowerCase());
        entity.setProgressPercent(enrollment.getProgressPercent());
        entity.setCompletedLessonIdsJson(userJsonCodec.write(enrollment.getCompletedLessonIds()));
        entity.setLastLessonId(enrollment.getLastLessonId());
        entity.setEnrolledAt(enrollment.getEnrolledAt());
        entity.setStartedAt(enrollment.getStartedAt());
        entity.setCompletedAt(enrollment.getCompletedAt());
        entity.setCreatedAt(enrollment.getCreatedAt());
        entity.setUpdatedAt(enrollment.getUpdatedAt());

        EnrollmentEntity savedEntity = enrollmentJpaRepository.save(entity);

        progressJpaRepository.deleteByEnrollmentId(savedEntity.getId());
        progressJpaRepository.flush();
        for (LessonProgressItem item : dedupeLessonProgress(enrollment.getLessonProgress())) {
            EnrollmentLessonProgressEntity progressEntity = new EnrollmentLessonProgressEntity();
            progressEntity.setEnrollmentId(savedEntity.getId());
            progressEntity.setLessonId(item.getLesson());
            progressEntity.setWatchedSeconds(item.getWatchedSeconds());
            progressEntity.setCompleted(item.isCompleted());
            progressEntity.setCompletedAt(item.getCompletedAt());
            progressEntity.setLastAccessedAt(item.getLastAccessedAt());
            progressJpaRepository.save(progressEntity);
        }

        return toDomain(savedEntity);
    }

    private Enrollment toDomain(EnrollmentEntity entity) {
        Enrollment enrollment = new Enrollment();
        enrollment.setId(entity.getId());
        enrollment.setStudent(entity.getStudentId());
        enrollment.setCourse(entity.getCourseId());
        enrollment.setStatus(EnrollmentStatus.valueOf(entity.getStatus().toUpperCase().replace('-', '_')));
        enrollment.setProgressPercent(entity.getProgressPercent());
        enrollment.setCompletedLessonIds(new ArrayList<>(userJsonCodec.readStringList(entity.getCompletedLessonIdsJson())));
        enrollment.setLastLessonId(entity.getLastLessonId());
        enrollment.setEnrolledAt(entity.getEnrolledAt());
        enrollment.setStartedAt(entity.getStartedAt());
        enrollment.setCompletedAt(entity.getCompletedAt());
        enrollment.setCreatedAt(entity.getCreatedAt());
        enrollment.setUpdatedAt(entity.getUpdatedAt());
        enrollment.setLessonProgress(new ArrayList<>(
            progressJpaRepository.findByEnrollmentIdOrderByIdAsc(entity.getId()).stream()
                .map(this::toProgressItem)
                .toList()
        ));
        return enrollment;
    }

    private List<LessonProgressItem> dedupeLessonProgress(List<LessonProgressItem> lessonProgress) {
        Map<String, LessonProgressItem> deduped = new LinkedHashMap<>();
        for (LessonProgressItem item : lessonProgress) {
            if (item == null || item.getLesson() == null) {
                continue;
            }
            deduped.put(item.getLesson(), item);
        }
        return new ArrayList<>(deduped.values());
    }

    private LessonProgressItem toProgressItem(EnrollmentLessonProgressEntity entity) {
        LessonProgressItem item = new LessonProgressItem();
        item.setLesson(entity.getLessonId());
        item.setWatchedSeconds(entity.getWatchedSeconds());
        item.setCompleted(entity.isCompleted());
        item.setCompletedAt(entity.getCompletedAt());
        item.setLastAccessedAt(entity.getLastAccessedAt());
        return item;
    }
}
