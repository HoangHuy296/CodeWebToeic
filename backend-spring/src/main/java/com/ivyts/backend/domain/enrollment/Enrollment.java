package com.ivyts.backend.domain.enrollment;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("enrollments")
@CompoundIndexes({
    @CompoundIndex(name = "enrollment_student_course_idx", def = "{'student': 1, 'course': 1}", unique = true)
})
public class Enrollment {

    @Id
    private String id;
    @Indexed
    private String student;
    @Indexed
    private String course;
    private String status = "active";
    private int progressPercent;
    private List<String> completedLessonIds = new ArrayList<>();
    private List<LessonProgressItem> lessonProgress = new ArrayList<>();
    private String lastLessonId;
    private Instant enrolledAt;
    private Instant startedAt;
    private Instant completedAt;
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudent() { return student; }
    public void setStudent(String student) { this.student = student; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public EnrollmentStatus getStatus() { return EnrollmentStatus.valueOf(normalizeEnum(status)); }
    public void setStatus(EnrollmentStatus status) { this.status = status.name().toLowerCase(Locale.ROOT); }
    public int getProgressPercent() { return progressPercent; }
    public void setProgressPercent(int progressPercent) { this.progressPercent = progressPercent; }
    public List<String> getCompletedLessonIds() { return completedLessonIds; }
    public void setCompletedLessonIds(List<String> completedLessonIds) { this.completedLessonIds = completedLessonIds; }
    public List<LessonProgressItem> getLessonProgress() { return lessonProgress; }
    public void setLessonProgress(List<LessonProgressItem> lessonProgress) { this.lessonProgress = lessonProgress; }
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

    private String normalizeEnum(String value) {
        return (value == null ? "active" : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
