package com.ivyts.backend.web.admin;

import com.ivyts.backend.web.shared.MigrationPlaceholderController;
import java.util.Map;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin")
public class AdminController extends MigrationPlaceholderController {

    @GetMapping("/stats")
    public Object stats() { return notImplemented("admin.stats"); }

    @GetMapping("/charts/revenue")
    public Object revenueChart() { return notImplemented("admin.charts.revenue"); }

    @GetMapping("/charts/enrollments")
    public Object enrollmentChart() { return notImplemented("admin.charts.enrollments"); }

    @GetMapping("/users")
    public Object listUsers() { return notImplemented("admin.users.list"); }

    @GetMapping("/users/{id}")
    public Object getUser(@PathVariable String id) { return notImplemented("admin.users.detail"); }

    @PatchMapping("/users/{id}")
    public Object updateUser(@PathVariable String id, @RequestBody Map<String, Object> body) { return notImplemented("admin.users.update"); }

    @DeleteMapping("/users/{id}")
    public Object deactivateUser(@PathVariable String id) { return notImplemented("admin.users.delete"); }
}
