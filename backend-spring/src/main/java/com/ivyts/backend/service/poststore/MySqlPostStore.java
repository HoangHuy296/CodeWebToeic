package com.ivyts.backend.service.poststore;

import com.ivyts.backend.domain.post.BlogPost;
import com.ivyts.backend.domain.post.BlogPostStatus;
import com.ivyts.backend.relational.post.BlogPostEntity;
import com.ivyts.backend.relational.post.BlogPostJpaRepository;
import com.ivyts.backend.service.userstore.UserJsonCodec;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class MySqlPostStore implements PostStore {

    private final BlogPostJpaRepository blogPostJpaRepository;
    private final UserJsonCodec userJsonCodec;

    public MySqlPostStore(BlogPostJpaRepository blogPostJpaRepository, UserJsonCodec userJsonCodec) {
        this.blogPostJpaRepository = blogPostJpaRepository;
        this.userJsonCodec = userJsonCodec;
    }

    @Override
    public Optional<BlogPost> findById(String id) {
        return blogPostJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<BlogPost> findBySlug(String slug) {
        return blogPostJpaRepository.findBySlug(slug).map(this::toDomain);
    }

    @Override
    public List<BlogPost> findAll() {
        return blogPostJpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public BlogPost save(BlogPost post) {
        String postId = post.getId() == null ? UUID.randomUUID().toString().replace("-", "") : post.getId();
        BlogPostEntity entity = post.getId() == null
            ? new BlogPostEntity()
            : blogPostJpaRepository.findById(post.getId()).orElseGet(BlogPostEntity::new);

        entity.setId(postId);
        entity.setAuthorId(post.getAuthor());
        entity.setTitle(post.getTitle());
        entity.setSlug(post.getSlug());
        entity.setExcerpt(post.getExcerpt());
        entity.setContent(post.getContent());
        entity.setCoverImage(post.getCoverImage());
        entity.setTagsJson(userJsonCodec.write(post.getTags()));
        entity.setStatus(post.getStatus().name().toLowerCase(Locale.ROOT));
        entity.setSeoDescription(post.getSeoDescription());
        entity.setPublishedAt(post.getPublishedAt());
        entity.setCreatedAt(post.getCreatedAt());
        entity.setUpdatedAt(post.getUpdatedAt());

        return toDomain(blogPostJpaRepository.save(entity));
    }

    @Override
    public void delete(BlogPost post) {
        blogPostJpaRepository.deleteById(post.getId());
    }

    private BlogPost toDomain(BlogPostEntity entity) {
        BlogPost post = new BlogPost();
        post.setId(entity.getId());
        post.setAuthor(entity.getAuthorId());
        post.setTitle(entity.getTitle());
        post.setSlug(entity.getSlug());
        post.setExcerpt(entity.getExcerpt());
        post.setContent(entity.getContent());
        post.setCoverImage(entity.getCoverImage());
        post.setTags(new ArrayList<>(userJsonCodec.readStringList(entity.getTagsJson())));
        post.setStatus(BlogPostStatus.valueOf(entity.getStatus().toUpperCase(Locale.ROOT).replace('-', '_')));
        post.setSeoDescription(entity.getSeoDescription());
        post.setPublishedAt(entity.getPublishedAt());
        post.setCreatedAt(entity.getCreatedAt());
        post.setUpdatedAt(entity.getUpdatedAt());
        return post;
    }
}
