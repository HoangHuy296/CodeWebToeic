package com.ivyts.backend.web.admin;

import com.ivyts.backend.domain.user.User;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    public Map<String, Object> toAdminUserView(User user, long ownedCourseCount) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", user.getId());
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());
        data.put("role", user.getRole().name().toLowerCase());
        data.put("avatarUrl", user.getAvatarUrl());
        data.put("phone", user.getPhone());
        data.put("bio", user.getBio());
        data.put("isActive", user.isActive());
        data.put("ownedCourseIds", user.getOwnedCourseIds());
        data.put("ownedCourseCount", ownedCourseCount);
        return data;
    }
}
