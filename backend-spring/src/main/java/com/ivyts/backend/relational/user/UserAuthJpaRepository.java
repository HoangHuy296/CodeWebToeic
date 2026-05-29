package com.ivyts.backend.relational.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAuthJpaRepository extends JpaRepository<UserAuthEntity, String> {

    Optional<UserAuthEntity> findByEmail(String email);

    Optional<UserAuthEntity> findByRefreshToken(String refreshToken);
}
