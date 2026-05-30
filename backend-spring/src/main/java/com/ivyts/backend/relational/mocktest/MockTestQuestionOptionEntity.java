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
@Table(name = "mock_test_question_options")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MockTestQuestionOptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_id", length = 64, nullable = false)
    private String questionId;

    @Column(name = "option_key", length = 8, nullable = false)
    private String optionKey;

    @Column(name = "option_text", columnDefinition = "LONGTEXT", nullable = false)
    private String optionText;

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect;
}
