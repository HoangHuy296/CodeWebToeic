package com.ivyts.backend.relational.mocktest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "test_submission_answers")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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
}
