package com.ivyts.backend.domain.post;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface BlogPostRepository extends MongoRepository<BlogPost, String> {
    long countByStatus(BlogPostStatus status);
}
