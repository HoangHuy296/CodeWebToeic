package com.ivyts.backend.domain.exercise;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExerciseTopicSection {

    private String id;
    private String title;
    private String description;
    private List<ExercisePack> packs = new ArrayList<>();
}
