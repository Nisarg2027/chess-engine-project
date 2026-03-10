package com.chess.backend_springboot.controller;

public class RoomMoveRequest {
    private String roomId;
    private String fen;

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    
    public String getFen() { return fen; }
    public void setFen(String fen) { this.fen = fen; }
}