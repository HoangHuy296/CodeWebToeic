package com.ivyts.backend.web.mocktest;

import com.ivyts.backend.web.shared.MigrationPlaceholderController;
import java.util.Map;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/mock-tests")
public class MockTestController extends MigrationPlaceholderController {

    @GetMapping
    public Object getMockTests() { return notImplemented("mock-tests.list"); }

    @GetMapping("/manage/mine")
    public Object getManagedMockTests() { return notImplemented("mock-tests.manage.mine"); }

    @GetMapping("/{id}")
    public Object getMockTestDetail(@PathVariable String id) { return notImplemented("mock-tests.detail"); }

    @PostMapping
    public Object createMockTest(@RequestBody Map<String, Object> body) { return notImplemented("mock-tests.create"); }

    @PatchMapping("/{id}")
    public Object updateMockTest(@PathVariable String id, @RequestBody Map<String, Object> body) { return notImplemented("mock-tests.update"); }

    @DeleteMapping("/{id}")
    public Object deleteMockTest(@PathVariable String id) { return notImplemented("mock-tests.delete"); }

    @PostMapping("/{id}/submit")
    public Object submitMockTest(@PathVariable String id, @RequestBody Map<String, Object> body) { return notImplemented("mock-tests.submit"); }
}
