package com.collabcode_api.features.room.dto;

import lombok.Builder;

@Builder
public record SocketMessage(
        String sender,
        String content,
        MessageType type
) {
    public enum MessageType {
        JOIN, LEAVE, CHAT, CODE_UPDATE
    }
}