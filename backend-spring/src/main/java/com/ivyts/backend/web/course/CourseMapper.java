package com.ivyts.backend.web.course;

import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.lesson.Lesson;
import com.ivyts.backend.domain.user.User;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public Map<String, Object> toLessonView(Lesson lesson) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", lesson.getId());
        data.put("course", lesson.getCourse());
        data.put("title", lesson.getTitle());
        data.put("slug", lesson.getSlug());
        data.put("description", lesson.getDescription());
        data.put("content", lesson.getContent());
        data.put("video", lesson.getVideo());
        data.put("order", lesson.getOrder());
        data.put("isPreview", lesson.isPreview());
        data.put("materials", lesson.getMaterials());
        return data;
    }

    public Map<String, Object> toCourseView(Course course, User owner, List<Lesson> lessons) {
        Map<String, Object> ownerView = new LinkedHashMap<>();
        ownerView.put("id", owner.getId());
        ownerView.put("fullName", owner.getFullName());
        ownerView.put("email", owner.getEmail());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", course.getId());
        data.put("title", course.getTitle());
        data.put("slug", course.getSlug());
        data.put("shortDescription", course.getShortDescription());
        data.put("description", course.getDescription());
        data.put("category", course.getCategory());
        data.put("level", course.getLevel().name().toLowerCase());
        data.put("price", course.getPrice());
        data.put("salePrice", course.getSalePrice());
        data.put("thumbnail", course.getThumbnail());
        data.put("introVideo", course.getIntroVideo());
        data.put("materials", course.getMaterials());
        data.put("owner", ownerView);
        data.put("lessonCount", course.getLessonCount());
        data.put("totalDuration", course.getTotalDuration());
        data.put("tags", course.getTags());
        data.put("benefits", course.getBenefits());
        data.put("isPublished", course.isPublished());
        data.put("reviewStatus", course.getReviewStatus().name().toLowerCase());
        data.put("reviewNote", course.getReviewNote());
        data.put("publishedAt", course.getPublishedAt());
        data.put("lessons", lessons == null ? null : lessons.stream().map(this::toLessonView).toList());
        return data;
    }
}
