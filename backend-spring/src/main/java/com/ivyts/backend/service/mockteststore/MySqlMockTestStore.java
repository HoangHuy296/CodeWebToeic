package com.ivyts.backend.service.mockteststore;

import com.ivyts.backend.domain.mocktest.MockTest;
import com.ivyts.backend.domain.mocktest.MockTestLevel;
import com.ivyts.backend.domain.mocktest.MockTestStatus;
import com.ivyts.backend.domain.mocktest.MockTestType;
import com.ivyts.backend.relational.mocktest.MockTestEntity;
import com.ivyts.backend.relational.mocktest.MockTestJpaRepository;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class MySqlMockTestStore implements MockTestStore {

    private final MockTestJpaRepository mockTestJpaRepository;
    private final MockTestJsonCodec mockTestJsonCodec;

    public MySqlMockTestStore(MockTestJpaRepository mockTestJpaRepository, MockTestJsonCodec mockTestJsonCodec) {
        this.mockTestJpaRepository = mockTestJpaRepository;
        this.mockTestJsonCodec = mockTestJsonCodec;
    }

    @Override
    public Optional<MockTest> findById(String id) {
        return mockTestJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<MockTest> findAll() {
        return mockTestJpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public MockTest save(MockTest mockTest) {
        String mockTestId = mockTest.getId() == null ? UUID.randomUUID().toString().replace("-", "") : mockTest.getId();
        MockTestEntity entity = mockTest.getId() == null
            ? new MockTestEntity()
            : mockTestJpaRepository.findById(mockTest.getId()).orElseGet(MockTestEntity::new);

        entity.setId(mockTestId);
        entity.setCreatedById(mockTest.getCreatedBy());
        entity.setTitle(mockTest.getTitle());
        entity.setDescription(mockTest.getDescription());
        entity.setType(mockTest.getType().name().toLowerCase(Locale.ROOT).replace('_', '-'));
        entity.setLevel(mockTest.getLevel().name().toLowerCase(Locale.ROOT));
        entity.setDurationMinutes(mockTest.getDurationMinutes());
        entity.setQuestionCount(mockTest.getQuestionCount());
        entity.setStatus(mockTest.getStatus().name().toLowerCase(Locale.ROOT));
        entity.setInstructionsJson(mockTestJsonCodec.writeStringList(mockTest.getInstructions()));
        entity.setFeatured(mockTest.isFeatured());
        entity.setAssignedCourseIdsJson(mockTestJsonCodec.writeStringList(mockTest.getAssignedCourses()));
        entity.setCatalogKind(mockTest.getCatalogKind());
        entity.setExerciseTopicSlug(mockTest.getExerciseTopicSlug());
        entity.setExercisePackSlug(mockTest.getExercisePackSlug());
        entity.setCreatedAt(mockTest.getCreatedAt());
        entity.setUpdatedAt(mockTest.getUpdatedAt());

        return toDomain(mockTestJpaRepository.save(entity));
    }

    @Override
    public void delete(MockTest mockTest) {
        mockTestJpaRepository.deleteById(mockTest.getId());
    }

    private MockTest toDomain(MockTestEntity entity) {
        MockTest mockTest = new MockTest();
        mockTest.setId(entity.getId());
        mockTest.setCreatedBy(entity.getCreatedById());
        mockTest.setTitle(entity.getTitle());
        mockTest.setDescription(entity.getDescription());
        mockTest.setType(MockTestType.valueOf(entity.getType().replace('-', '_').toUpperCase(Locale.ROOT)));
        mockTest.setLevel(MockTestLevel.valueOf(entity.getLevel().toUpperCase(Locale.ROOT)));
        mockTest.setDurationMinutes(entity.getDurationMinutes());
        mockTest.setQuestionCount(entity.getQuestionCount());
        mockTest.setStatus(MockTestStatus.valueOf(entity.getStatus().replace('-', '_').toUpperCase(Locale.ROOT)));
        mockTest.setInstructions(mockTestJsonCodec.readStringList(entity.getInstructionsJson()));
        mockTest.setFeatured(entity.isFeatured());
        mockTest.setAssignedCourses(mockTestJsonCodec.readStringList(entity.getAssignedCourseIdsJson()));
        mockTest.setCatalogKind(entity.getCatalogKind());
        mockTest.setExerciseTopicSlug(entity.getExerciseTopicSlug());
        mockTest.setExercisePackSlug(entity.getExercisePackSlug());
        mockTest.setCreatedAt(entity.getCreatedAt());
        mockTest.setUpdatedAt(entity.getUpdatedAt());
        return mockTest;
    }
}
