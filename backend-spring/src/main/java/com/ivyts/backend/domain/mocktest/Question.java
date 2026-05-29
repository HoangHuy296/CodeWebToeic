package com.ivyts.backend.domain.mocktest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
public class Question {

    private String id;
    private String mockTest;
    private String section = "mixed";
    private String prompt;
    private String explanation;
    private List<QuestionOption> options = new ArrayList<>();
    private String correctAnswer;
    private String audioUrl;
    private String imageUrl;
    private int points = 1;
    private int order;
    private String level = "medium";
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMockTest() { return mockTest; }
    public void setMockTest(String mockTest) { this.mockTest = mockTest; }
    public QuestionSection getSection() { return QuestionSection.valueOf(normalizeEnum(section, "mixed")); }
    public void setSection(QuestionSection section) { this.section = section.name().toLowerCase(Locale.ROOT); }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public List<QuestionOption> getOptions() { return options; }
    public void setOptions(List<QuestionOption> options) { this.options = options; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public int getOrder() { return order; }
    public void setOrder(int order) { this.order = order; }
    public QuestionLevel getLevel() { return QuestionLevel.valueOf(normalizeEnum(level, "medium")); }
    public void setLevel(QuestionLevel level) { this.level = level.name().toLowerCase(Locale.ROOT); }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    private String normalizeEnum(String value, String fallback) {
        return (value == null ? fallback : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
