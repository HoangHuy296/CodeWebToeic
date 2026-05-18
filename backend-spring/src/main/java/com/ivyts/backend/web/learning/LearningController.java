package com.ivyts.backend.web.learning;

import com.ivyts.backend.web.shared.MigrationPlaceholderController;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/learning")
public class LearningController extends MigrationPlaceholderController {

    @GetMapping("/{courseId}")
    public Object getLearningPayload(@PathVariable String courseId) {
        return notImplemented("learning.detail");
    }
}
