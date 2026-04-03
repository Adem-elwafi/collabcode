package com.collabcode_api.features.editor;

import com.collabcode_api.features.room.RoomService;
import com.collabcode_api.features.room.SourceFile;
import com.collabcode_api.features.room.SourceFileRepository;
import com.collabcode_api.features.room.dto.SocketMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Controller
@RestController // Needed to handle both WebSocket and REST GET requests
@RequiredArgsConstructor
public class EditorController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService roomService; // Fixed: Added missing injection
    private final SourceFileRepository fileRepository; // Fixed: Added missing injection

    // 1. Handle sending general messages or code updates (WebSocket)
    @MessageMapping("/editor.sendMessage/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, @Payload SocketMessage chatMessage) {
        // 1. Broadcast to everyone (Real-time)
        messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);

        // 2. Save to DB (Persistence) - Only if it's a code update
        if (chatMessage.type() == SocketMessage.MessageType.CODE_UPDATE) {
            roomService.saveFileContent(roomId, chatMessage.content());
        }
    }

    // 2. Handle User Joining (WebSocket)
    @MessageMapping("/editor.addUser/{roomId}")
    public void addUser(
            @DestinationVariable String roomId,
            @Payload SocketMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.sender());
        headerAccessor.getSessionAttributes().put("roomId", roomId);

        messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);
    }

    // 3. Initial State Fetch (REST HTTP)
    // This allows the React frontend to load the saved code when the page loads
    @GetMapping("/api/v1/rooms/{roomId}/files")
    public ResponseEntity<SourceFile> getRoomFile(@PathVariable UUID roomId) {
        return ResponseEntity.ok(
                fileRepository.findByRoomId(roomId)
                        .orElseThrow(() -> new RuntimeException("No file found for room: " + roomId))
        );
    }
}