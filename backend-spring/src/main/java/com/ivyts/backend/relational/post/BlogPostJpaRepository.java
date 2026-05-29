package com.ivyts.backend.relational.post;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostJpaRepository extends JpaRepository<BlogPostEntity, String> {

    Optional<BlogPostEntity> findBySlug(String slug);
}
