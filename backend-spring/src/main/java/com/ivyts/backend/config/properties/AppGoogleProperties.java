package com.ivyts.backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.google")
public record AppGoogleProperties(String clientId) {
}
