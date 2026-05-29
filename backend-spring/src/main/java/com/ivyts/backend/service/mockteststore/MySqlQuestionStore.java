package com.ivyts.backend.service.mockteststore;

import com.ivyts.backend.domain.mocktest.Question;
import com.ivyts.backend.domain.mocktest.QuestionLevel;
import com.ivyts.backend.domain.mocktest.QuestionOption;
import com.ivyts.backend.domain.mocktest.QuestionSection;
import com.ivyts.backend.relational.mocktest.MockTestQuestionEntity;
import com.ivyts.backend.relational.mocktest.MockTestQuestionJpaRepository;
import com.ivyts.backend.relational.mocktest.MockTestQuestionOptionEntity;
import com.ivyts.backend.relational.mocktest.MockTestQuestionOptionJpaRepository;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class MySqlQuestionStore implements QuestionStore {

    private final MockTestQuestionJpaRepository questionJpaRepository;
    private final MockTestQuestionOptionJpaRepository optionJpaRepository;

    public MySqlQuestionStore(
        MockTestQuestionJpaRepository questionJpaRepository,
        MockTestQuestionOptionJpaRepository optionJpaRepository
    ) {
        this.questionJpaRepository = questionJpaRepository;
        this.optionJpaRepository = optionJpaRepository;
    }

    @Override
    public List<Question> findByMockTestOrderByOrderAsc(String mockTestId) {
        List<MockTestQuestionEntity> entities = questionJpaRepository.findByMockTestIdOrderByQuestionOrderAsc(mockTestId);
        List<String> questionIds = entities.stream().map(MockTestQuestionEntity::getId).toList();
        Map<String, List<MockTestQuestionOptionEntity>> optionsByQuestionId = questionIds.isEmpty()
            ? Map.of()
            : optionJpaRepository.findByQuestionIdInOrderByIdAsc(questionIds).stream()
                .collect(Collectors.groupingBy(MockTestQuestionOptionEntity::getQuestionId));

        return entities.stream()
            .map(entity -> toDomain(entity, optionsByQuestionId.getOrDefault(entity.getId(), List.of())))
            .toList();
    }

    @Override
    @Transactional
    public List<Question> saveAll(List<Question> questions) {
        for (Question question : questions) {
            String questionId = question.getId() == null ? UUID.randomUUID().toString().replace("-", "") : question.getId();
            MockTestQuestionEntity entity = question.getId() == null
                ? new MockTestQuestionEntity()
                : questionJpaRepository.findById(question.getId()).orElseGet(MockTestQuestionEntity::new);

            entity.setId(questionId);
            entity.setMockTestId(question.getMockTest());
            entity.setSectionName(question.getSection().name().toLowerCase(Locale.ROOT));
            entity.setPrompt(question.getPrompt());
            entity.setExplanation(question.getExplanation());
            entity.setAudioUrl(question.getAudioUrl());
            entity.setImageUrl(question.getImageUrl());
            entity.setPoints(question.getPoints());
            entity.setQuestionOrder(question.getOrder());
            entity.setDifficultyLevel(question.getLevel().name().toLowerCase(Locale.ROOT));
            entity.setCorrectAnswer(question.getCorrectAnswer());
            entity.setCreatedAt(question.getCreatedAt());
            entity.setUpdatedAt(question.getUpdatedAt());

            MockTestQuestionEntity savedEntity = questionJpaRepository.save(entity);
            question.setId(savedEntity.getId());

            optionJpaRepository.deleteByQuestionIdIn(List.of(savedEntity.getId()));
            for (QuestionOption option : question.getOptions()) {
                MockTestQuestionOptionEntity optionEntity = new MockTestQuestionOptionEntity();
                optionEntity.setQuestionId(savedEntity.getId());
                optionEntity.setOptionKey(option.getKey());
                optionEntity.setOptionText(option.getText());
                optionEntity.setCorrect(option.isCorrect());
                optionJpaRepository.save(optionEntity);
            }
        }
        return questions;
    }

    @Override
    @Transactional
    public void deleteByMockTest(String mockTestId) {
        List<String> questionIds = questionJpaRepository.findByMockTestIdOrderByQuestionOrderAsc(mockTestId)
            .stream()
            .map(MockTestQuestionEntity::getId)
            .toList();
        if (!questionIds.isEmpty()) {
            optionJpaRepository.deleteByQuestionIdIn(questionIds);
        }
        questionJpaRepository.deleteByMockTestId(mockTestId);
    }

    private Question toDomain(MockTestQuestionEntity entity, List<MockTestQuestionOptionEntity> optionEntities) {
        Question question = new Question();
        question.setId(entity.getId());
        question.setMockTest(entity.getMockTestId());
        question.setSection(QuestionSection.valueOf(entity.getSectionName().replace('-', '_').toUpperCase(Locale.ROOT)));
        question.setPrompt(entity.getPrompt());
        question.setExplanation(entity.getExplanation());
        question.setOptions(optionEntities.stream().map(this::toOption).toList());
        question.setCorrectAnswer(entity.getCorrectAnswer());
        question.setAudioUrl(entity.getAudioUrl());
        question.setImageUrl(entity.getImageUrl());
        question.setPoints(entity.getPoints());
        question.setOrder(entity.getQuestionOrder());
        question.setLevel(QuestionLevel.valueOf(entity.getDifficultyLevel().replace('-', '_').toUpperCase(Locale.ROOT)));
        question.setCreatedAt(entity.getCreatedAt());
        question.setUpdatedAt(entity.getUpdatedAt());
        return question;
    }

    private QuestionOption toOption(MockTestQuestionOptionEntity entity) {
        QuestionOption option = new QuestionOption();
        option.setKey(entity.getOptionKey());
        option.setText(entity.getOptionText());
        option.setCorrect(entity.isCorrect());
        return option;
    }
}
