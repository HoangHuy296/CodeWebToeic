package com.ivyts.backend.domain.enrollment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Enrollment {

    private String id;
    private String student;
    private String course;
    private String status = "active";
    private int progressPercent;
    private List<String> completedLessonIds = new ArrayList<>();
    private List<LessonProgressItem> lessonProgress = new ArrayList<>();
    private String lastLessonId;
    private Instant enrolledAt;
    private Instant startedAt;
    private Instant completedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public EnrollmentStatus getStatus() { return EnrollmentStatus.valueOf(normalizeEnum(status)); }
    public void setStatus(EnrollmentStatus status) { this.status = status.name().toLowerCase(Locale.ROOT); }

    private String normalizeEnum(String value) {
        return (value == null ? "active" : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
