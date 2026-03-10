package com.chess.backend_springboot.controller;

import com.chess.backend_springboot.engine.RoomManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:5173") // Allow React to call this API
public class RoomController {

    private final RoomManager roomManager;

    public RoomController(RoomManager roomManager) {
        this.roomManager = roomManager;
    }

    @PostMapping("/create")
    public ResponseEntity<String> createRoom() {
        String roomId = roomManager.createRoom();
        return ResponseEntity.ok(roomId);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<String> getRoom(@PathVariable String roomId) {
        String fen = roomManager.getRoomFen(roomId);
        if (fen != null) {
            return ResponseEntity.ok(fen);
        }
        return ResponseEntity.notFound().build();
    }
}