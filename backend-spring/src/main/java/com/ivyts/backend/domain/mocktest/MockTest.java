package com.ivyts.backend.domain.mocktest;

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
public class MockTest {

    private String id;
    private String title;
    private String description;
    private String type = "mini-test";
    private String level = "beginner";
    private int durationMinutes;
    private int questionCount;
    private String status = "draft";
    private List<String> instructions = new ArrayList<>();
    private String createdBy;
    private boolean isFeatured;
    private List<String> assignedCourses = new ArrayList<>();
    private String catalogKind = "mock-test";
    private String exerciseTopicSlug;
    private String exercisePackSlug;
    private Instant createdAt;
    private Instant updatedAt;

    public MockTestType getType() { return MockTestType.valueOf(normalizeEnum(type)); }
    public void setType(MockTestType type) { this.type = type.name().toLowerCase(Locale.ROOT).replace('_', '-'); }
    public MockTestLevel getLevel() { return MockTestLevel.valueOf(normalizeEnum(level)); }
    public void setLevel(MockTestLevel level) { this.level = level.name().toLowerCase(Locale.ROOT); }
    public MockTestStatus getStatus() { return MockTestStatus.valueOf(normalizeEnum(status)); }
    public void setStatus(MockTestStatus status) { this.status = status.name().toLowerCase(Locale.ROOT); }

    private String normalizeEnum(String value) {
        return (value == null ? "draft" : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
