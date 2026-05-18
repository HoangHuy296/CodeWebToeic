package com.ivyts.backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public record JwtProperties(String jwtAccessSecret, String jwtRefreshSecret) {
}
