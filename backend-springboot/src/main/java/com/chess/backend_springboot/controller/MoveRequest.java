package com.chess.backend_springboot.controller;

public class MoveRequest {
    private String fen;
    private String difficulty;

    // Getters and Setters are required for Spring Boot to automatically parse the JSON
    public String getFen() { return fen; }
    public void setFen(String fen) { this.fen = fen; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}