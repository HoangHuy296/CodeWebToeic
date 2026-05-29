package com.ivyts.backend.relational.enrollment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "enrollment_lesson_progress")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(String enrollmentId) { this.enrollmentId = enrollmentId; }
    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public int getWatchedSeconds() { return watchedSeconds; }
    public void setWatchedSeconds(int watchedSeconds) { this.watchedSeconds = watchedSeconds; }
    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Instant getLastAccessedAt() { return lastAccessedAt; }
    public void setLastAccessedAt(Instant lastAccessedAt) { this.lastAccessedAt = lastAccessedAt; }
}
