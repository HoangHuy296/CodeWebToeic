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

/**
 * One typed EN/VI drill item. Mirrors the "Master" sheet columns of the standalone
 * toeic-web app (EN, VI, Part, Chu de, Ghi chu, Dap an khac, Bo, Vi du EN/VI).
 */
@Entity
@Table(name = "word_items")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WordItemEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "set_name", length = 191, nullable = false)
    private String setName;

    @Column(name = "set_slug", length = 191, nullable = false)
    private String setSlug;

    @Column(length = 500, nullable = false)
    private String en;

    @Column(length = 500, nullable = false)
    private String vi;

    @Column(nullable = false)
    private String part;

    @Column(nullable = false)
    private String topic;

    @Column(columnDefinition = "TEXT")
    private String note;

    /** Other accepted English answers, separated by "|" (same convention as the source sheet). */
    @Column(name = "other_answers", columnDefinition = "TEXT")
    private String otherAnswers;

    @Column(name = "example_en", columnDefinition = "TEXT")
    private String exampleEn;

    @Column(name = "example_vi", columnDefinition = "TEXT")
    private String exampleVi;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
