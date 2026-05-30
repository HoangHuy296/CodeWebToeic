package com.ivyts.backend.domain.exercise;

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
public class ExerciseTopic {

    private String id;
    private String slug;
    private String label;
    private String shortLabel;
    private String description;
    private String accent;
    private List<String> keywords = new ArrayList<>();
    private List<ExerciseTopicSection> sections = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

}
