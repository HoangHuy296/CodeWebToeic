package com.ivyts.backend.domain.enrollment;

import java.time.Instant;

public class LessonProgressItem {

    private String lesson;
    private int watchedSeconds;
    private boolean isCompleted;
    private Instant completedAt;
    private Instant lastAccessedAt;

    public String getLesson() { return lesson; }
    public void setLesson(String lesson) { this.lesson = lesson; }
    public int getWatchedSeconds() { return watchedSeconds; }
    public void setWatchedSeconds(int watchedSeconds) { this.watchedSeconds = watchedSeconds; }
    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Instant getLastAccessedAt() { return lastAccessedAt; }
    public void setLastAccessedAt(Instant lastAccessedAt) { this.lastAccessedAt = lastAccessedAt; }
}
