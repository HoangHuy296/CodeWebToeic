package com.ivyts.backend.service.userstore;

import com.ivyts.backend.domain.user.User;
import java.util.List;
import java.util.Optional;

public interface UserStore {

    Optional<User> findById(String id);

    Optional<User> findByEmail(String email);

    Optional<User> findByRefreshToken(String refreshToken);

    List<User> findAll();

    User save(User user);
}
