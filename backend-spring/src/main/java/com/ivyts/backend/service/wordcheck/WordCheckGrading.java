package com.ivyts.backend.service.wordcheck;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Pure grading logic, ported from the standalone toeic-web app's {@code shared/logic}
 * (normalize.ts, compare.ts, ime.ts, hash.ts). Kept dependency-free and stateless so the
 * rules stay easy to compare against the original TypeScript.
 */
public final class WordCheckGrading {

    private static final Pattern CURLY_SINGLE_QUOTES = Pattern.compile("[‘’ʼ`´]");
    private static final Pattern CURLY_DOUBLE_QUOTES = Pattern.compile("[“”]");
    private static final Pattern LONG_DASHES = Pattern.compile("[–—]");
    private static final Pattern TRAILING_PUNCTUATION = Pattern.compile("[.!?]+$");
    private static final Pattern COMBINING_MARKS = Pattern.compile("\\p{M}+");
    private static final Set<Character> VIETNAMESE_LETTERS = toCharSet(
        "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ"
    );

    private WordCheckGrading() {
    }

    public static String stripAccents(String text) {
        return COMBINING_MARKS.matcher(Normalizer.normalize(text, Normalizer.Form.NFD)).replaceAll("");
    }

    public static String normalizeWord(String word) {
        String result = stripAccents(word).toLowerCase();
        result = CURLY_SINGLE_QUOTES.matcher(result).replaceAll("'");
        result = CURLY_DOUBLE_QUOTES.matcher(result).replaceAll("\"");
        result = LONG_DASHES.matcher(result).replaceAll("-");
        if (result.startsWith("e-mail")) {
            result = "email" + result.substring("e-mail".length());
        }
        return result;
    }

    public static List<String> splitWords(String sentence) {
        String trimmed = sentence.trim();
        if (trimmed.isEmpty()) {
            return List.of();
        }
        return List.of(trimmed.split("\\s+"));
    }

    public static List<String> normalizeWords(List<String> words) {
        List<String> result = new ArrayList<>(words.size());
        int last = words.size() - 1;
        for (int i = 0; i < words.size(); i++) {
            String word = i == last ? TRAILING_PUNCTUATION.matcher(words.get(i)).replaceAll("") : words.get(i);
            result.add(normalizeWord(word));
        }
        return result;
    }

    public static List<String> toTokens(String sentence) {
        return normalizeWords(splitWords(sentence));
    }

    public static boolean sameSentence(String typed, String correct) {
        return toTokens(typed).equals(toTokens(correct));
    }

    public record DiffWord(String w, boolean ok) {
    }

    public record WordDiff(List<DiffWord> typed, List<DiffWord> correct) {
    }

    /** LCS table: table[i][j] = length of the longest common subsequence of a[i..] and b[j..]. */
    private static int[][] lcsTable(List<String> a, List<String> b) {
        int[][] table = new int[a.size() + 1][b.size() + 1];
        for (int i = a.size() - 1; i >= 0; i--) {
            for (int j = b.size() - 1; j >= 0; j--) {
                table[i][j] = a.get(i).equals(b.get(j))
                    ? table[i + 1][j + 1] + 1
                    : Math.max(table[i + 1][j], table[i][j + 1]);
            }
        }
        return table;
    }

    public static WordDiff wordDiff(String typed, String correct) {
        List<String> typedWords = splitWords(typed);
        List<String> correctWords = splitWords(correct);
        List<String> a = normalizeWords(typedWords);
        List<String> b = normalizeWords(correctWords);
        int[][] table = lcsTable(a, b);

        boolean[] typedOk = new boolean[a.size()];
        boolean[] correctOk = new boolean[b.size()];
        int i = 0;
        int j = 0;
        while (i < a.size() && j < b.size()) {
            if (a.get(i).equals(b.get(j))) {
                typedOk[i] = true;
                correctOk[j] = true;
                i++;
                j++;
            } else if (table[i + 1][j] >= table[i][j + 1]) {
                i++;
            } else {
                j++;
            }
        }

        List<DiffWord> typedDiff = new ArrayList<>(typedWords.size());
        for (int k = 0; k < typedWords.size(); k++) {
            typedDiff.add(new DiffWord(typedWords.get(k), typedOk[k]));
        }
        List<DiffWord> correctDiff = new ArrayList<>(correctWords.size());
        for (int k = 0; k < correctWords.size(); k++) {
            correctDiff.add(new DiffWord(correctWords.get(k), correctOk[k]));
        }
        return new WordDiff(typedDiff, correctDiff);
    }

    private static double similarity(WordDiff diff) {
        int total = Math.max(1, diff.correct().size());
        long ok = diff.correct().stream().filter(DiffWord::ok).count();
        return (double) ok / total;
    }

    public record CheckResult(boolean ok, int matched, WordDiff diff, int bestIdx) {
    }

    /** Grades one typed answer against every accepted answer. Correct if it matches ONE of them. */
    public static CheckResult checkAnswer(String typed, List<String> answers) {
        int matched = -1;
        int bestIdx = 0;
        WordDiff bestDiff = new WordDiff(List.of(), List.of());
        double bestScore = -1;

        for (int i = 0; i < answers.size(); i++) {
            String answer = answers.get(i);
            if (matched < 0 && sameSentence(typed, answer)) {
                matched = i;
            }
            WordDiff diff = wordDiff(typed, answer);
            double score = similarity(diff);
            if (score > bestScore) {
                bestScore = score;
                bestDiff = diff;
                bestIdx = i;
            }
        }

        return new CheckResult(matched >= 0, matched, bestDiff, bestIdx);
    }

    /** Non-ASCII characters that legitimately occur in the accepted answers (e.g. "é" for résumé). */
    public static String accentsOf(List<String> answers) {
        Set<Character> chars = new LinkedHashSet<>();
        String joined = Normalizer.normalize(String.join("", answers), Normalizer.Form.NFC).toLowerCase();
        for (char ch : joined.toCharArray()) {
            if (ch > 127) {
                chars.add(ch);
            }
        }
        StringBuilder builder = new StringBuilder();
        chars.forEach(builder::append);
        return builder.toString();
    }

    /** Learner likely forgot to turn off a Vietnamese input method (typed a VN letter the answer lacks). */
    public static boolean looksLikeVietnameseIME(String typed, String correct) {
        String answer = Normalizer.normalize(correct, Normalizer.Form.NFC).toLowerCase();
        String typedNfc = Normalizer.normalize(typed, Normalizer.Form.NFC).toLowerCase();
        for (char ch : typedNfc.toCharArray()) {
            if (VIETNAMESE_LETTERS.contains(ch) && answer.indexOf(ch) < 0) {
                return true;
            }
        }
        return false;
    }

    /** djb2 hash, base36 — matches the browser's `hashId` so ids stay stable if ever re-synced from a sheet. */
    public static String hashId(String text) {
        int hash = 5381;
        for (int i = 0; i < text.length(); i++) {
            hash = (hash * 33) + text.charAt(i);
        }
        return Long.toString(Integer.toUnsignedLong(hash), 36);
    }

    private static Set<Character> toCharSet(String letters) {
        Set<Character> set = new LinkedHashSet<>();
        for (char ch : letters.toCharArray()) {
            set.add(ch);
        }
        return set;
    }
}
