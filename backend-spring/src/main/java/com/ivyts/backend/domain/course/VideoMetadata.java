package com.ivyts.backend.domain.course;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VideoMetadata {
    private String videoUrl;
    private String videoProvider;
    private Integer duration;
    private String thumbnail;
}
