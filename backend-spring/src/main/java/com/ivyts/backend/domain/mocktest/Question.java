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

    public QuestionSection getSection() { return QuestionSection.valueOf(normalizeEnum(section, "mixed")); }
    public void setSection(QuestionSection section) { this.section = section.name().toLowerCase(Locale.ROOT); }
    public QuestionLevel getLevel() { return QuestionLevel.valueOf(normalizeEnum(level, "medium")); }
    public void setLevel(QuestionLevel level) { this.level = level.name().toLowerCase(Locale.ROOT); }
    private String normalizeEnum(String value, String fallback) {
        return (value == null ? fallback : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
