package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.course.CourseRepository;
import com.ivyts.backend.domain.enrollment.EnrollmentRepository;
import com.ivyts.backend.domain.enrollment.EnrollmentStatus;
import com.ivyts.backend.domain.mocktest.MockTest;
import com.ivyts.backend.domain.mocktest.MockTestLevel;
import com.ivyts.backend.domain.mocktest.MockTestRepository;
import com.ivyts.backend.domain.mocktest.MockTestStatus;
import com.ivyts.backend.domain.mocktest.MockTestType;
import com.ivyts.backend.domain.mocktest.Question;
import com.ivyts.backend.domain.mocktest.QuestionLevel;
import com.ivyts.backend.domain.mocktest.QuestionOption;
import com.ivyts.backend.domain.mocktest.QuestionRepository;
import com.ivyts.backend.domain.mocktest.QuestionSection;
import com.ivyts.backend.domain.mocktest.SubmissionAnswer;
import com.ivyts.backend.domain.mocktest.TestSubmission;
import com.ivyts.backend.domain.mocktest.TestSubmissionRepository;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRepository;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.web.mocktest.MockTestMapper;
import com.ivyts.backend.web.mocktest.dto.CreateMockTestRequest;
import com.ivyts.backend.web.mocktest.dto.QuestionRequest;
import com.ivyts.backend.web.mocktest.dto.SubmitMockTestRequest;
import com.ivyts.backend.web.mocktest.dto.UpdateMockTestRequest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class MockTestService {

    private final MockTestRepository mockTestRepository;
    private final QuestionRepository questionRepository;
    private final TestSubmissionRepository submissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final MockTestMapper mapper;

    public MockTestService(
        MockTestRepository mockTestRepository,
        QuestionRepository questionRepository,
        TestSubmissionRepository submissionRepository,
        EnrollmentRepository enrollmentRepository,
        CourseRepository courseRepository,
        UserRepository userRepository,
        MockTestMapper mapper
    ) {
        this.mockTestRepository = mockTestRepository;
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    public List<Map<String, Object>> listMockTests(AuthUser authUser) {
        List<MockTest> all = mockTestRepository.findAll();
        List<String> accessibleCourseIds = authUser != null && authUser.role() == UserRole.STUDENT
            ? getStudentAccessibleCourseIds(authUser.userId())
            : List.of();

        return all.stream()
            .filter(mockTest -> canViewMockTest(authUser, mockTest, accessibleCourseIds))
            .sorted((left, right) -> {
                int featureCompare = Boolean.compare(right.isFeatured(), left.isFeatured());
                if (featureCompare != 0) {
                    return featureCompare;
                }
                Instant leftCreated = left.getCreatedAt() != null ? left.getCreatedAt() : Instant.EPOCH;
                Instant rightCreated = right.getCreatedAt() != null ? right.getCreatedAt() : Instant.EPOCH;
                return rightCreated.compareTo(leftCreated);
            })
            .map(mockTest -> mapper.toMockTestView(mockTest, findUserOrThrow(mockTest.getCreatedBy()), null, false))
            .toList();
    }

    public List<Map<String, Object>> listManagedMockTests(AuthUser authUser) {
        ensureWorkspaceUser(authUser);
        return mockTestRepository.findAll().stream()
            .filter(mockTest -> authUser.role() == UserRole.ADMIN || authUser.userId().equals(mockTest.getCreatedBy()))
            .sorted((left, right) -> {
                Instant leftUpdated = left.getUpdatedAt() != null ? left.getUpdatedAt() : Instant.EPOCH;
                Instant rightUpdated = right.getUpdatedAt() != null ? right.getUpdatedAt() : Instant.EPOCH;
                return rightUpdated.compareTo(leftUpdated);
            })
            .map(mockTest -> mapper.toMockTestView(mockTest, findUserOrThrow(mockTest.getCreatedBy()), null, false))
            .toList();
    }

    public Map<String, Object> getMockTestDetail(String mockTestId, AuthUser authUser) {
        MockTest mockTest = findMockTestOrThrow(mockTestId);
        List<String> accessibleCourseIds = authUser != null && authUser.role() == UserRole.STUDENT
            ? getStudentAccessibleCourseIds(authUser.userId())
            : List.of();

        boolean isManager = authUser != null && canManageMockTest(authUser, mockTest);
        if (!isManager && !canViewMockTest(authUser, mockTest, accessibleCourseIds)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Mock test not found");
        }

        List<Question> questions = questionRepository.findByMockTestOrderByOrderAsc(mockTestId);
        return mapper.toMockTestView(mockTest, findUserOrThrow(mockTest.getCreatedBy()), questions, isManager);
    }

    public Map<String, Object> createMockTest(CreateMockTestRequest request, AuthUser authUser) {
        ensureWorkspaceUser(authUser);
        validateAssignedCourses(request.assignedCourseIds(), authUser);
        validateQuestionOrders(request.questions());

        MockTest mockTest = new MockTest();
        mockTest.setTitle(request.title().trim());
        mockTest.setDescription(request.description().trim());
        mockTest.setType(parseMockTestType(request.type()));
        mockTest.setLevel(parseMockTestLevel(request.level()));
        mockTest.setDurationMinutes(request.durationMinutes());
        mockTest.setStatus(parseMockTestStatus(request.status() == null ? "draft" : request.status()));
        mockTest.setInstructions(request.instructions() == null ? List.of() : request.instructions());
        mockTest.setFeatured(Boolean.TRUE.equals(request.isFeatured()));
        mockTest.setCreatedBy(authUser.userId());
        mockTest.setAssignedCourses(request.assignedCourseIds() == null ? List.of() : request.assignedCourseIds());
        mockTest.setQuestionCount(request.questions().size());
        mockTestRepository.save(mockTest);

        replaceQuestions(mockTest.getId(), request.questions());
        return getMockTestDetail(mockTest.getId(), authUser);
    }

    public Map<String, Object> updateMockTest(String mockTestId, UpdateMockTestRequest request, AuthUser authUser) {
        MockTest mockTest = ensureManagePermission(mockTestId, authUser);

        if (request.assignedCourseIds() != null) {
            validateAssignedCourses(request.assignedCourseIds(), authUser);
            mockTest.setAssignedCourses(request.assignedCourseIds());
        }
        if (request.title() != null) {
            mockTest.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            mockTest.setDescription(request.description().trim());
        }
        if (request.type() != null) {
            mockTest.setType(parseMockTestType(request.type()));
        }
        if (request.level() != null) {
            mockTest.setLevel(parseMockTestLevel(request.level()));
        }
        if (request.durationMinutes() != null) {
            mockTest.setDurationMinutes(request.durationMinutes());
        }
        if (request.status() != null) {
            mockTest.setStatus(parseMockTestStatus(request.status()));
        }
        if (request.instructions() != null) {
            mockTest.setInstructions(request.instructions());
        }
        if (request.isFeatured() != null) {
            mockTest.setFeatured(request.isFeatured());
        }

        if (request.questions() != null) {
            validateQuestionOrders(request.questions());
            mockTest.setQuestionCount(request.questions().size());
        }
        mockTestRepository.save(mockTest);

        if (request.questions() != null) {
            replaceQuestions(mockTestId, request.questions());
        }
        return getMockTestDetail(mockTestId, authUser);
    }

    public void deleteMockTest(String mockTestId, AuthUser authUser) {
        MockTest mockTest = ensureManagePermission(mockTestId, authUser);
        questionRepository.deleteByMockTest(mockTestId);
        submissionRepository.deleteByMockTest(mockTestId);
        mockTestRepository.delete(mockTest);
    }

    public Map<String, Object> submitMockTest(String mockTestId, SubmitMockTestRequest request, AuthUser authUser) {
        if (authUser.role() != UserRole.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only students can submit mock tests");
        }

        MockTest mockTest = findMockTestOrThrow(mockTestId);
        if (mockTest.getStatus() != MockTestStatus.PUBLISHED) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Mock test not found");
        }

        List<String> accessibleCourseIds = getStudentAccessibleCourseIds(authUser.userId());
        if (!canStudentAccessMockTest(mockTest, accessibleCourseIds)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this mock test");
        }

        List<Question> questions = questionRepository.findByMockTestOrderByOrderAsc(mockTestId);
        if (questions.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mock test has no questions");
        }

        Map<String, String> answerMap = new LinkedHashMap<>();
        request.answers().forEach(answer -> answerMap.put(answer.questionId(), answer.selectedOption()));

        List<SubmissionAnswer> gradedAnswers = new ArrayList<>();
        int totalPoints = 0;
        int earnedPoints = 0;
        int correctAnswers = 0;

        for (Question question : questions) {
            String selectedOption = answerMap.getOrDefault(question.getId(), "");
            boolean isCorrect = selectedOption.equals(question.getCorrectAnswer());
            SubmissionAnswer current = new SubmissionAnswer();
            current.setQuestion(question.getId());
            current.setSelectedOption(selectedOption);
            current.setCorrect(isCorrect);
            gradedAnswers.add(current);

            totalPoints += question.getPoints();
            if (isCorrect) {
                earnedPoints += question.getPoints();
                correctAnswers += 1;
            }
        }

        int score = totalPoints > 0 ? Math.round((earnedPoints * 100.0f) / totalPoints) : 0;

        TestSubmission submission = new TestSubmission();
        submission.setStudent(authUser.userId());
        submission.setMockTest(mockTestId);
        submission.setAnswers(gradedAnswers);
        submission.setScore(score);
        submission.setTotalQuestions(questions.size());
        submission.setCorrectAnswers(correctAnswers);
        submission.setDurationSeconds(request.durationSeconds());
        submission.setSubmittedAt(Instant.now());
        submissionRepository.save(submission);

        Map<String, Object> data = new LinkedHashMap<>(mapper.toSubmissionView(submission));
        data.put("review", questions.stream().map(question -> {
            SubmissionAnswer answer = gradedAnswers.stream()
                .filter(current -> current.getQuestion().equals(question.getId()))
                .findFirst()
                .orElse(null);
            Map<String, Object> current = new LinkedHashMap<>();
            current.put("questionId", question.getId());
            current.put("prompt", question.getPrompt());
            current.put("selectedOption", answer != null ? answer.getSelectedOption() : "");
            current.put("correctAnswer", question.getCorrectAnswer());
            current.put("isCorrect", answer != null && answer.isCorrect());
            current.put("explanation", question.getExplanation());
            current.put("points", question.getPoints());
            return current;
        }).toList());
        return data;
    }

    private boolean canViewMockTest(AuthUser authUser, MockTest mockTest, List<String> accessibleCourseIds) {
        if (authUser == null) {
            return mockTest.getStatus() == MockTestStatus.PUBLISHED && mockTest.getAssignedCourses().isEmpty();
        }
        if (authUser.role() == UserRole.ADMIN) {
            return true;
        }
        if (authUser.role() == UserRole.STUDENT) {
            return mockTest.getStatus() == MockTestStatus.PUBLISHED && canStudentAccessMockTest(mockTest, accessibleCourseIds);
        }
        if (authUser.role() == UserRole.TEACHER) {
            return (mockTest.getStatus() == MockTestStatus.PUBLISHED && mockTest.getAssignedCourses().isEmpty())
                || authUser.userId().equals(mockTest.getCreatedBy());
        }
        return false;
    }

    private boolean canStudentAccessMockTest(MockTest mockTest, List<String> accessibleCourseIds) {
        return mockTest.getAssignedCourses().isEmpty()
            || mockTest.getAssignedCourses().stream().anyMatch(accessibleCourseIds::contains);
    }

    private boolean canManageMockTest(AuthUser authUser, MockTest mockTest) {
        return authUser.role() == UserRole.ADMIN
            || (authUser.role() == UserRole.TEACHER && authUser.userId().equals(mockTest.getCreatedBy()));
    }

    private MockTest ensureManagePermission(String mockTestId, AuthUser authUser) {
        ensureWorkspaceUser(authUser);
        MockTest mockTest = findMockTestOrThrow(mockTestId);
        if (!canManageMockTest(authUser, mockTest)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to manage this mock test");
        }
        return mockTest;
    }

    private void ensureWorkspaceUser(AuthUser authUser) {
        if (authUser.role() != UserRole.ADMIN && authUser.role() != UserRole.TEACHER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admin and teacher workspaces can access this resource");
        }
    }

    private MockTest findMockTestOrThrow(String mockTestId) {
        return mockTestRepository.findById(mockTestId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Mock test not found"));
    }

    private User findUserOrThrow(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private List<String> getStudentAccessibleCourseIds(String userId) {
        return enrollmentRepository.findByStudentAndStatusInOrderByCreatedAtDesc(
                userId,
                List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED)
            )
            .stream()
            .map(enrollment -> enrollment.getCourse())
            .distinct()
            .toList();
    }

    private void validateAssignedCourses(List<String> assignedCourseIds, AuthUser authUser) {
        if (assignedCourseIds == null || assignedCourseIds.isEmpty()) {
            return;
        }

        List<Course> courses = courseRepository.findAllById(assignedCourseIds);
        if (courses.size() != assignedCourseIds.size()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Assigned courses must exist");
        }

        boolean invalid = courses.stream().anyMatch(course ->
            authUser.role() == UserRole.TEACHER && !authUser.userId().equals(course.getOwner())
        );
        if (invalid) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Assigned courses must belong to the current workspace");
        }
    }

    private void validateQuestionOrders(List<QuestionRequest> questions) {
        Set<Integer> uniqueOrders = new java.util.HashSet<>();
        for (QuestionRequest question : questions) {
            if (!uniqueOrders.add(question.order())) {
                throw new ApiException(HttpStatus.CONFLICT, "Duplicate question order: " + question.order());
            }
            boolean hasCorrect = question.options().stream().anyMatch(com.ivyts.backend.web.mocktest.dto.QuestionOptionRequest::isCorrect);
            boolean answerMatches = question.options().stream().anyMatch(option -> option.key().equals(question.correctAnswer()));
            if (!hasCorrect) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "At least one option must be marked as correct");
            }
            if (!answerMatches) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "correctAnswer must match one of the option keys");
            }
        }
    }

    private void replaceQuestions(String mockTestId, List<QuestionRequest> questions) {
        questionRepository.deleteByMockTest(mockTestId);
        List<Question> entities = questions.stream().map(request -> {
            Question question = new Question();
            question.setMockTest(mockTestId);
            question.setSection(parseQuestionSection(request.section()));
            question.setPrompt(request.prompt().trim());
            question.setExplanation(request.explanation());
            question.setOptions(request.options().stream().map(option -> {
                QuestionOption current = new QuestionOption();
                current.setKey(option.key().trim());
                current.setText(option.text().trim());
                current.setCorrect(option.isCorrect());
                return current;
            }).toList());
            question.setCorrectAnswer(request.correctAnswer().trim());
            question.setAudioUrl(request.audioUrl());
            question.setImageUrl(request.imageUrl());
            question.setPoints(request.points() == null ? 1 : request.points());
            question.setOrder(request.order());
            question.setLevel(parseQuestionLevel(request.level()));
            return question;
        }).toList();
        questionRepository.saveAll(entities);
        MockTest mockTest = findMockTestOrThrow(mockTestId);
        mockTest.setQuestionCount(entities.size());
        mockTestRepository.save(mockTest);
    }

    private MockTestType parseMockTestType(String value) {
        return MockTestType.valueOf(value.trim().replace('-', '_').toUpperCase(Locale.ROOT));
    }

    private MockTestLevel parseMockTestLevel(String value) {
        return MockTestLevel.valueOf(value.trim().replace('-', '_').toUpperCase(Locale.ROOT));
    }

    private MockTestStatus parseMockTestStatus(String value) {
        return MockTestStatus.valueOf(value.trim().replace('-', '_').toUpperCase(Locale.ROOT));
    }

    private QuestionSection parseQuestionSection(String value) {
        String normalized = value == null || value.isBlank() ? "mixed" : value;
        return QuestionSection.valueOf(normalized.trim().replace('-', '_').toUpperCase(Locale.ROOT));
    }

    private QuestionLevel parseQuestionLevel(String value) {
        String normalized = value == null || value.isBlank() ? "medium" : value;
        return QuestionLevel.valueOf(normalized.trim().replace('-', '_').toUpperCase(Locale.ROOT));
    }
}
