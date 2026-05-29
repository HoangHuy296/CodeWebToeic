package com.ivyts.backend.service.poststore;

import com.ivyts.backend.domain.post.BlogPost;
import java.util.List;
import java.util.Optional;

public interface PostStore {

    Optional<BlogPost> findById(String id);

    Optional<BlogPost> findBySlug(String slug);

    List<BlogPost> findAll();

    BlogPost save(BlogPost post);

    void delete(BlogPost post);
}
