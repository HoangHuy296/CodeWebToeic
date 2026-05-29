package com.ivyts.backend.service.coursestore;

import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.course.CourseLevel;
import com.ivyts.backend.domain.course.CourseReviewStatus;
import com.ivyts.backend.relational.course.CourseEntity;
import com.ivyts.backend.relational.course.CourseJpaRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class MySqlCourseStore implements CourseStore {

    private final CourseJpaRepository courseJpaRepository;
    private final CourseJsonCodec courseJsonCodec;

    public MySqlCourseStore(CourseJpaRepository courseJpaRepository, CourseJsonCodec courseJsonCodec) {
        this.courseJpaRepository = courseJpaRepository;
        this.courseJsonCodec = courseJsonCodec;
    }

    @Override
    public Optional<Course> findById(String id) {
        return courseJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Course> findBySlug(String slug) {
        return courseJpaRepository.findBySlug(slug).map(this::toDomain);
    }

    @Override
    public List<Course> findAll() {
        return courseJpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Course> findAllByIds(List<String> ids) {
        return courseJpaRepository.findAllById(ids).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Course> findPublished() {
        return courseJpaRepository.findByIsPublishedTrue().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Course> findByOwner(String ownerId) {
        return courseJpaRepository.findByOwnerId(ownerId).stream().map(this::toDomain).toList();
    }

    @Override
    public Course save(Course course) {
        String courseId = course.getId() == null ? UUID.randomUUID().toString().replace("-", "") : course.getId();
        CourseEntity entity = course.getId() == null
            ? new CourseEntity()
            : courseJpaRepository.findById(course.getId()).orElseGet(CourseEntity::new);

        entity.setId(courseId);
        entity.setOwnerId(course.getOwner());
        entity.setTitle(course.getTitle());
        entity.setSlug(course.getSlug());
        entity.setShortDescription(course.getShortDescription());
        entity.setDescription(course.getDescription());
        entity.setCategory(course.getCategory());
        entity.setLevel(course.getLevel().name().toLowerCase());
        entity.setPrice(BigDecimal.valueOf(course.getPrice()));
        entity.setSalePrice(course.getSalePrice() == null ? null : BigDecimal.valueOf(course.getSalePrice()));
        entity.setThumbnail(course.getThumbnail());
        entity.setIntroVideoJson(courseJsonCodec.write(course.getIntroVideo()));
        entity.setMaterialsJson(courseJsonCodec.write(course.getMaterials()));
        entity.setLessonCount(course.getLessonCount());
        entity.setTotalDuration(course.getTotalDuration());
        entity.setTagsJson(courseJsonCodec.write(course.getTags()));
        entity.setBenefitsJson(courseJsonCodec.write(course.getBenefits()));
        entity.setPublished(course.isPublished());
        entity.setReviewStatus(course.getReviewStatus().name().toLowerCase());
        entity.setReviewNote(course.getReviewNote());
        entity.setPublishedAt(course.getPublishedAt());
        entity.setCreatedAt(course.getCreatedAt());
        entity.setUpdatedAt(course.getUpdatedAt());

        return toDomain(courseJpaRepository.save(entity));
    }

    @Override
    public void delete(Course course) {
        courseJpaRepository.deleteById(course.getId());
    }

    private Course toDomain(CourseEntity entity) {
        Course course = new Course();
        course.setId(entity.getId());
        course.setOwner(entity.getOwnerId());
        course.setTitle(entity.getTitle());
        course.setSlug(entity.getSlug());
        course.setShortDescription(entity.getShortDescription());
        course.setDescription(entity.getDescription());
        course.setCategory(entity.getCategory());
        course.setLevel(CourseLevel.valueOf(entity.getLevel().toUpperCase()));
        course.setPrice(entity.getPrice() == null ? 0 : entity.getPrice().doubleValue());
        course.setSalePrice(entity.getSalePrice() == null ? null : entity.getSalePrice().doubleValue());
        course.setThumbnail(entity.getThumbnail());
        course.setIntroVideo(courseJsonCodec.readVideo(entity.getIntroVideoJson()));
        course.setMaterials(courseJsonCodec.readMaterials(entity.getMaterialsJson()));
        course.setLessonCount(entity.getLessonCount());
        course.setTotalDuration(entity.getTotalDuration());
        course.setTags(courseJsonCodec.readStringList(entity.getTagsJson()));
        course.setBenefits(courseJsonCodec.readStringList(entity.getBenefitsJson()));
        course.setPublished(entity.isPublished());
        course.setReviewStatus(CourseReviewStatus.valueOf(entity.getReviewStatus().replace('-', '_').toUpperCase()));
        course.setReviewNote(entity.getReviewNote());
        course.setPublishedAt(entity.getPublishedAt());
        course.setCreatedAt(entity.getCreatedAt());
        course.setUpdatedAt(entity.getUpdatedAt());
        return course;
    }
}
