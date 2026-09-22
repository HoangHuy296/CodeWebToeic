package com.ivyts.backend.service.wordcheck;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.relational.wordcheck.WordItemEntity;
import com.ivyts.backend.relational.wordcheck.WordItemJpaRepository;
import com.ivyts.backend.relational.wordcheck.WordItemJpaRepository.SetCount;
import com.ivyts.backend.relational.wordcheck.WordScoreEntity;
import com.ivyts.backend.relational.wordcheck.WordScoreJpaRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Word-check ("Kiem Tra" / "On Tap"): typed EN/VI drills. Grading always runs here — the
 * browser only ever sees the Vietnamese prompt, never the accepted English answers.
 *
 * Ported from the standalone toeic-web app's QuestionsService + ScoresService: a practice
 * session is a random id the browser makes up; the server tallies what it itself graded and,
 * on "finish", turns that tally into one score row. The browser never sends a score.
 */
@Service
public class WordCheckService {

    private final WordItemJpaRepository wordItemJpaRepository;
    private final WordScoreJpaRepository wordScoreJpaRepository;
    private final Map<String, TrackedSession> sessions = new ConcurrentHashMap<>();

    public WordCheckService(WordItemJpaRepository wordItemJpaRepository, WordScoreJpaRepository wordScoreJpaRepository) {
        this.wordItemJpaRepository = wordItemJpaRepository;
        this.wordScoreJpaRepository = wordScoreJpaRepository;
    }

    public List<Map<String, Object>> listSets() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (SetCount row : wordItemJpaRepository.countBySet()) {
            Map<String, Object> view = new LinkedHashMap<>();
            view.put("id", row.getSetSlug());
            view.put("setName", row.getSetName());
            view.put("itemCount", row.getItemCount());
            result.add(view);
        }
        return result;
    }

    public Map<String, Object> getQuestions(String setSlug) {
        List<WordItemEntity> items = wordItemJpaRepository.findBySetSlugOrderBySortOrderAsc(setSlug);
        if (items.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Word set not found");
        }

        Map<String, Object> set = new LinkedHashMap<>();
        set.put("id", setSlug);
        set.put("setName", items.get(0).getSetName());
        set.put("itemCount", items.size());

        List<Map<String, Object>> questions = items.stream().map(item -> {
            Map<String, Object> q = new LinkedHashMap<>();
            q.put("id", item.getId());
            q.put("vi", item.getVi());
            q.put("part", item.getPart());
            q.put("topic", item.getTopic());
            q.put("accents", WordCheckGrading.accentsOf(allAnswers(item)));
            return q;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("set", set);
        result.put("questions", questions);
        return result;
    }

    public Map<String, Object> gradeAnswer(
        String setSlug,
        String questionId,
        String typed,
        String sessionId,
        String sessionName,
        String sessionMode,
        String studentId
    ) {
        WordItemEntity item = wordItemJpaRepository.findBySetSlugOrderBySortOrderAsc(setSlug).stream()
            .filter(candidate -> candidate.getId().equals(questionId))
            .findFirst()
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found in this set"));

        List<String> answers = allAnswers(item);
        WordCheckGrading.CheckResult check = WordCheckGrading.checkAnswer(typed, answers);

        if (sessionId != null && !sessionId.isBlank()) {
            record(setSlug, sessionId, sessionName, sessionMode, studentId, questionId, check.ok());
        }

        Map<String, Object> view = new LinkedHashMap<>();
        view.put("ok", check.ok());
        view.put("matched", check.matched());
        view.put("matchedText", check.ok() ? answers.get(check.matched()) : null);
        view.put("canonical", item.getEn());
        view.put("diff", diffView(check.diff()));
        view.put("otherAnswers", !check.ok() && answers.size() > 1
            ? answers.stream().filter(a -> !a.equals(answers.get(check.bestIdx()))).toList()
            : List.of());
        view.put("imeSuspected", !check.ok() && WordCheckGrading.looksLikeVietnameseIME(typed, String.join(" ", answers)));
        view.put("example", item.getExampleEn() == null || item.getExampleEn().isBlank()
            ? null
            : Map.of("en", item.getExampleEn(), "vi", item.getExampleVi() == null ? "" : item.getExampleVi()));
        view.put("note", item.getNote() == null ? "" : item.getNote());
        return view;
    }

    @Transactional
    public Map<String, Object> finishSession(String setSlug, String sessionId) {
        TrackedSession tracked = sessions.get(sessionId);
        if (tracked == null || !tracked.setSlug.equals(setSlug) || tracked.answers.isEmpty()) {
            // The session may already be saved from an earlier call whose in-memory entry expired.
            if (wordScoreJpaRepository.existsById(sessionId)) {
                return Map.of("saved", true);
            }
            throw new ApiException(HttpStatus.NOT_FOUND, "Unknown session");
        }

        // Two "finish" calls for the same session can race in; only one may write the row.
        synchronized (tracked) {
            if (tracked.saved || wordScoreJpaRepository.existsById(sessionId)) {
                tracked.saved = true;
                return Map.of("saved", true);
            }

            List<TrackedAnswer> answers = List.copyOf(tracked.answers.values());
            int attempts = answers.stream().mapToInt(a -> a.attempts).sum();
            int rounds = answers.stream().mapToInt(a -> a.attempts).max().orElse(0);
            int firstOk = (int) answers.stream().filter(a -> a.firstOk).count();
            int seconds = (int) Math.max(0, Math.round((System.currentTimeMillis() - tracked.startedAt) / 1000.0));
            int setSize = wordItemJpaRepository.findBySetSlugOrderBySortOrderAsc(setSlug).size();

            WordScoreEntity entity = new WordScoreEntity();
            entity.setId(sessionId);
            entity.setSetName(tracked.setName);
            entity.setSetSlug(setSlug);
            entity.setStudentName(tracked.studentName);
            entity.setStudentId(tracked.studentId);
            entity.setMode(tracked.mode);
            entity.setCorrectFirstTry(firstOk);
            entity.setTotalAnswered(answers.size());
            entity.setTotalInSet(setSize);
            entity.setRounds(rounds);
            entity.setTotalAttempts(attempts);
            entity.setDurationSeconds(seconds);
            entity.setFinishedAt(Instant.now());
            try {
                wordScoreJpaRepository.saveAndFlush(entity);
            } catch (DataIntegrityViolationException alreadySaved) {
                // Lost a race with another "finish" call for this same session; that write stands.
            }
            tracked.saved = true;
            return Map.of("saved", true);
        }
    }

    private void record(
        String setSlug,
        String sessionId,
        String name,
        String mode,
        String studentId,
        String questionId,
        boolean ok
    ) {
        TrackedSession tracked = sessions.computeIfAbsent(sessionId, id -> {
            TrackedSession created = new TrackedSession();
            created.setSlug = setSlug;
            created.setName = wordItemJpaRepository.findBySetSlugOrderBySortOrderAsc(setSlug).stream()
                .findFirst().map(WordItemEntity::getSetName).orElse(setSlug);
            created.studentName = (name == null || name.isBlank()) ? "Khach" : name.trim();
            created.mode = (mode == null || mode.isBlank()) ? "extra" : mode;
            created.studentId = studentId;
            created.startedAt = System.currentTimeMillis();
            return created;
        });

        synchronized (tracked) {
            if (!tracked.setSlug.equals(setSlug) || tracked.saved) {
                return;
            }
            if (studentId != null) {
                tracked.studentId = studentId;
            }
            tracked.answers.merge(
                questionId,
                new TrackedAnswer(1, ok),
                (existing, fresh) -> new TrackedAnswer(existing.attempts + 1, existing.firstOk)
            );
        }
    }

    private List<String> allAnswers(WordItemEntity item) {
        List<String> answers = new ArrayList<>();
        answers.add(item.getEn());
        if (item.getOtherAnswers() != null && !item.getOtherAnswers().isBlank()) {
            for (String alt : item.getOtherAnswers().split("\\|")) {
                if (!alt.isBlank()) {
                    answers.add(alt.trim());
                }
            }
        }
        return answers;
    }

    private Map<String, Object> diffView(WordCheckGrading.WordDiff diff) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("typed", diff.typed().stream().map(this::diffWordView).toList());
        view.put("correct", diff.correct().stream().map(this::diffWordView).toList());
        return view;
    }

    private Map<String, Object> diffWordView(WordCheckGrading.DiffWord word) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("w", word.w());
        view.put("ok", word.ok());
        return view;
    }

    private record TrackedAnswer(int attempts, boolean firstOk) {
    }

    private static final class TrackedSession {
        String setSlug;
        String setName;
        String studentName;
        String studentId;
        String mode;
        long startedAt;
        boolean saved;
        final Map<String, TrackedAnswer> answers = new LinkedHashMap<>();
    }

    /** Generates a fresh 32-hex-char session id, matching the browser's own id format. */
    public static String newSessionId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
