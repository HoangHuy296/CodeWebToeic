package com.ivyts.backend.service.exercise;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.exercise.ExerciseTopicSection;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class ExerciseTopicJsonCodec {

    private static final TypeReference<List<String>> STRING_LIST_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<ExerciseTopicSection>> SECTION_LIST_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;

    public ExerciseTopicJsonCodec(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String writeStringList(List<String> items) {
        return writeValue(items == null ? List.of() : items);
    }

    public String writeSections(List<ExerciseTopicSection> sections) {
        return writeValue(sections == null ? List.of() : sections);
    }

    public List<String> readStringList(String value) {
        return readValue(value, STRING_LIST_TYPE);
    }

    public List<ExerciseTopicSection> readSections(String value) {
        return readValue(value, SECTION_LIST_TYPE);
    }

    private String writeValue(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not serialize exercise topic data");
        }
    }

    private <T> T readValue(String value, TypeReference<T> typeReference) {
        try {
            if (value == null || value.isBlank()) {
                return objectMapper.readValue("[]", typeReference);
            }
            return objectMapper.readValue(value, typeReference);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not deserialize exercise topic data");
        }
    }
}
