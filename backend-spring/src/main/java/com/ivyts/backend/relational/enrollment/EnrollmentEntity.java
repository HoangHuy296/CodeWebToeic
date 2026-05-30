package com.ivyts.backend.relational.enrollment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "student_id", length = 64, nullable = false)
    private String studentId;

    @Column(name = "course_id", length = 64, nullable = false)
    private String courseId;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "progress_percent", nullable = false)
    private int progressPercent;

    @Column(name = "completed_lesson_ids", columnDefinition = "json")
    private String completedLessonIdsJson;

    @Column(name = "last_lesson_id", length = 64)
    private String lastLessonId;

    @Column(name = "enrolled_at")
    private Instant enrolledAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
