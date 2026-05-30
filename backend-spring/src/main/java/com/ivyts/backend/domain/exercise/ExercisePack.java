package com.ivyts.backend.domain.exercise;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ExercisePack {

    private String slug;
    private String title;
    private String summary;
}
