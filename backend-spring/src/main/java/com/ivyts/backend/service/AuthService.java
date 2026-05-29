package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.user.PendingEmailChange;
import com.ivyts.backend.domain.user.PendingPhoneChange;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.notification.NotificationEventsService;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.security.JwtService;
import com.ivyts.backend.service.userstore.UserStore;
import com.ivyts.backend.web.auth.dto.AuthResponse;
import com.ivyts.backend.web.auth.dto.ChangePasswordRequest;
import com.ivyts.backend.web.auth.dto.ConfirmEmailChangeRequest;
import com.ivyts.backend.web.auth.dto.ConfirmPhoneChangeRequest;
import com.ivyts.backend.web.auth.dto.LoginRequest;
import com.ivyts.backend.web.auth.dto.PublicUserResponse;
import com.ivyts.backend.web.auth.dto.RefreshTokenRequest;
import com.ivyts.backend.web.auth.dto.RegisterRequest;
import com.ivyts.backend.web.auth.dto.RequestEmailChangeRequest;
import com.ivyts.backend.web.auth.dto.RequestPhoneChangeRequest;
import com.ivyts.backend.web.auth.dto.UpdateProfileRequest;
import com.ivyts.backend.web.auth.dto.VerificationResponse;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder(10);
    private final UserStore userStore;
    private final JwtService jwtService;
    private final NotificationEventsService notificationEventsService;
    private final Random random = new Random();

    public AuthService(UserStore userStore, JwtService jwtService, NotificationEventsService notificationEventsService) {
        this.userStore = userStore;
        this.jwtService = jwtService;
        this.notificationEventsService = notificationEventsService;
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userStore.findByEmail(normalizedEmail).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(PASSWORD_ENCODER.encode(request.password()));
        user.setPhone(blankToNull(request.phone()));
        user.setRole(UserRole.STUDENT);
        user.setActive(true);
        user = userStore.save(user);
        notificationEventsService.emitNewUserRegistered(user.getId(), user.getEmail(), user.getFullName());

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userStore.findByEmail(normalizeEmail(request.email()))
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect"));

        ensureActive(user);

        if (!PASSWORD_ENCODER.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect");
        }

        return buildAuthResponse(user);
    }

    public void logout(AuthUser authUser) {
        User user = findUserByIdOrThrow(authUser.userId());
        user.setRefreshToken(null);
        userStore.save(user);
    }

    public PublicUserResponse me(AuthUser authUser) {
        return toPublicUser(findUserByIdOrThrow(authUser.userId()));
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        AuthUser payload;
        try {
            payload = jwtService.verifyRefreshToken(request.refreshToken());
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        User user = findUserByIdOrThrow(payload.userId());
        ensureActive(user);

        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(request.refreshToken())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token is not valid");
        }

        return buildAuthResponse(user);
    }

    public PublicUserResponse updateProfile(AuthUser authUser, UpdateProfileRequest request) {
        User user = findUserByIdOrThrow(authUser.userId());
        ensureActive(user);

        if (request.fullName() != null) {
            user.setFullName(request.fullName().trim());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(blankToNull(request.avatarUrl()));
        }
        if (request.bio() != null) {
            user.setBio(blankToNull(request.bio()));
        }

        userStore.save(user);
        return toPublicUser(user);
    }

    public void changePassword(AuthUser authUser, ChangePasswordRequest request) {
        User user = findUserByIdOrThrow(authUser.userId());
        ensureActive(user);

        if (!PASSWORD_ENCODER.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (PASSWORD_ENCODER.matches(request.newPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
        }

        user.setPasswordHash(PASSWORD_ENCODER.encode(request.newPassword()));
        userStore.save(user);
    }

    public VerificationResponse requestEmailChange(AuthUser authUser, RequestEmailChangeRequest request) {
        User user = findUserByIdOrThrow(authUser.userId());
        ensureActive(user);

        String newEmail = normalizeEmail(request.newEmail());
        if (newEmail.equals(user.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New email must be different from current email");
        }
        userStore.findByEmail(newEmail)
            .filter(existing -> !existing.getId().equals(user.getId()))
            .ifPresent(existing -> { throw new ApiException(HttpStatus.CONFLICT, "Email already exists"); });

        String code = generateSixDigitCode();
        Instant expiresAt = Instant.now().plusSeconds(10 * 60);
        user.setPendingEmailChange(new PendingEmailChange(newEmail, code, expiresAt));
        userStore.save(user);

        return new VerificationResponse(newEmail, expiresAt, code);
    }

    public AuthResponse confirmEmailChange(AuthUser authUser, ConfirmEmailChangeRequest request) {
        User user = findUserByIdOrThrow(authUser.userId());
        ensureActive(user);

        PendingEmailChange pending = user.getPendingEmailChange();
        if (pending == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No pending email verification request");
        }

        String newEmail = normalizeEmail(request.newEmail());
        if (!pending.newEmail().equals(newEmail)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Pending email does not match");
        }
        if (pending.expiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email verification code has expired");
        }
        if (!pending.verificationCode().equals(request.verificationCode())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email verification code is incorrect");
        }

        userStore.findByEmail(newEmail)
            .filter(existing -> !existing.getId().equals(user.getId()))
            .ifPresent(existing -> { throw new ApiException(HttpStatus.CONFLICT, "Email already exists"); });

        user.setEmail(newEmail);
        user.setPendingEmailChange(null);
        userStore.save(user);
        return buildAuthResponse(user);
    }

    public VerificationResponse requestPhoneChange(AuthUser authUser, RequestPhoneChangeRequest request) {
        User user = findUserByIdOrThrow(authUser.userId());
        ensureActive(user);

        String newPhone = request.newPhone().trim();
        if (newPhone.equals(user.getPhone())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New phone must be different from current phone");
        }

        String code = generateSixDigitCode();
        Instant expiresAt = Instant.now().plusSeconds(10 * 60);
        user.setPendingPhoneChange(new PendingPhoneChange(newPhone, code, expiresAt));
        userStore.save(user);

        return new VerificationResponse(newPhone, expiresAt, code);
    }

    public PublicUserResponse confirmPhoneChange(AuthUser authUser, ConfirmPhoneChangeRequest request) {
        User user = findUserByIdOrThrow(authUser.userId());
        ensureActive(user);

        PendingPhoneChange pending = user.getPendingPhoneChange();
        if (pending == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No pending phone verification request");
        }
        if (!pending.newPhone().equals(request.newPhone().trim())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Pending phone does not match");
        }
        if (pending.expiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Phone OTP has expired");
        }
        if (!pending.otpCode().equals(request.otpCode())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Phone OTP is incorrect");
        }

        user.setPhone(request.newPhone().trim());
        user.setPendingPhoneChange(null);
        userStore.save(user);
        return toPublicUser(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        AuthUser payload = new AuthUser(user.getId(), user.getEmail(), user.getRole());
        String accessToken = jwtService.signAccessToken(payload);
        String refreshToken = jwtService.signRefreshToken(payload);
        user.setRefreshToken(refreshToken);
        User persistedUser = userStore.save(user);
        return new AuthResponse(toPublicUser(persistedUser), accessToken, refreshToken);
    }

    private PublicUserResponse toPublicUser(User user) {
        return new PublicUserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole().name().toLowerCase(Locale.ROOT),
            user.getAvatarUrl(),
            user.getPhone(),
            user.getBio(),
            user.isActive(),
            user.getOwnedCourseIds() == null ? List.of() : user.getOwnedCourseIds()
        );
    }

    private User findUserByIdOrThrow(String userId) {
        return userStore.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void ensureActive(User user) {
        if (!user.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Account is inactive");
        }
    }

    private String generateSixDigitCode() {
        return String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
