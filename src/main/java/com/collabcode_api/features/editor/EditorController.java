package com.collabcode_api.features.editor;

import com.collabcode_api.features.room.dto.SocketMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class EditorController {

    private final SimpMessagingTemplate messagingTemplate;

    // 1. Handle sending general messages or code updates
    @MessageMapping("/editor.sendMessage/{roomId}")
    public void sendMessage(
            @DestinationVariable String roomId,
            @Payload SocketMessage chatMessage
    ) {
        // Broadcast the message to the specific room topic
        messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);
    }

    // 2. Handle User Joining
    @MessageMapping("/editor.addUser/{roomId}")
    public void addUser(
            @DestinationVariable String roomId,
            @Payload SocketMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        // Add username in web socket session attributes to track who leaves later
        headerAccessor.getSessionAttributes().put("username", chatMessage.sender());
        headerAccessor.getSessionAttributes().put("roomId", roomId);

        // Notify everyone in the room that a new user joined
        messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);
    }
}