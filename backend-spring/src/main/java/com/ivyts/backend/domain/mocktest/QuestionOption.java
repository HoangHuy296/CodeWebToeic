package com.ivyts.backend.domain.mocktest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestionOption {

    private String key;
    private String text;
    private boolean isCorrect;
}
