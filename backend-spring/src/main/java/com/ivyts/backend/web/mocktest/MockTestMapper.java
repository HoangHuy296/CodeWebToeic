package com.ivyts.backend.web.mocktest;

import com.ivyts.backend.domain.mocktest.Question;
import com.ivyts.backend.domain.mocktest.TestSubmission;
import com.ivyts.backend.domain.user.User;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class MockTestMapper {

    public Map<String, Object> toMockTestView(
        com.ivyts.backend.domain.mocktest.MockTest mockTest,
        User creator,
        List<Question> questions,
        boolean includeAnswers
    ) {
        Map<String, Object> creatorView = new LinkedHashMap<>();
        creatorView.put("id", creator.getId());
        creatorView.put("fullName", creator.getFullName());
        creatorView.put("email", creator.getEmail());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", mockTest.getId());
        data.put("title", mockTest.getTitle());
        data.put("description", mockTest.getDescription());
        data.put("type", mockTest.getType().name().toLowerCase().replace('_', '-'));
        data.put("level", mockTest.getLevel().name().toLowerCase());
        data.put("durationMinutes", mockTest.getDurationMinutes());
        data.put("questionCount", mockTest.getQuestionCount());
        data.put("status", mockTest.getStatus().name().toLowerCase());
        data.put("instructions", mockTest.getInstructions());
        data.put("createdBy", creatorView);
        data.put("isFeatured", mockTest.isFeatured());
        data.put("assignedCourseIds", mockTest.getAssignedCourses());
        data.put("catalogKind", mockTest.getCatalogKind());
        data.put("exerciseTopicSlug", mockTest.getExerciseTopicSlug());
        data.put("exercisePackSlug", mockTest.getExercisePackSlug());
        data.put("questions", questions == null ? null : questions.stream().map(question -> toQuestionView(question, includeAnswers)).toList());
        return data;
    }

    public Map<String, Object> toQuestionView(Question question, boolean includeAnswers) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", question.getId());
        data.put("section", question.getSection().name().toLowerCase());
        data.put("prompt", question.getPrompt());
        data.put("options", question.getOptions().stream().map(option -> {
            Map<String, Object> current = new LinkedHashMap<>();
            current.put("key", option.getKey());
            current.put("text", option.getText());
            if (includeAnswers) {
                current.put("isCorrect", option.isCorrect());
            }
            return current;
        }).toList());
        if (includeAnswers) {
            data.put("explanation", question.getExplanation());
            data.put("correctAnswer", question.getCorrectAnswer());
        }
        data.put("audioUrl", question.getAudioUrl());
        data.put("imageUrl", question.getImageUrl());
        data.put("points", question.getPoints());
        data.put("order", question.getOrder());
        data.put("level", question.getLevel().name().toLowerCase());
        return data;
    }

    public Map<String, Object> toSubmissionView(TestSubmission submission) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", submission.getId());
        data.put("studentId", submission.getStudent());
        data.put("mockTestId", submission.getMockTest());
        data.put("answers", submission.getAnswers().stream().map(answer -> {
            Map<String, Object> current = new LinkedHashMap<>();
            current.put("questionId", answer.getQuestion());
            current.put("selectedOption", answer.getSelectedOption());
            current.put("isCorrect", answer.isCorrect());
            return current;
        }).toList());
        data.put("score", submission.getScore());
        data.put("totalQuestions", submission.getTotalQuestions());
        data.put("correctAnswers", submission.getCorrectAnswers());
        data.put("durationSeconds", submission.getDurationSeconds());
        data.put("submittedAt", submission.getSubmittedAt());
        return data;
    }
}
