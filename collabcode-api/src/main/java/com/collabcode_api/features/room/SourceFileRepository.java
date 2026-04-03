package com.collabcode_api.features.room;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SourceFileRepository extends JpaRepository<SourceFile, UUID> {
    Optional<SourceFile> findByRoomId(UUID roomId);
}