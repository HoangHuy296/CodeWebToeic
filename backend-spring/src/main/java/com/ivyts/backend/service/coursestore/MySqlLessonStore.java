package com.ivyts.backend.service.coursestore;

import com.ivyts.backend.domain.lesson.Lesson;
import com.ivyts.backend.relational.course.LessonEntity;
import com.ivyts.backend.relational.course.LessonJpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class MySqlLessonStore implements LessonStore {

    private final LessonJpaRepository lessonJpaRepository;
    private final CourseJsonCodec courseJsonCodec;

    public MySqlLessonStore(LessonJpaRepository lessonJpaRepository, CourseJsonCodec courseJsonCodec) {
        this.lessonJpaRepository = lessonJpaRepository;
        this.courseJsonCodec = courseJsonCodec;
    }

    @Override
    public Optional<Lesson> findById(String id) {
        return lessonJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Lesson> findByCourseOrderByOrderAsc(String courseId) {
        return lessonJpaRepository.findByCourseIdOrderByLessonOrderAsc(courseId).stream().map(this::toDomain).toList();
    }

    @Override
    public boolean existsByCourseAndOrder(String courseId, int order) {
        return lessonJpaRepository.existsByCourseIdAndLessonOrder(courseId, order);
    }

    @Override
    public boolean existsByCourseAndOrderAndIdNot(String courseId, int order, String lessonId) {
        return lessonJpaRepository.existsByCourseIdAndLessonOrderAndIdNot(courseId, order, lessonId);
    }

    @Override
    public boolean existsByCourseAndSlug(String courseId, String slug) {
        return lessonJpaRepository.existsByCourseIdAndSlug(courseId, slug);
    }

    @Override
    public boolean existsByCourseAndSlugAndIdNot(String courseId, String slug, String lessonId) {
        return lessonJpaRepository.existsByCourseIdAndSlugAndIdNot(courseId, slug, lessonId);
    }

    @Override
    public Lesson save(Lesson lesson) {
        String lessonId = lesson.getId() == null ? UUID.randomUUID().toString().replace("-", "") : lesson.getId();
        LessonEntity entity = lesson.getId() == null
            ? new LessonEntity()
            : lessonJpaRepository.findById(lesson.getId()).orElseGet(LessonEntity::new);

        entity.setId(lessonId);
        entity.setCourseId(lesson.getCourse());
        entity.setTitle(lesson.getTitle());
        entity.setSlug(lesson.getSlug());
        entity.setDescription(lesson.getDescription());
        entity.setContent(lesson.getContent());
        entity.setVideoJson(courseJsonCodec.write(lesson.getVideo()));
        entity.setLessonOrder(lesson.getOrder());
        entity.setPreview(lesson.isPreview());
        entity.setMaterialsJson(courseJsonCodec.write(lesson.getMaterials()));
        entity.setCreatedAt(lesson.getCreatedAt());
        entity.setUpdatedAt(lesson.getUpdatedAt());

        return toDomain(lessonJpaRepository.save(entity));
    }

    @Override
    public void delete(Lesson lesson) {
        lessonJpaRepository.deleteById(lesson.getId());
    }

    @Override
    public void deleteByCourse(String courseId) {
        lessonJpaRepository.deleteByCourseId(courseId);
    }

    private Lesson toDomain(LessonEntity entity) {
        Lesson lesson = new Lesson();
        lesson.setId(entity.getId());
        lesson.setCourse(entity.getCourseId());
        lesson.setTitle(entity.getTitle());
        lesson.setSlug(entity.getSlug());
        lesson.setDescription(entity.getDescription());
        lesson.setContent(entity.getContent());
        lesson.setVideo(courseJsonCodec.readVideo(entity.getVideoJson()));
        lesson.setOrder(entity.getLessonOrder());
        lesson.setPreview(entity.isPreview());
        lesson.setMaterials(courseJsonCodec.readMaterials(entity.getMaterialsJson()));
        lesson.setCreatedAt(entity.getCreatedAt());
        lesson.setUpdatedAt(entity.getUpdatedAt());
        return lesson;
    }
}
