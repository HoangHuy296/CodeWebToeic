package com.ivyts.backend.relational.enrollment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "enrollments")
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

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getProgressPercent() { return progressPercent; }
    public void setProgressPercent(int progressPercent) { this.progressPercent = progressPercent; }
    public String getCompletedLessonIdsJson() { return completedLessonIdsJson; }
    public void setCompletedLessonIdsJson(String completedLessonIdsJson) { this.completedLessonIdsJson = completedLessonIdsJson; }
    public String getLastLessonId() { return lastLessonId; }
    public void setLastLessonId(String lastLessonId) { this.lastLessonId = lastLessonId; }
    public Instant getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(Instant enrolledAt) { this.enrolledAt = enrolledAt; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
