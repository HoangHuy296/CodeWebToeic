package com.ivyts.backend.security;

import com.ivyts.backend.config.properties.JwtProperties;
import com.ivyts.backend.domain.user.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey accessKey;
    private final SecretKey refreshKey;

    public JwtService(JwtProperties jwtProperties) {
        this.accessKey = Keys.hmacShaKeyFor(normalizeSecret(jwtProperties.jwtAccessSecret()));
        this.refreshKey = Keys.hmacShaKeyFor(normalizeSecret(jwtProperties.jwtRefreshSecret()));
    }

    public String signAccessToken(AuthUser payload) {
        return buildToken(payload, accessKey, 15 * 60);
    }

    public String signRefreshToken(AuthUser payload) {
        return buildToken(payload, refreshKey, 7L * 24 * 60 * 60);
    }

    public AuthUser verifyAccessToken(String token) {
        return toAuthUser(parseClaims(token, accessKey));
    }

    public AuthUser verifyRefreshToken(String token) {
        return toAuthUser(parseClaims(token, refreshKey));
    }

    private String buildToken(AuthUser payload, SecretKey key, long expiresInSeconds) {
        Instant now = Instant.now();
        return Jwts.builder()
            .claims(Map.of(
                "userId", payload.userId(),
                "email", payload.email(),
                "role", payload.role().name().toLowerCase()
            ))
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(expiresInSeconds)))
            .signWith(key)
            .compact();
    }

    private Claims parseClaims(String token, SecretKey key) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private AuthUser toAuthUser(Claims claims) {
        return new AuthUser(
            String.valueOf(claims.get("userId")),
            String.valueOf(claims.get("email")),
            UserRole.valueOf(String.valueOf(claims.get("role")).toUpperCase())
        );
    }

    private byte[] normalizeSecret(String secret) {
        String base = secret == null ? "replace-me-change-this-secret-key-1234567890" : secret;
        if (base.length() < 32) {
            base = (base + "00000000000000000000000000000000").substring(0, 32);
        }
        return base.getBytes(StandardCharsets.UTF_8);
    }
}
