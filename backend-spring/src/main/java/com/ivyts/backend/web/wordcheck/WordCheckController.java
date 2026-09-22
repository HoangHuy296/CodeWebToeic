package com.ivyts.backend.web.wordcheck;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.wordcheck.WordCheckService;
import com.ivyts.backend.web.wordcheck.dto.SubmitWordAnswerRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * "Kiem Tra" / "On Tap": typed EN/VI drills, no sign-in required (matches the standalone
 * toeic-web app this was ported from). A learner is who they type as their name; when they
 * happen to be signed in too, the score row is also linked to their account.
 */
@Validated
@RestController
@RequestMapping("/api/word-sets")
public class WordCheckController {

    private final WordCheckService wordCheckService;
    private final RequestAuthService requestAuthService;

    public WordCheckController(WordCheckService wordCheckService, RequestAuthService requestAuthService) {
        this.wordCheckService = wordCheckService;
        this.requestAuthService = requestAuthService;
    }

    @GetMapping
    public ApiSuccessResponse<?> listSets() {
        return ApiSuccessResponse.of("Word sets fetched successfully", wordCheckService.listSets());
    }

    @GetMapping("/{setId}/questions")
    public ApiSuccessResponse<?> getQuestions(@PathVariable String setId) {
        return ApiSuccessResponse.of("Word set questions fetched successfully", wordCheckService.getQuestions(setId));
    }

    @PostMapping("/{setId}/answers")
    public ApiSuccessResponse<?> submitAnswer(
        @PathVariable String setId,
        HttpServletRequest request,
        @Valid @RequestBody SubmitWordAnswerRequest body
    ) {
        AuthUser authUser = requestAuthService.optionalUser(request);
        String sessionId = body.session() == null ? null : body.session().id();
        String sessionName = body.session() == null ? null : body.session().name();
        String sessionMode = body.session() == null ? null : body.session().mode();
        return ApiSuccessResponse.of(
            "Answer graded successfully",
            wordCheckService.gradeAnswer(
                setId,
                body.questionId(),
                body.typed() == null ? "" : body.typed(),
                sessionId,
                sessionName,
                sessionMode,
                authUser == null ? null : authUser.userId()
            )
        );
    }

    @PostMapping("/{setId}/sessions/{sessionId}/finish")
    public ApiSuccessResponse<?> finishSession(@PathVariable String setId, @PathVariable String sessionId) {
        return ApiSuccessResponse.of("Session finished successfully", wordCheckService.finishSession(setId, sessionId));
    }
}
