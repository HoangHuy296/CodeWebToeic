package com.ivyts.backend.domain.mocktest;

public class SubmissionAnswer {

    private String question;
    private String selectedOption;
    private boolean isCorrect;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getSelectedOption() { return selectedOption; }
    public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }
    public boolean isCorrect() { return isCorrect; }
    public void setCorrect(boolean correct) { isCorrect = correct; }
}
