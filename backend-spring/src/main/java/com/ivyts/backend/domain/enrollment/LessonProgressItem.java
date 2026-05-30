package com.ivyts.backend.domain.enrollment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LessonProgressItem {

    private String lesson;
    private int watchedSeconds;
    private boolean isCompleted;
    private Instant completedAt;
    private Instant lastAccessedAt;
}
