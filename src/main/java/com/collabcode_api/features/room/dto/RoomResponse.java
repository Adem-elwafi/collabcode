package com.collabcode_api.features.room.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record RoomResponse(
        UUID id,
        String name,
        String description,
        String ownerEmail,
        LocalDateTime createdAt
) {}
