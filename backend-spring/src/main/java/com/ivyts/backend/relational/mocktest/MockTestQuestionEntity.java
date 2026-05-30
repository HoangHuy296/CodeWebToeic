package com.ivyts.backend.relational.mocktest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "mock_test_questions")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MockTestQuestionEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "mock_test_id", length = 64, nullable = false)
    private String mockTestId;

    @Column(name = "section_name", nullable = false, length = 32)
    private String sectionName;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String prompt;

    @Column(columnDefinition = "LONGTEXT")
    private String explanation;

    @Column(name = "audio_url", columnDefinition = "TEXT")
    private String audioUrl;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(nullable = false)
    private int points;

    @Column(name = "question_order", nullable = false)
    private int questionOrder;

    @Column(name = "difficulty_level", nullable = false, length = 32)
    private String difficultyLevel;

    @Column(name = "correct_answer", nullable = false, length = 8)
    private String correctAnswer;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
