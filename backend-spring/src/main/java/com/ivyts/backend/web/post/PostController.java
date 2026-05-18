package com.ivyts.backend.web.post;

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
@RequestMapping("/api/posts")
public class PostController extends MigrationPlaceholderController {

    @GetMapping
    public Object listPosts() { return notImplemented("posts.list"); }

    @PostMapping
    public Object createPost(@RequestBody Map<String, Object> body) { return notImplemented("posts.create"); }

    @PatchMapping("/{id}")
    public Object updatePost(@PathVariable String id, @RequestBody Map<String, Object> body) { return notImplemented("posts.update"); }

    @DeleteMapping("/{id}")
    public Object deletePost(@PathVariable String id) { return notImplemented("posts.delete"); }
}
