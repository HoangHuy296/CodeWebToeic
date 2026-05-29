package com.ivyts.backend.web.post;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.PostService;
import com.ivyts.backend.web.post.dto.CreatePostRequest;
import com.ivyts.backend.web.post.dto.UpdatePostRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final RequestAuthService requestAuthService;

    public PostController(PostService postService, RequestAuthService requestAuthService) {
        this.postService = postService;
        this.requestAuthService = requestAuthService;
    }

    @GetMapping
    public ApiSuccessResponse<?> listPosts(HttpServletRequest request) {
        return ApiSuccessResponse.of("Posts fetched successfully", postService.listPosts(requestAuthService.optionalUser(request)));
    }

    @GetMapping("/{slug}")
    public ApiSuccessResponse<?> getPostBySlug(@PathVariable String slug, HttpServletRequest request) {
        return ApiSuccessResponse.of("Post fetched successfully", postService.getPostBySlug(slug, requestAuthService.optionalUser(request)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSuccessResponse<?> createPost(HttpServletRequest request, @Valid @RequestBody CreatePostRequest body) {
        return ApiSuccessResponse.of("Post created successfully", postService.createPost(body, requestAuthService.requireUser(request)));
    }

    @PatchMapping("/{id}")
    public ApiSuccessResponse<?> updatePost(@PathVariable String id, HttpServletRequest request, @Valid @RequestBody UpdatePostRequest body) {
        return ApiSuccessResponse.of("Post updated successfully", postService.updatePost(id, body, requestAuthService.requireUser(request)));
    }

    @DeleteMapping("/{id}")
    public ApiSuccessResponse<?> deletePost(@PathVariable String id, HttpServletRequest request) {
        return ApiSuccessResponse.of("Post deleted successfully", postService.deletePost(id, requestAuthService.requireUser(request)));
    }
}
