package com.ivyts.backend.config;

import com.ivyts.backend.domain.course.CourseLevel;
import com.ivyts.backend.domain.course.CourseReviewStatus;
import com.ivyts.backend.domain.enrollment.EnrollmentStatus;
import com.ivyts.backend.domain.message.MessageStatus;
import com.ivyts.backend.domain.message.MessageType;
import com.ivyts.backend.domain.mocktest.MockTestLevel;
import com.ivyts.backend.domain.mocktest.MockTestStatus;
import com.ivyts.backend.domain.mocktest.MockTestType;
import com.ivyts.backend.domain.user.UserRole;
import java.util.List;
import java.util.Locale;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

@Configuration
public class MongoConfig {

    @Bean
    MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(
            new StringToUserRoleConverter(),
            new UserRoleToStringConverter(),
            new StringToCourseLevelConverter(),
            new CourseLevelToStringConverter(),
            new StringToCourseReviewStatusConverter(),
            new CourseReviewStatusToStringConverter(),
            new StringToEnrollmentStatusConverter(),
            new EnrollmentStatusToStringConverter(),
            new StringToMockTestLevelConverter(),
            new MockTestLevelToStringConverter(),
            new StringToMockTestStatusConverter(),
            new MockTestStatusToStringConverter(),
            new StringToMockTestTypeConverter(),
            new MockTestTypeToStringConverter(),
            new StringToMessageStatusConverter(),
            new MessageStatusToStringConverter(),
            new StringToMessageTypeConverter(),
            new MessageTypeToStringConverter()
        ));
    }

    @ReadingConverter
    static class StringToUserRoleConverter implements Converter<String, UserRole> {
        @Override public UserRole convert(String source) { return UserRole.valueOf(normalize(source)); }
    }

    @WritingConverter
    static class UserRoleToStringConverter implements Converter<UserRole, String> {
        @Override public String convert(UserRole source) { return lower(source); }
    }

    @ReadingConverter
    static class StringToCourseLevelConverter implements Converter<String, CourseLevel> {
        @Override public CourseLevel convert(String source) { return CourseLevel.valueOf(normalize(source)); }
    }

    @WritingConverter
    static class CourseLevelToStringConverter implements Converter<CourseLevel, String> {
        @Override public String convert(CourseLevel source) { return lower(source); }
    }

    @ReadingConverter
    static class StringToCourseReviewStatusConverter implements Converter<String, CourseReviewStatus> {
        @Override public CourseReviewStatus convert(String source) { return CourseReviewStatus.valueOf(normalize(source)); }
    }

    @WritingConverter
    static class CourseReviewStatusToStringConverter implements Converter<CourseReviewStatus, String> {
        @Override public String convert(CourseReviewStatus source) { return snake(source); }
    }

    @ReadingConverter
    static class StringToEnrollmentStatusConverter implements Converter<String, EnrollmentStatus> {
        @Override public EnrollmentStatus convert(String source) { return EnrollmentStatus.valueOf(normalize(source)); }
    }

    @WritingConverter
    static class EnrollmentStatusToStringConverter implements Converter<EnrollmentStatus, String> {
        @Override public String convert(EnrollmentStatus source) { return lower(source); }
    }

    @ReadingConverter
    static class StringToMockTestLevelConverter implements Converter<String, MockTestLevel> {
        @Override public MockTestLevel convert(String source) { return MockTestLevel.valueOf(normalize(source)); }
    }

    @WritingConverter
    static class MockTestLevelToStringConverter implements Converter<MockTestLevel, String> {
        @Override public String convert(MockTestLevel source) { return lower(source); }
    }

    @ReadingConverter
    static class StringToMockTestStatusConverter implements Converter<String, MockTestStatus> {
        @Override public MockTestStatus convert(String source) { return MockTestStatus.valueOf(normalize(source)); }
    }

    @WritingConverter
    static class MockTestStatusToStringConverter implements Converter<MockTestStatus, String> {
        @Override public String convert(MockTestStatus source) { return lower(source); }
    }

    @ReadingConverter
    static class StringToMockTestTypeConverter implements Converter<String, MockTestType> {
        @Override public MockTestType convert(String source) { return MockTestType.valueOf(normalize(source)); }
    }

    @WritingConverter
    static class MockTestTypeToStringConverter implements Converter<MockTestType, String> {
        @Override public String convert(MockTestType source) { return kebab(source); }
    }

    @ReadingConverter
    static class StringToMessageStatusConverter implements Converter<String, MessageStatus> {
        @Override public MessageStatus convert(String source) { return MessageStatus.valueOf(normalize(source)); }
    }

    @WritingConverter
    static class MessageStatusToStringConverter implements Converter<MessageStatus, String> {
        @Override public String convert(MessageStatus source) { return lower(source); }
    }

    @ReadingConverter
    static class StringToMessageTypeConverter implements Converter<String, MessageType> {
        @Override public MessageType convert(String source) { return MessageType.valueOf(normalize(source)); }
    }

    @WritingConverter
    static class MessageTypeToStringConverter implements Converter<MessageType, String> {
        @Override public String convert(MessageType source) { return lower(source); }
    }

    private static String normalize(String value) {
        return value.trim().replace('-', '_').toUpperCase(Locale.ROOT);
    }

    private static <T extends Enum<T>> String lower(T value) {
        return value.name().toLowerCase(Locale.ROOT);
    }

    private static <T extends Enum<T>> String snake(T value) {
        return lower(value).replace('-', '_');
    }

    private static <T extends Enum<T>> String kebab(T value) {
        return lower(value).replace('_', '-');
    }
}
