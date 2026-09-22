package com.ivyts.backend.web.wordcheck.dto;

/** The practice session as the browser identifies it: a random id it made up, plus who and how. */
public record WordSessionInfo(
    String id,
    String name,
    String mode
) {
}
