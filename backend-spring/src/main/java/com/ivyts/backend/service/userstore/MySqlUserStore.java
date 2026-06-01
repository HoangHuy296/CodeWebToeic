package com.ivyts.backend.service.userstore;

import com.ivyts.backend.domain.user.PendingEmailChange;
import com.ivyts.backend.domain.user.PendingPhoneChange;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.relational.user.UserAuthEntity;
import com.ivyts.backend.relational.user.UserAuthJpaRepository;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class MySqlUserStore implements UserStore {

    private final UserAuthJpaRepository userAuthJpaRepository;
    private final UserJsonCodec userJsonCodec;

    public MySqlUserStore(UserAuthJpaRepository userAuthJpaRepository, UserJsonCodec userJsonCodec) {
        this.userAuthJpaRepository = userAuthJpaRepository;
        this.userJsonCodec = userJsonCodec;
    }

    @Override
    public Optional<User> findById(String id) {
        return userAuthJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userAuthJpaRepository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<User> findByGoogleSub(String googleSub) {
        return userAuthJpaRepository.findByGoogleSub(googleSub).map(this::toDomain);
    }

    @Override
    public Optional<User> findByRefreshToken(String refreshToken) {
        return userAuthJpaRepository.findByRefreshToken(refreshToken).map(this::toDomain);
    }

    @Override
    public java.util.List<User> findAll() {
        return userAuthJpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public User save(User user) {
        String userId = user.getId() == null ? UUID.randomUUID().toString().replace("-", "") : user.getId();
        UserAuthEntity entity = user.getId() == null
            ? new UserAuthEntity()
            : userAuthJpaRepository.findById(user.getId()).orElseGet(UserAuthEntity::new);

        entity.setId(userId);
        entity.setFullName(user.getFullName());
        entity.setEmail(user.getEmail());
        entity.setPasswordHash(user.getPasswordHash());
        entity.setRole(user.getRole().name().toLowerCase());
        entity.setGoogleSub(user.getGoogleSub());
        entity.setGoogleEmailVerified(user.isGoogleEmailVerified());
        entity.setGoogleLinkedAt(user.getGoogleLinkedAt());
        entity.setLastLoginAt(user.getLastLoginAt());
        entity.setAvatarUrl(user.getAvatarUrl());
        entity.setPhone(user.getPhone());
        entity.setBio(user.getBio());
        entity.setActive(user.isActive());
        entity.setRefreshToken(user.getRefreshToken());
        entity.setOwnedCourseIdsJson(userJsonCodec.write(user.getOwnedCourseIds()));
        entity.setPendingEmailChangeJson(userJsonCodec.write(user.getPendingEmailChange()));
        entity.setPendingPhoneChangeJson(userJsonCodec.write(user.getPendingPhoneChange()));
        entity.setCreatedAt(user.getCreatedAt());
        entity.setUpdatedAt(user.getUpdatedAt());

        return toDomain(userAuthJpaRepository.save(entity));
    }

    private User toDomain(UserAuthEntity entity) {
        User user = new User();
        user.setId(entity.getId());
        user.setFullName(entity.getFullName());
        user.setEmail(entity.getEmail());
        user.setPasswordHash(entity.getPasswordHash());
        user.setRole(com.ivyts.backend.domain.user.UserRole.valueOf(entity.getRole().toUpperCase()));
        user.setGoogleSub(entity.getGoogleSub());
        user.setGoogleEmailVerified(entity.isGoogleEmailVerified());
        user.setGoogleLinkedAt(entity.getGoogleLinkedAt());
        user.setLastLoginAt(entity.getLastLoginAt());
        user.setAvatarUrl(entity.getAvatarUrl());
        user.setPhone(entity.getPhone());
        user.setBio(entity.getBio());
        user.setActive(entity.isActive());
        user.setRefreshToken(entity.getRefreshToken());
        user.setOwnedCourseIds(new ArrayList<>(userJsonCodec.readStringList(entity.getOwnedCourseIdsJson())));
        user.setPendingEmailChange(userJsonCodec.read(entity.getPendingEmailChangeJson(), PendingEmailChange.class));
        user.setPendingPhoneChange(userJsonCodec.read(entity.getPendingPhoneChangeJson(), PendingPhoneChange.class));
        user.setCreatedAt(entity.getCreatedAt());
        user.setUpdatedAt(entity.getUpdatedAt());
        return user;
    }
}
