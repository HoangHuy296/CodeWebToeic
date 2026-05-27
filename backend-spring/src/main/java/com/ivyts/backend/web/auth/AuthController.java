package com.ivyts.backend.web.auth;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.AuthService;
import com.ivyts.backend.web.auth.dto.ChangePasswordRequest;
import com.ivyts.backend.web.auth.dto.ConfirmEmailChangeRequest;
import com.ivyts.backend.web.auth.dto.ConfirmPhoneChangeRequest;
import com.ivyts.backend.web.auth.dto.LoginRequest;
import com.ivyts.backend.web.auth.dto.RefreshTokenRequest;
import com.ivyts.backend.web.auth.dto.RegisterRequest;
import com.ivyts.backend.web.auth.dto.RequestEmailChangeRequest;
import com.ivyts.backend.web.auth.dto.RequestPhoneChangeRequest;
import com.ivyts.backend.web.auth.dto.UpdateProfileRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RequestAuthService requestAuthService;

    public AuthController(AuthService authService, RequestAuthService requestAuthService) {
        this.authService = authService;
        this.requestAuthService = requestAuthService;
    }

    @PostMapping("/register")
    public ApiSuccessResponse<?> register(@Valid @RequestBody RegisterRequest body) {
        return ApiSuccessResponse.of("User registered successfully", authService.register(body));
    }

    @PostMapping("/login")
    public ApiSuccessResponse<?> login(@Valid @RequestBody LoginRequest body) {
        return ApiSuccessResponse.of("Login successful", authService.login(body));
    }

    @PostMapping("/logout")
    public ApiSuccessResponse<?> logout(@Valid @RequestBody RefreshTokenRequest body) {
        authService.logout(body);
        return ApiSuccessResponse.of("Logout successful", null);
    }

    @GetMapping("/me")
    public ApiSuccessResponse<?> me(HttpServletRequest request) {
        return ApiSuccessResponse.of("Current user fetched successfully", authService.me(requestAuthService.requireUser(request)));
    }

    @PostMapping("/refresh-token")
    public ApiSuccessResponse<?> refreshToken(@Valid @RequestBody RefreshTokenRequest body) {
        return ApiSuccessResponse.of("Token refreshed successfully", authService.refreshToken(body));
    }

    @PatchMapping("/me/profile")
    public ApiSuccessResponse<?> updateProfile(HttpServletRequest request, @Valid @RequestBody UpdateProfileRequest body) {
        return ApiSuccessResponse.of("Profile updated successfully", authService.updateProfile(requestAuthService.requireUser(request), body));
    }

    @PostMapping("/me/password")
    public ApiSuccessResponse<?> changePassword(HttpServletRequest request, @Valid @RequestBody ChangePasswordRequest body) {
        authService.changePassword(requestAuthService.requireUser(request), body);
        return ApiSuccessResponse.of("Password changed successfully", null);
    }

    @PostMapping("/me/email-change/request")
    public ApiSuccessResponse<?> requestEmailChange(HttpServletRequest request, @Valid @RequestBody RequestEmailChangeRequest body) {
        return ApiSuccessResponse.of("Email change requested successfully", authService.requestEmailChange(requestAuthService.requireUser(request), body));
    }

    @PostMapping("/me/email-change/confirm")
    public ApiSuccessResponse<?> confirmEmailChange(HttpServletRequest request, @Valid @RequestBody ConfirmEmailChangeRequest body) {
        return ApiSuccessResponse.of("Email updated successfully", authService.confirmEmailChange(requestAuthService.requireUser(request), body));
    }

    @PostMapping("/me/phone-change/request")
    public ApiSuccessResponse<?> requestPhoneChange(HttpServletRequest request, @Valid @RequestBody RequestPhoneChangeRequest body) {
        return ApiSuccessResponse.of("Phone change requested successfully", authService.requestPhoneChange(requestAuthService.requireUser(request), body));
    }

    @PostMapping("/me/phone-change/confirm")
    public ApiSuccessResponse<?> confirmPhoneChange(HttpServletRequest request, @Valid @RequestBody ConfirmPhoneChangeRequest body) {
        return ApiSuccessResponse.of("Phone updated successfully", authService.confirmPhoneChange(requestAuthService.requireUser(request), body));
    }
}
