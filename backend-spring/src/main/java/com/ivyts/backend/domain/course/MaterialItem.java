package com.ivyts.backend.domain.course;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MaterialItem {
    private String title;
    private String fileUrl;
    private String fileType;
}
