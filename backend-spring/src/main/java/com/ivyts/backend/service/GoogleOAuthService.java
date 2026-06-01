package com.ivyts.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.config.properties.AppGoogleProperties;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.service.userstore.UserStore;
import com.ivyts.backend.web.auth.dto.AuthResponse;
import com.ivyts.backend.web.auth.dto.GoogleAuthRequest;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.util.Collections;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class GoogleOAuthService {

    private final UserStore userStore;
    private final AuthService authService;
    private final GoogleIdTokenVerifier tokenVerifier;
    private final AppGoogleProperties appGoogleProperties;

    public GoogleOAuthService(UserStore userStore, AuthService authService, AppGoogleProperties appGoogleProperties) {
        this.userStore = userStore;
        this.authService = authService;
        this.appGoogleProperties = appGoogleProperties;
        this.tokenVerifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(appGoogleProperties.clientId()))
            .build();
    }

    public AuthResponse authenticate(GoogleAuthRequest request) {
        ensureGoogleConfigured();
        UserRole intendedRole = parseIntendedRole(request.intendedRole());
        GoogleIdentity identity = verifyCredential(request.credential());

        User googleLinkedUser = userStore.findByGoogleSub(identity.subject()).orElse(null);
        if (googleLinkedUser != null) {
            if (googleLinkedUser.getRole() != intendedRole) {
                throw new ApiException(HttpStatus.CONFLICT, "GOOGLE_ROLE_MISMATCH", "Google account is linked to a different role");
            }

            applyGoogleIdentity(googleLinkedUser, identity);
            return authService.authenticateTrustedUser(userStore.save(googleLinkedUser));
        }

        User existingUser = userStore.findByEmail(identity.email()).orElse(null);
        if (existingUser != null) {
            if (existingUser.getRole() != intendedRole) {
                throw new ApiException(HttpStatus.CONFLICT, "GOOGLE_ROLE_MISMATCH", "Email already belongs to a different role");
            }

            throw new ApiException(
                HttpStatus.CONFLICT,
                "GOOGLE_LINK_REQUIRED",
                "This email already exists. Please sign in with your password first before linking Google."
            );
        }

        User user = new User();
        user.setFullName(identity.name());
        user.setEmail(identity.email());
        user.setPasswordHash(null);
        user.setPhone(null);
        user.setRole(intendedRole);
        user.setActive(true);
        applyGoogleIdentity(user, identity);

        return authService.authenticateTrustedUser(userStore.save(user));
    }

    private void ensureGoogleConfigured() {
        if (appGoogleProperties.clientId() == null || appGoogleProperties.clientId().isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "GOOGLE_AUTH_DISABLED", "Google sign-in is not configured");
        }
    }

    private UserRole parseIntendedRole(String intendedRole) {
        String normalizedRole = intendedRole == null ? "" : intendedRole.trim().toLowerCase(Locale.ROOT);
        return switch (normalizedRole) {
            case "student" -> UserRole.STUDENT;
            case "teacher" -> UserRole.TEACHER;
            case "admin" -> throw new ApiException(HttpStatus.FORBIDDEN, "GOOGLE_ROLE_NOT_ALLOWED", "Admin accounts must sign in with email and password");
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "GOOGLE_ROLE_INVALID", "Google sign-in role must be student or teacher");
        };
    }

    private GoogleIdentity verifyCredential(String credential) {
        try {
            GoogleIdToken idToken = tokenVerifier.verify(credential);
            if (idToken == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "GOOGLE_TOKEN_INVALID", "Google ID token is invalid or expired");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new ApiException(HttpStatus.FORBIDDEN, "GOOGLE_EMAIL_UNVERIFIED", "Google account email must be verified");
            }

            return new GoogleIdentity(
                payload.getSubject(),
                String.valueOf(payload.getEmail()).trim().toLowerCase(Locale.ROOT),
                payload.get("name") == null ? payload.getEmail() : String.valueOf(payload.get("name")),
                payload.get("picture") == null ? null : String.valueOf(payload.get("picture")),
                true
            );
        } catch (ApiException exception) {
            throw exception;
        } catch (GeneralSecurityException | IOException | IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "GOOGLE_TOKEN_INVALID", "Google ID token could not be verified");
        }
    }

    private void applyGoogleIdentity(User user, GoogleIdentity identity) {
        user.setGoogleSub(identity.subject());
        user.setGoogleEmailVerified(identity.emailVerified());
        user.setGoogleLinkedAt(user.getGoogleLinkedAt() == null ? Instant.now() : user.getGoogleLinkedAt());
        user.setLastLoginAt(Instant.now());
        user.setEmail(identity.email());
        if (identity.name() != null && !identity.name().isBlank()) {
            user.setFullName(identity.name().trim());
        }
        if (identity.pictureUrl() != null && !identity.pictureUrl().isBlank()) {
            user.setAvatarUrl(identity.pictureUrl());
        }
    }

    private record GoogleIdentity(
        String subject,
        String email,
        String name,
        String pictureUrl,
        boolean emailVerified
    ) {
    }
}
