package com.ivyts.backend.security;

import com.ivyts.backend.common.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RequestAuthService {

    private final JwtService jwtService;

    public RequestAuthService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public AuthUser requireUser(HttpServletRequest request) {
        String token = extractBearerToken(request);
        if (token == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authorization token is required");
        }

        try {
            return jwtService.verifyAccessToken(token);
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired access token");
        }
    }

    public AuthUser optionalUser(HttpServletRequest request) {
        String token = extractBearerToken(request);
        if (token == null) {
            return null;
        }

        try {
            return jwtService.verifyAccessToken(token);
        } catch (Exception exception) {
            return null;
        }
    }

    private String extractBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }
        return authorization.substring(7).trim();
    }
}
