package com.chess.backend_springboot.engine;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;

@Service
public class RoomManager {
    // Maps a unique Room ID (e.g., "A1B2") to its current FEN string
    private final ConcurrentHashMap<String, String> activeRooms = new ConcurrentHashMap<>();
    
    // The standard starting position for a chess game
    private static final String STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public String createRoom() {
        // Generate a simple 4-character alphanumeric code for friends to share
        String roomId = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        activeRooms.put(roomId, STARTING_FEN);
        return roomId;
    }

    public String getRoomFen(String roomId) {
        return activeRooms.getOrDefault(roomId, null);
    }

    public void updateRoom(String roomId, String fen) {
        if (activeRooms.containsKey(roomId)) {
            activeRooms.put(roomId, fen);
        }
    }

    public boolean roomExists(String roomId) {
        return activeRooms.containsKey(roomId);
    }
}