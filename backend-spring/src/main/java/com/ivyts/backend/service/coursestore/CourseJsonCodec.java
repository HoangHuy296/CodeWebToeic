package com.ivyts.backend.service.coursestore;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.course.MaterialItem;
import com.ivyts.backend.domain.course.VideoMetadata;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class CourseJsonCodec {

    private final ObjectMapper objectMapper;

    public CourseJsonCodec(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String write(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize course payload");
        }
    }

    public VideoMetadata readVideo(String json) {
        return read(json, VideoMetadata.class);
    }

    public List<MaterialItem> readMaterials(String json) {
        return readList(json, new TypeReference<List<MaterialItem>>() {});
    }

    public List<String> readStringList(String json) {
        return readList(json, new TypeReference<List<String>>() {});
    }

    private <T> T read(String json, Class<T> type) {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(json, type);
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to deserialize course payload");
        }
    }

    private <T> List<T> readList(String json, TypeReference<List<T>> typeReference) {
        if (json == null || json.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(json, typeReference);
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to deserialize course list payload");
        }
    }
}
