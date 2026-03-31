package com.collabcode_api.features.room;

import com.collabcode_api.features.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findAllByOwner(User owner);
}