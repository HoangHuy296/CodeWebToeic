package com.ivyts.backend.relational.mocktest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "test_submission_answers")
public class TestSubmissionAnswerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_id", length = 64, nullable = false)
    private String submissionId;

    @Column(name = "question_id", length = 64, nullable = false)
    private String questionId;

    @Column(name = "selected_option", length = 8)
    private String selectedOption;

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubmissionId() { return submissionId; }
    public void setSubmissionId(String submissionId) { this.submissionId = submissionId; }
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    public String getSelectedOption() { return selectedOption; }
    public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }
    public boolean isCorrect() { return isCorrect; }
    public void setCorrect(boolean correct) { isCorrect = correct; }
}
