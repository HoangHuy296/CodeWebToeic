package com.ivyts.backend.domain.mocktest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("testsubmissions")
@CompoundIndexes({
    @CompoundIndex(name = "submission_student_mock_test_submitted_idx", def = "{'student': 1, 'mockTest': 1, 'submittedAt': -1}")
})
public class TestSubmission {

    @Id
    private String id;
    @Indexed
    private String student;
    @Indexed
    private String mockTest;
    private List<SubmissionAnswer> answers = new ArrayList<>();
    private int score;
    private int totalQuestions;
    private int correctAnswers;
    private int durationSeconds;
    private Instant submittedAt;
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudent() { return student; }
    public void setStudent(String student) { this.student = student; }
    public String getMockTest() { return mockTest; }
    public void setMockTest(String mockTest) { this.mockTest = mockTest; }
    public List<SubmissionAnswer> getAnswers() { return answers; }
    public void setAnswers(List<SubmissionAnswer> answers) { this.answers = answers; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
    public int getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }
    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
