package com.ivyts.backend.domain.mocktest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
public class TestSubmission {

    private String id;
    private String student;
    private String mockTest;
    private List<SubmissionAnswer> answers = new ArrayList<>();
    private int score;
    private int totalQuestions;
    private int correctAnswers;
    private int durationSeconds;
    private Instant submittedAt;
    private Instant createdAt;
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
