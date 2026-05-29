package com.ivyts.backend.domain.exercise;

import java.util.ArrayList;
import java.util.List;

public class ExerciseTopicSection {

    private String id;
    private String title;
    private String description;
    private List<ExercisePack> packs = new ArrayList<>();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<ExercisePack> getPacks() { return packs; }
    public void setPacks(List<ExercisePack> packs) { this.packs = packs; }
}
