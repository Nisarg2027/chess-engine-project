package com.chess.backend_springboot.engine;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class RoomManager {
    private final ConcurrentHashMap<String, String> activeRooms = new ConcurrentHashMap<>();
    private static final String STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public String createRoom() {
        String roomId = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        activeRooms.put(roomId, STARTING_FEN);
        return roomId;
    }

    public String getRoomFen(String roomId) {
        return activeRooms.getOrDefault(roomId, null);
    }

    public void updateRoom(String roomId, String fen) {
        // THE FIX: Unconditionally save the move. 
        // If it's a tournament room that wasn't in memory, this instantly creates it!
        activeRooms.put(roomId, fen);
    }

    public boolean roomExists(String roomId) {
        return activeRooms.containsKey(roomId);
    }
}