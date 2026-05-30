package com.ivyts.backend.domain.lesson;

import com.ivyts.backend.domain.course.MaterialItem;
import com.ivyts.backend.domain.course.VideoMetadata;
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
public class Lesson {

    private String id;
    private String course;
    private String title;
    private String slug;
    private String description;
    private String content;
    private VideoMetadata video;
    private int order;
    private boolean isPreview;
    private List<MaterialItem> materials = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
}
