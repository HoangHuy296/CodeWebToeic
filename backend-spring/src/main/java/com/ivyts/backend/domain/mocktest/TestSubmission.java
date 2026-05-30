package com.ivyts.backend.domain.mocktest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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
}
