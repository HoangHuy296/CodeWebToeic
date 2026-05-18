package com.ivyts.backend.domain.mocktest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("mockTests")
@CompoundIndexes({
    @CompoundIndex(name = "mock_test_status_level_type_idx", def = "{'status': 1, 'level': 1, 'type': 1}")
})
public class MockTest {

    @Id
    private String id;
    private String title;
    private String description;
    @Indexed
    private MockTestType type = MockTestType.MINI_TEST;
    @Indexed
    private MockTestLevel level = MockTestLevel.BEGINNER;
    private int durationMinutes;
    private int questionCount;
    @Indexed
    private MockTestStatus status = MockTestStatus.DRAFT;
    private List<String> instructions = new ArrayList<>();
    @Indexed
    private String createdBy;
    private boolean isFeatured;
    private List<String> assignedCourses = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public MockTestType getType() { return type; }
    public void setType(MockTestType type) { this.type = type; }
    public MockTestLevel getLevel() { return level; }
    public void setLevel(MockTestLevel level) { this.level = level; }
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
    public MockTestStatus getStatus() { return status; }
    public void setStatus(MockTestStatus status) { this.status = status; }
    public List<String> getInstructions() { return instructions; }
    public void setInstructions(List<String> instructions) { this.instructions = instructions; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean featured) { isFeatured = featured; }
    public List<String> getAssignedCourses() { return assignedCourses; }
    public void setAssignedCourses(List<String> assignedCourses) { this.assignedCourses = assignedCourses; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
