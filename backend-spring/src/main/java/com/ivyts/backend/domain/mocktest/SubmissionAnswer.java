package com.ivyts.backend.domain.mocktest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionAnswer {

    private String question;
    private String selectedOption;
    private boolean isCorrect;
}
