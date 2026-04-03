package com.collabcode_api.features.room;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final SourceFileRepository fileRepository;

    @Async // Runs in a separate thread so WebSockets stay fast
    @Transactional
    public void saveFileContent(String roomId, String content) {
        var file = fileRepository.findByRoomId(UUID.fromString(roomId))
                .orElseThrow(() -> new RuntimeException("File not found for room"));

        file.setContent(content);
        fileRepository.save(file);
    }
}