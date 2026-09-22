package com.ivyts.backend.relational.wordcheck;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** One finished word-check session. `id` is the session id the browser made up (32 hex chars). */
@Entity
@Table(name = "word_scores")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WordScoreEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "set_name", length = 191, nullable = false)
    private String setName;

    @Column(name = "set_slug", length = 191, nullable = false)
    private String setSlug;

    @Column(name = "student_name", length = 191, nullable = false)
    private String studentName;

    @Column(name = "student_id", length = 64)
    private String studentId;

    @Column(nullable = false, length = 32)
    private String mode;

    @Column(name = "correct_first_try", nullable = false)
    private int correctFirstTry;

    @Column(name = "total_answered", nullable = false)
    private int totalAnswered;

    @Column(name = "total_in_set", nullable = false)
    private int totalInSet;

    @Column(nullable = false)
    private int rounds;

    @Column(name = "total_attempts", nullable = false)
    private int totalAttempts;

    @Column(name = "duration_seconds", nullable = false)
    private int durationSeconds;

    @Column(name = "finished_at")
    private Instant finishedAt;
}
