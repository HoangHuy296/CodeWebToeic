package com.ivyts.backend.relational.enrollment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "enrollment_lesson_progress")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentLessonProgressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enrollment_id", length = 64, nullable = false)
    private String enrollmentId;

    @Column(name = "lesson_id", length = 64, nullable = false)
    private String lessonId;

    @Column(name = "watched_seconds", nullable = false)
    private int watchedSeconds;

    @Column(name = "is_completed", nullable = false)
    private boolean isCompleted;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "last_accessed_at")
    private Instant lastAccessedAt;
}
