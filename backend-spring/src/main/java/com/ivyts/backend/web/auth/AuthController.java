package com.ivyts.backend.web.auth;

import com.ivyts.backend.web.shared.MigrationPlaceholderController;
import java.util.Map;
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
public class AuthController extends MigrationPlaceholderController {

    @PostMapping("/register")
    public Object register(@RequestBody Map<String, Object> body) { return notImplemented("auth.register"); }

    @PostMapping("/login")
    public Object login(@RequestBody Map<String, Object> body) { return notImplemented("auth.login"); }

    @PostMapping("/logout")
    public Object logout(@RequestBody Map<String, Object> body) { return notImplemented("auth.logout"); }

    @GetMapping("/me")
    public Object me() { return notImplemented("auth.me"); }

    @PostMapping("/refresh-token")
    public Object refreshToken(@RequestBody Map<String, Object> body) { return notImplemented("auth.refresh-token"); }

    @PatchMapping("/me/profile")
    public Object updateProfile(@RequestBody Map<String, Object> body) { return notImplemented("auth.me.profile"); }

    @PostMapping("/me/password")
    public Object changePassword(@RequestBody Map<String, Object> body) { return notImplemented("auth.me.password"); }

    @PostMapping("/me/email-change/request")
    public Object requestEmailChange(@RequestBody Map<String, Object> body) { return notImplemented("auth.me.email-change.request"); }

    @PostMapping("/me/email-change/confirm")
    public Object confirmEmailChange(@RequestBody Map<String, Object> body) { return notImplemented("auth.me.email-change.confirm"); }

    @PostMapping("/me/phone-change/request")
    public Object requestPhoneChange(@RequestBody Map<String, Object> body) { return notImplemented("auth.me.phone-change.request"); }

    @PostMapping("/me/phone-change/confirm")
    public Object confirmPhoneChange(@RequestBody Map<String, Object> body) { return notImplemented("auth.me.phone-change.confirm"); }
}
