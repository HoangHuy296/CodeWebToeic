package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.enrollment.EnrollmentStatus;
import com.ivyts.backend.domain.mocktest.MockTest;
import com.ivyts.backend.domain.mocktest.MockTestLevel;
import com.ivyts.backend.domain.mocktest.MockTestStatus;
import com.ivyts.backend.domain.mocktest.MockTestType;
import com.ivyts.backend.domain.mocktest.Question;
import com.ivyts.backend.domain.mocktest.QuestionLevel;
import com.ivyts.backend.domain.mocktest.QuestionOption;
import com.ivyts.backend.domain.mocktest.QuestionSection;
import com.ivyts.backend.domain.mocktest.SubmissionAnswer;
import com.ivyts.backend.domain.mocktest.TestSubmission;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.service.exercise.ExerciseTopicService;
import com.ivyts.backend.service.coursestore.CourseStore;
import com.ivyts.backend.service.enrollmentstore.EnrollmentStore;
import com.ivyts.backend.service.mockteststore.MockTestStore;
import com.ivyts.backend.service.mockteststore.QuestionStore;
import com.ivyts.backend.service.mockteststore.SubmissionStore;
import com.ivyts.backend.service.userstore.UserStore;
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

    private final MockTestStore mockTestStore;
    private final QuestionStore questionStore;
    private final SubmissionStore submissionStore;
    private final EnrollmentStore enrollmentStore;
    private final CourseStore courseStore;
    private final UserStore userStore;
    private final MockTestMapper mapper;
    private final ExerciseTopicService exerciseTopicService;

    public MockTestService(
        MockTestStore mockTestStore,
        QuestionStore questionStore,
        SubmissionStore submissionStore,
        EnrollmentStore enrollmentStore,
        CourseStore courseStore,
        UserStore userStore,
        MockTestMapper mapper,
        ExerciseTopicService exerciseTopicService
    ) {
        this.mockTestStore = mockTestStore;
        this.questionStore = questionStore;
        this.submissionStore = submissionStore;
        this.enrollmentStore = enrollmentStore;
        this.courseStore = courseStore;
        this.userStore = userStore;
        this.mapper = mapper;
        this.exerciseTopicService = exerciseTopicService;
    }

    public List<Map<String, Object>> listMockTests(AuthUser authUser, String kind, String topicSlug, String packSlug) {
        List<MockTest> all = mockTestStore.findAll();
        List<String> accessibleCourseIds = authUser != null && authUser.role() == UserRole.STUDENT
            ? getStudentAccessibleCourseIds(authUser.userId())
            : List.of();
        String normalizedKind = normalizeCatalogKind(kind);

        return all.stream()
            .filter(mockTest -> normalizedKind.equals(mockTest.getCatalogKind()))
            .filter(mockTest -> topicSlug == null || topicSlug.isBlank() || topicSlug.equals(mockTest.getExerciseTopicSlug()))
            .filter(mockTest -> packSlug == null || packSlug.isBlank() || packSlug.equals(mockTest.getExercisePackSlug()))
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

    public List<Map<String, Object>> listExerciseItems(AuthUser authUser, String topicSlug) {
        return listMockTests(authUser, "exercise", topicSlug, null);
    }

    public List<Map<String, Object>> listManagedMockTests(AuthUser authUser, String kind) {
        ensureWorkspaceUser(authUser);
        String normalizedKind = normalizeCatalogKind(kind);
        return mockTestStore.findAll().stream()
            .filter(mockTest -> normalizedKind.equals(mockTest.getCatalogKind()))
            .filter(mockTest -> authUser.role() == UserRole.ADMIN || authUser.userId().equals(mockTest.getCreatedBy()))
            .sorted((left, right) -> {
                Instant leftUpdated = left.getUpdatedAt() != null ? left.getUpdatedAt() : Instant.EPOCH;
                Instant rightUpdated = right.getUpdatedAt() != null ? right.getUpdatedAt() : Instant.EPOCH;
                return rightUpdated.compareTo(leftUpdated);
            })
            .map(mockTest -> mapper.toMockTestView(mockTest, findUserOrThrow(mockTest.getCreatedBy()), null, false))
            .toList();
    }

    public List<Map<String, Object>> listManagedExerciseItems(AuthUser authUser) {
        return listManagedMockTests(authUser, "exercise");
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

        List<Question> questions = questionStore.findByMockTestOrderByOrderAsc(mockTestId);
        return mapper.toMockTestView(mockTest, findUserOrThrow(mockTest.getCreatedBy()), questions, isManager);
    }

    public Map<String, Object> getExerciseItemDetail(String itemId, AuthUser authUser) {
        Map<String, Object> detail = getMockTestDetail(itemId, authUser);
        MockTest mockTest = findMockTestOrThrow(itemId);
        if (!"exercise".equals(mockTest.getCatalogKind())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Exercise item not found");
        }
        return detail;
    }

    public List<Map<String, Object>> listSubmissionResults(AuthUser authUser) {
        List<TestSubmission> submissions = switch (authUser.role()) {
            case ADMIN -> submissionStore.findAllOrderBySubmittedAtDesc();
            case STUDENT -> submissionStore.findByStudentOrderBySubmittedAtDesc(authUser.userId());
            case TEACHER -> {
                List<String> managedMockTestIds = mockTestStore.findAll().stream()
                    .filter(mockTest -> authUser.userId().equals(mockTest.getCreatedBy()))
                    .map(MockTest::getId)
                    .toList();
                yield submissionStore.findByMockTestIdsOrderBySubmittedAtDesc(managedMockTestIds);
            }
        };

        return submissions.stream()
            .map(submission -> toSubmissionSummary(submission, authUser))
            .toList();
    }

    public List<Map<String, Object>> listExerciseSubmissionResults(AuthUser authUser) {
        return listSubmissionResults(authUser).stream()
            .filter(submission -> "exercise".equals(((Map<String, Object>) submission.get("mockTest")).get("catalogKind")))
            .toList();
    }

    public Map<String, Object> getSubmissionDetail(String submissionId, AuthUser authUser) {
        TestSubmission submission = submissionStore.findById(submissionId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Submission not found"));
        MockTest mockTest = findMockTestOrThrow(submission.getMockTest());
        ensureSubmissionAccess(authUser, submission, mockTest);
        return buildSubmissionDetail(submission, mockTest, authUser.role() != UserRole.STUDENT);
    }

    public Map<String, Object> getExerciseSubmissionDetail(String submissionId, AuthUser authUser) {
        Map<String, Object> detail = getSubmissionDetail(submissionId, authUser);
        @SuppressWarnings("unchecked")
        Map<String, Object> mockTest = (Map<String, Object>) detail.get("mockTest");
        if (!"exercise".equals(mockTest.get("catalogKind"))) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Exercise submission not found");
        }
        return detail;
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
        mockTest.setCatalogKind(normalizeCatalogKind(request.catalogKind()));
        mockTest.setExerciseTopicSlug(blankToNull(request.exerciseTopicSlug()));
        mockTest.setExercisePackSlug(blankToNull(request.exercisePackSlug()));
        mockTest.setQuestionCount(request.questions().size());
        validateExerciseMetadata(mockTest);
        mockTest = mockTestStore.save(mockTest);

        replaceQuestions(mockTest.getId(), request.questions());
        return getMockTestDetail(mockTest.getId(), authUser);
    }

    public Map<String, Object> createExerciseItem(CreateMockTestRequest request, AuthUser authUser) {
        CreateMockTestRequest normalized = new CreateMockTestRequest(
            request.title(),
            request.description(),
            request.type(),
            request.level(),
            request.durationMinutes(),
            request.status(),
            request.instructions(),
            request.isFeatured(),
            request.assignedCourseIds(),
            "exercise",
            request.exerciseTopicSlug(),
            request.exercisePackSlug(),
            request.questions()
        );
        return createMockTest(normalized, authUser);
    }

    public Map<String, Object> updateMockTest(String mockTestId, UpdateMockTestRequest request, AuthUser authUser) {
        MockTest mockTest = ensureManagePermission(mockTestId, authUser);

        if (request.assignedCourseIds() != null) {
            validateAssignedCourses(request.assignedCourseIds(), authUser);
            mockTest.setAssignedCourses(request.assignedCourseIds());
        }
        if (request.catalogKind() != null) {
            mockTest.setCatalogKind(normalizeCatalogKind(request.catalogKind()));
        }
        if (request.exerciseTopicSlug() != null) {
            mockTest.setExerciseTopicSlug(blankToNull(request.exerciseTopicSlug()));
        }
        if (request.exercisePackSlug() != null) {
            mockTest.setExercisePackSlug(blankToNull(request.exercisePackSlug()));
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
        validateExerciseMetadata(mockTest);
        mockTestStore.save(mockTest);

        if (request.questions() != null) {
            replaceQuestions(mockTestId, request.questions());
        }
        return getMockTestDetail(mockTestId, authUser);
    }

    public Map<String, Object> updateExerciseItem(String itemId, UpdateMockTestRequest request, AuthUser authUser) {
        UpdateMockTestRequest normalized = new UpdateMockTestRequest(
            request.title(),
            request.description(),
            request.type(),
            request.level(),
            request.durationMinutes(),
            request.status(),
            request.instructions(),
            request.isFeatured(),
            request.assignedCourseIds(),
            "exercise",
            request.exerciseTopicSlug(),
            request.exercisePackSlug(),
            request.questions()
        );
        return updateMockTest(itemId, normalized, authUser);
    }

    public void deleteMockTest(String mockTestId, AuthUser authUser) {
        MockTest mockTest = ensureManagePermission(mockTestId, authUser);
        submissionStore.deleteByMockTest(mockTestId);
        questionStore.deleteByMockTest(mockTestId);
        mockTestStore.delete(mockTest);
    }

    public void deleteExerciseItem(String itemId, AuthUser authUser) {
        MockTest mockTest = ensureManagePermission(itemId, authUser);
        if (!"exercise".equals(mockTest.getCatalogKind())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Exercise item not found");
        }
        deleteMockTest(itemId, authUser);
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

        List<Question> questions = questionStore.findByMockTestOrderByOrderAsc(mockTestId);
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
        submission.setDurationSeconds(request.durationSeconds() == null ? 0 : request.durationSeconds());
        submission.setSubmittedAt(Instant.now());
        submissionStore.save(submission);

        return buildSubmissionDetail(submission, mockTest, false);
    }

    public Map<String, Object> submitExerciseItem(String itemId, SubmitMockTestRequest request, AuthUser authUser) {
        Map<String, Object> detail = submitMockTest(itemId, request, authUser);
        MockTest mockTest = findMockTestOrThrow(itemId);
        if (!"exercise".equals(mockTest.getCatalogKind())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Exercise item not found");
        }
        return detail;
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

    private void ensureSubmissionAccess(AuthUser authUser, TestSubmission submission, MockTest mockTest) {
        if (authUser.role() == UserRole.ADMIN) {
            return;
        }
        if (authUser.role() == UserRole.STUDENT && authUser.userId().equals(submission.getStudent())) {
            return;
        }
        if (authUser.role() == UserRole.TEACHER && authUser.userId().equals(mockTest.getCreatedBy())) {
            return;
        }
        throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to view this submission");
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
        return mockTestStore.findById(mockTestId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Mock test not found"));
    }

    private User findUserOrThrow(String userId) {
        return userStore.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private List<String> getStudentAccessibleCourseIds(String userId) {
        return enrollmentStore.findByStudentAndStatusInOrderByCreatedAtDesc(
                userId,
                List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED)
            )
            .stream()
            .map(enrollment -> enrollment.getCourse())
            .distinct()
            .toList();
    }

    private Map<String, Object> toSubmissionSummary(TestSubmission submission, AuthUser authUser) {
        MockTest mockTest = findMockTestOrThrow(submission.getMockTest());
        ensureSubmissionAccess(authUser, submission, mockTest);

        User student = findUserOrThrow(submission.getStudent());
        User creator = findUserOrThrow(mockTest.getCreatedBy());
        List<Course> assignedCourses = mockTest.getAssignedCourses().isEmpty()
            ? List.of()
            : courseStore.findAllByIds(mockTest.getAssignedCourses());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", submission.getId());
        data.put("score", submission.getScore());
        data.put("totalQuestions", submission.getTotalQuestions());
        data.put("correctAnswers", submission.getCorrectAnswers());
        data.put("durationSeconds", submission.getDurationSeconds());
        data.put("submittedAt", submission.getSubmittedAt());
        data.put("sourceKind", assignedCourses.isEmpty() ? "free" : "assigned");
        data.put("student", toUserSummary(student, false));
        data.put("mockTest", toMockTestSummary(mockTest, true));
        data.put("creator", toUserSummary(creator, true));
        data.put("assignedCourses", assignedCourses.stream().map(course -> {
            User owner = findUserOrThrow(course.getOwner());
            Map<String, Object> current = new LinkedHashMap<>();
            current.put("id", course.getId());
            current.put("title", course.getTitle());
            current.put("slug", course.getSlug());
            current.put("ownerId", owner.getId());
            current.put("ownerName", owner.getFullName());
            return current;
        }).toList());
        return data;
    }

    private Map<String, Object> buildSubmissionDetail(TestSubmission submission, MockTest mockTest, boolean includeCorrectAnswer) {
        List<Question> questions = questionStore.findByMockTestOrderByOrderAsc(mockTest.getId());
        User student = findUserOrThrow(submission.getStudent());
        User creator = findUserOrThrow(mockTest.getCreatedBy());
        List<Course> assignedCourses = mockTest.getAssignedCourses().isEmpty()
            ? List.of()
            : courseStore.findAllByIds(mockTest.getAssignedCourses());

        Map<String, Object> data = new LinkedHashMap<>(mapper.toSubmissionView(submission));
        data.put("student", toUserSummary(student, false));
        data.put("mockTest", toMockTestSummary(mockTest, false));
        data.put("creator", toUserSummary(creator, true));
        data.put("assignedCourses", assignedCourses.stream().map(course -> {
            User owner = findUserOrThrow(course.getOwner());
            Map<String, Object> current = new LinkedHashMap<>();
            current.put("id", course.getId());
            current.put("title", course.getTitle());
            current.put("slug", course.getSlug());
            current.put("ownerId", owner.getId());
            current.put("ownerName", owner.getFullName());
            return current;
        }).toList());
        data.put("review", questions.stream().map(question -> {
            SubmissionAnswer answer = submission.getAnswers().stream()
                .filter(current -> current.getQuestion().equals(question.getId()))
                .findFirst()
                .orElse(null);
            Map<String, Object> current = new LinkedHashMap<>();
            current.put("questionId", question.getId());
            current.put("prompt", question.getPrompt());
            current.put("selectedOption", answer != null ? answer.getSelectedOption() : "");
            if (includeCorrectAnswer) {
                current.put("correctAnswer", question.getCorrectAnswer());
            }
            current.put("isCorrect", answer != null && answer.isCorrect());
            current.put("explanation", question.getExplanation());
            current.put("points", question.getPoints());
            return current;
        }).toList());
        return data;
    }

    private Map<String, Object> toUserSummary(User user, boolean includeRole) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", user.getId());
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());
        if (includeRole) {
            data.put("role", user.getRole().name().toLowerCase(Locale.ROOT));
        }
        return data;
    }

    private Map<String, Object> toMockTestSummary(MockTest mockTest, boolean includeStatus) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", mockTest.getId());
        data.put("title", mockTest.getTitle());
        data.put("catalogKind", mockTest.getCatalogKind());
        data.put("exerciseTopicSlug", mockTest.getExerciseTopicSlug());
        data.put("exercisePackSlug", mockTest.getExercisePackSlug());
        data.put("type", mockTest.getType().name().toLowerCase(Locale.ROOT).replace('_', '-'));
        data.put("level", mockTest.getLevel().name().toLowerCase(Locale.ROOT));
        data.put("questionCount", mockTest.getQuestionCount());
        data.put("durationMinutes", mockTest.getDurationMinutes());
        if (includeStatus) {
            data.put("status", mockTest.getStatus().name().toLowerCase(Locale.ROOT));
        }
        return data;
    }

    private void validateAssignedCourses(List<String> assignedCourseIds, AuthUser authUser) {
        if (assignedCourseIds == null || assignedCourseIds.isEmpty()) {
            return;
        }

        List<Course> courses = courseStore.findAllByIds(assignedCourseIds);
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

    private void validateExerciseMetadata(MockTest mockTest) {
        if (!"exercise".equals(mockTest.getCatalogKind())) {
            mockTest.setExerciseTopicSlug(null);
            mockTest.setExercisePackSlug(null);
            return;
        }

        if (mockTest.getExerciseTopicSlug() == null || mockTest.getExerciseTopicSlug().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Exercise topic is required for exercise items");
        }

        exerciseTopicService.findBySlug(mockTest.getExerciseTopicSlug());
        mockTest.setExercisePackSlug(blankToNull(mockTest.getExercisePackSlug()));
    }

    private String normalizeCatalogKind(String value) {
        String normalized = value == null || value.isBlank() ? "mock-test" : value.trim().toLowerCase(Locale.ROOT);
        if (!normalized.equals("mock-test") && !normalized.equals("exercise")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported catalog kind");
        }
        return normalized;
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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
        questionStore.deleteByMockTest(mockTestId);
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
        questionStore.saveAll(entities);
        MockTest mockTest = findMockTestOrThrow(mockTestId);
        mockTest.setQuestionCount(entities.size());
        mockTestStore.save(mockTest);
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
