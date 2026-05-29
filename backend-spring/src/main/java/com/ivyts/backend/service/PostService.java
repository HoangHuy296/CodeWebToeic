package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.post.BlogPost;
import com.ivyts.backend.domain.post.BlogPostStatus;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.notification.NotificationEventsService;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.service.poststore.PostStore;
import com.ivyts.backend.service.userstore.UserStore;
import com.ivyts.backend.util.SlugUtils;
import com.ivyts.backend.web.post.dto.CreatePostRequest;
import com.ivyts.backend.web.post.dto.UpdatePostRequest;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class PostService {

    private final PostStore postStore;
    private final UserStore userStore;
    private final NotificationEventsService notificationEventsService;

    public PostService(PostStore postStore, UserStore userStore, NotificationEventsService notificationEventsService) {
        this.postStore = postStore;
        this.userStore = userStore;
        this.notificationEventsService = notificationEventsService;
    }

    public List<Map<String, Object>> listPosts(AuthUser authUser) {
        return postStore.findAll().stream()
            .filter(post -> authUser != null && authUser.role() == UserRole.ADMIN || post.getStatus() == BlogPostStatus.PUBLISHED)
            .sorted(Comparator.comparing(BlogPost::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(BlogPost::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(this::toPostView)
            .toList();
    }

    public Map<String, Object> getPostBySlug(String slug, AuthUser authUser) {
        BlogPost post = postStore.findBySlug(slug)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));

        if (post.getStatus() != BlogPostStatus.PUBLISHED && (authUser == null || authUser.role() != UserRole.ADMIN)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Post not found");
        }

        return toPostView(post);
    }

    public Map<String, Object> createPost(CreatePostRequest request, AuthUser authUser) {
        ensureAdmin(authUser);
        String slug = resolveUniqueSlug(SlugUtils.toSlug(request.slug() == null || request.slug().isBlank() ? request.title() : request.slug()), null);

        BlogPost post = new BlogPost();
        post.setAuthor(authUser.userId());
        post.setTitle(request.title().trim());
        post.setSlug(slug);
        post.setExcerpt(request.excerpt().trim());
        post.setContent(request.content().trim());
        post.setCoverImage(blankToNull(request.coverImage()));
        post.setTags(request.tags() == null ? List.of() : request.tags().stream().map(String::trim).filter(value -> !value.isBlank()).toList());
        post.setStatus(parseStatus(request.status()));
        post.setSeoDescription(blankToNull(request.seoDescription()));
        post.setPublishedAt(post.getStatus() == BlogPostStatus.PUBLISHED ? Instant.now() : null);
        BlogPost savedPost = postStore.save(post);
        notificationEventsService.emitPostCreated(
            authUser,
            savedPost.getId(),
            savedPost.getTitle(),
            savedPost.getStatus().name().toLowerCase(Locale.ROOT)
        );
        return toPostView(savedPost);
    }

    public Map<String, Object> updatePost(String postId, UpdatePostRequest request, AuthUser authUser) {
        ensureAdmin(authUser);
        BlogPost post = findPostOrThrow(postId);
        String nextSlug = post.getSlug();
        if (request.slug() != null && !request.slug().isBlank()) {
            nextSlug = resolveUniqueSlug(SlugUtils.toSlug(request.slug()), postId);
        }

        if (request.title() != null) post.setTitle(request.title().trim());
        if (request.excerpt() != null) post.setExcerpt(request.excerpt().trim());
        if (request.content() != null) post.setContent(request.content().trim());
        if (request.coverImage() != null) post.setCoverImage(blankToNull(request.coverImage()));
        if (request.tags() != null) post.setTags(request.tags().stream().map(String::trim).filter(value -> !value.isBlank()).toList());
        if (request.seoDescription() != null) post.setSeoDescription(blankToNull(request.seoDescription()));
        if (request.status() != null) {
            BlogPostStatus nextStatus = parseStatus(request.status());
            post.setStatus(nextStatus);
            post.setPublishedAt(nextStatus == BlogPostStatus.PUBLISHED ? (post.getPublishedAt() == null ? Instant.now() : post.getPublishedAt()) : null);
        }
        post.setSlug(nextSlug);

        return toPostView(postStore.save(post));
    }

    public Map<String, Object> deletePost(String postId, AuthUser authUser) {
        ensureAdmin(authUser);
        BlogPost post = findPostOrThrow(postId);
        postStore.delete(post);
        return Map.of();
    }

    private String resolveUniqueSlug(String slug, String excludePostId) {
        BlogPost existing = postStore.findBySlug(slug).orElse(null);
        if (existing != null && !existing.getId().equals(excludePostId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Post slug already exists");
        }
        return slug;
    }

    private BlogPost findPostOrThrow(String postId) {
        return postStore.findById(postId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    private BlogPostStatus parseStatus(String value) {
        return BlogPostStatus.valueOf((value == null || value.isBlank() ? "draft" : value).trim().replace('-', '_').toUpperCase(Locale.ROOT));
    }

    private void ensureAdmin(AuthUser authUser) {
        if (authUser == null || authUser.role() != UserRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Map<String, Object> toPostView(BlogPost post) {
        User author = userStore.findById(post.getAuthor()).orElse(null);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", post.getId());
        data.put("title", post.getTitle());
        data.put("slug", post.getSlug());
        data.put("excerpt", post.getExcerpt());
        data.put("content", post.getContent());
        data.put("coverImage", post.getCoverImage());
        data.put("tags", post.getTags());
        data.put("status", post.getStatus().name().toLowerCase(Locale.ROOT));
        data.put("seoDescription", post.getSeoDescription());
        data.put("publishedAt", post.getPublishedAt());
        data.put("author", author == null ? Map.of("id", post.getAuthor()) : Map.of(
            "id", author.getId(),
            "fullName", author.getFullName(),
            "email", author.getEmail()
        ));
        return data;
    }
}
