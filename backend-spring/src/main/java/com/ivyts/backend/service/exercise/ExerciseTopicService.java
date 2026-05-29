package com.ivyts.backend.service.exercise;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.exercise.ExercisePack;
import com.ivyts.backend.domain.exercise.ExerciseTopic;
import com.ivyts.backend.domain.exercise.ExerciseTopicSection;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.relational.exercise.ExerciseTopicEntity;
import com.ivyts.backend.relational.exercise.ExerciseTopicJpaRepository;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.util.SlugUtils;
import com.ivyts.backend.web.exercise.dto.ExercisePackRequest;
import com.ivyts.backend.web.exercise.dto.ExerciseTopicRequest;
import com.ivyts.backend.web.exercise.dto.ExerciseTopicSectionRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ExerciseTopicService {

    private final ExerciseTopicJpaRepository exerciseTopicJpaRepository;
    private final ExerciseTopicJsonCodec codec;

    public ExerciseTopicService(ExerciseTopicJpaRepository exerciseTopicJpaRepository, ExerciseTopicJsonCodec codec) {
        this.exerciseTopicJpaRepository = exerciseTopicJpaRepository;
        this.codec = codec;
    }

    public List<Map<String, Object>> listTopics() {
        return exerciseTopicJpaRepository.findAll().stream()
            .map(this::toDomain)
            .sorted((left, right) -> left.getLabel().compareToIgnoreCase(right.getLabel()))
            .map(this::toView)
            .toList();
    }

    public Map<String, Object> getTopicBySlug(String slug) {
        return toView(findBySlug(slug));
    }

    public Map<String, Object> createTopic(ExerciseTopicRequest request, AuthUser authUser) {
        ensureAdmin(authUser);
        String slug = SlugUtils.toSlug(request.slug() == null || request.slug().isBlank() ? request.label() : request.slug());
        ensureUniqueSlug(slug, null);

        ExerciseTopicEntity entity = new ExerciseTopicEntity();
        entity.setId(UUID.randomUUID().toString().replace("-", ""));
        apply(entity, request, slug);
        return toView(toDomain(exerciseTopicJpaRepository.save(entity)));
    }

    public Map<String, Object> updateTopic(String id, ExerciseTopicRequest request, AuthUser authUser) {
        ensureAdmin(authUser);
        ExerciseTopicEntity entity = exerciseTopicJpaRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Exercise topic not found"));
        String slug = SlugUtils.toSlug(request.slug() == null || request.slug().isBlank() ? request.label() : request.slug());
        ensureUniqueSlug(slug, id);
        apply(entity, request, slug);
        return toView(toDomain(exerciseTopicJpaRepository.save(entity)));
    }

    public Map<String, Object> deleteTopic(String id, AuthUser authUser) {
        ensureAdmin(authUser);
        ExerciseTopicEntity entity = exerciseTopicJpaRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Exercise topic not found"));
        exerciseTopicJpaRepository.delete(entity);
        return Map.of();
    }

    public ExerciseTopic findBySlug(String slug) {
        return exerciseTopicJpaRepository.findBySlug(slug)
            .map(this::toDomain)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Exercise topic not found"));
    }

    public void ensurePackExists(String topicSlug, String packSlug) {
        ExerciseTopic topic = findBySlug(topicSlug);
        boolean found = topic.getSections().stream()
            .flatMap(section -> section.getPacks().stream())
            .anyMatch(pack -> pack.getSlug().equals(packSlug));
        if (!found) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Exercise pack not found in the selected topic");
        }
    }

    private void apply(ExerciseTopicEntity entity, ExerciseTopicRequest request, String slug) {
        entity.setSlug(slug);
        entity.setLabel(request.label().trim());
        entity.setShortLabel(request.shortLabel().trim());
        entity.setDescription(request.description().trim());
        entity.setAccent(request.accent().trim());
        entity.setKeywordsJson(codec.writeStringList(request.keywords()));
        entity.setSectionsJson(codec.writeSections(
            request.sections() == null ? List.of() : request.sections().stream().map(this::toSection).toList()
        ));
    }

    private ExerciseTopicSection toSection(ExerciseTopicSectionRequest request) {
        ExerciseTopicSection section = new ExerciseTopicSection();
        section.setId(request.id().trim());
        section.setTitle(request.title().trim());
        section.setDescription(request.description().trim());
        section.setPacks(request.packs() == null ? List.of() : request.packs().stream().map(this::toPack).toList());
        return section;
    }

    private ExercisePack toPack(ExercisePackRequest request) {
        ExercisePack pack = new ExercisePack();
        pack.setSlug(request.slug().trim());
        pack.setTitle(request.title().trim());
        pack.setSummary(request.summary().trim());
        return pack;
    }

    private ExerciseTopic toDomain(ExerciseTopicEntity entity) {
        ExerciseTopic topic = new ExerciseTopic();
        topic.setId(entity.getId());
        topic.setSlug(entity.getSlug());
        topic.setLabel(entity.getLabel());
        topic.setShortLabel(entity.getShortLabel());
        topic.setDescription(entity.getDescription());
        topic.setAccent(entity.getAccent());
        topic.setKeywords(codec.readStringList(entity.getKeywordsJson()));
        topic.setSections(codec.readSections(entity.getSectionsJson()));
        topic.setCreatedAt(entity.getCreatedAt());
        topic.setUpdatedAt(entity.getUpdatedAt());
        return topic;
    }

    private Map<String, Object> toView(ExerciseTopic topic) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", topic.getId());
        data.put("slug", topic.getSlug());
        data.put("label", topic.getLabel());
        data.put("shortLabel", topic.getShortLabel());
        data.put("description", topic.getDescription());
        data.put("accent", topic.getAccent());
        data.put("keywords", topic.getKeywords());
        data.put("sections", topic.getSections().stream().map(section -> {
            Map<String, Object> current = new LinkedHashMap<>();
            current.put("id", section.getId());
            current.put("title", section.getTitle());
            current.put("description", section.getDescription());
            current.put("packs", section.getPacks().stream().map(pack -> {
                Map<String, Object> packView = new LinkedHashMap<>();
                packView.put("slug", pack.getSlug());
                packView.put("title", pack.getTitle());
                packView.put("summary", pack.getSummary());
                return packView;
            }).toList());
            return current;
        }).toList());
        return data;
    }

    private void ensureUniqueSlug(String slug, String excludeId) {
        exerciseTopicJpaRepository.findBySlug(slug).ifPresent(existing -> {
            if (excludeId == null || !excludeId.equals(existing.getId())) {
                throw new ApiException(HttpStatus.CONFLICT, "Exercise topic slug already exists");
            }
        });
    }

    private void ensureAdmin(AuthUser authUser) {
        if (authUser == null || authUser.role() != UserRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
    }
}
