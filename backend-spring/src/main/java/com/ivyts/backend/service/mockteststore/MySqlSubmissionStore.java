package com.ivyts.backend.service.mockteststore;

import com.ivyts.backend.domain.mocktest.SubmissionAnswer;
import com.ivyts.backend.domain.mocktest.TestSubmission;
import com.ivyts.backend.relational.mocktest.TestSubmissionAnswerEntity;
import com.ivyts.backend.relational.mocktest.TestSubmissionAnswerJpaRepository;
import com.ivyts.backend.relational.mocktest.TestSubmissionEntity;
import com.ivyts.backend.relational.mocktest.TestSubmissionJpaRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class MySqlSubmissionStore implements SubmissionStore {

    private final TestSubmissionJpaRepository submissionJpaRepository;
    private final TestSubmissionAnswerJpaRepository answerJpaRepository;

    public MySqlSubmissionStore(
        TestSubmissionJpaRepository submissionJpaRepository,
        TestSubmissionAnswerJpaRepository answerJpaRepository
    ) {
        this.submissionJpaRepository = submissionJpaRepository;
        this.answerJpaRepository = answerJpaRepository;
    }

    @Override
    @Transactional
    public TestSubmission save(TestSubmission submission) {
        String submissionId = submission.getId() == null ? UUID.randomUUID().toString().replace("-", "") : submission.getId();
        TestSubmissionEntity entity = submission.getId() == null
            ? new TestSubmissionEntity()
            : submissionJpaRepository.findById(submission.getId()).orElseGet(TestSubmissionEntity::new);

        entity.setId(submissionId);
        entity.setStudentId(submission.getStudent());
        entity.setMockTestId(submission.getMockTest());
        entity.setScore(BigDecimal.valueOf(submission.getScore()));
        entity.setTotalQuestions(submission.getTotalQuestions());
        entity.setCorrectAnswers(submission.getCorrectAnswers());
        entity.setDurationSeconds(submission.getDurationSeconds());
        entity.setSubmittedAt(submission.getSubmittedAt());
        entity.setCreatedAt(submission.getCreatedAt());
        entity.setUpdatedAt(submission.getUpdatedAt());

        TestSubmissionEntity savedEntity = submissionJpaRepository.save(entity);
        answerJpaRepository.deleteBySubmissionIdIn(List.of(savedEntity.getId()));
        for (SubmissionAnswer answer : submission.getAnswers()) {
            TestSubmissionAnswerEntity answerEntity = new TestSubmissionAnswerEntity();
            answerEntity.setSubmissionId(savedEntity.getId());
            answerEntity.setQuestionId(answer.getQuestion());
            answerEntity.setSelectedOption(answer.getSelectedOption());
            answerEntity.setCorrect(answer.isCorrect());
            answerJpaRepository.save(answerEntity);
        }

        submission.setId(savedEntity.getId());
        return submission;
    }

    @Override
    public Optional<TestSubmission> findById(String submissionId) {
        return submissionJpaRepository.findById(submissionId).map(this::toDomain);
    }

    @Override
    public List<TestSubmission> findAllOrderBySubmittedAtDesc() {
        return submissionJpaRepository.findAllByOrderBySubmittedAtDescCreatedAtDesc()
            .stream()
            .map(this::toDomain)
            .toList();
    }

    @Override
    public List<TestSubmission> findByStudentOrderBySubmittedAtDesc(String studentId) {
        return submissionJpaRepository.findByStudentIdOrderBySubmittedAtDescCreatedAtDesc(studentId)
            .stream()
            .map(this::toDomain)
            .toList();
    }

    @Override
    public List<TestSubmission> findByMockTestIdsOrderBySubmittedAtDesc(List<String> mockTestIds) {
        if (mockTestIds == null || mockTestIds.isEmpty()) {
            return List.of();
        }
        return submissionJpaRepository.findByMockTestIdInOrderBySubmittedAtDescCreatedAtDesc(mockTestIds)
            .stream()
            .map(this::toDomain)
            .toList();
    }

    @Override
    @Transactional
    public void deleteByMockTest(String mockTestId) {
        List<String> submissionIds = submissionJpaRepository.findByMockTestId(mockTestId).stream()
            .map(TestSubmissionEntity::getId)
            .toList();
        if (!submissionIds.isEmpty()) {
            answerJpaRepository.deleteBySubmissionIdIn(submissionIds);
        }
        submissionJpaRepository.deleteByMockTestId(mockTestId);
    }

    private TestSubmission toDomain(TestSubmissionEntity entity) {
        TestSubmission submission = new TestSubmission();
        submission.setId(entity.getId());
        submission.setStudent(entity.getStudentId());
        submission.setMockTest(entity.getMockTestId());
        submission.setScore(entity.getScore() == null ? 0 : entity.getScore().intValue());
        submission.setTotalQuestions(entity.getTotalQuestions());
        submission.setCorrectAnswers(entity.getCorrectAnswers());
        submission.setDurationSeconds(entity.getDurationSeconds());
        submission.setSubmittedAt(entity.getSubmittedAt());
        submission.setCreatedAt(entity.getCreatedAt() == null ? Instant.EPOCH : entity.getCreatedAt());
        submission.setUpdatedAt(entity.getUpdatedAt());

        List<SubmissionAnswer> answers = new ArrayList<>();
        for (TestSubmissionAnswerEntity answerEntity : answerJpaRepository.findBySubmissionIdOrderByIdAsc(entity.getId())) {
            SubmissionAnswer answer = new SubmissionAnswer();
            answer.setQuestion(answerEntity.getQuestionId());
            answer.setSelectedOption(answerEntity.getSelectedOption());
            answer.setCorrect(answerEntity.isCorrect());
            answers.add(answer);
        }
        submission.setAnswers(answers);
        return submission;
    }
}
