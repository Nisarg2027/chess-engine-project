package com.chess.backend_springboot.controller;

public class GameResultRequest {
    private String username;
    private String outcome; // Will be "win", "loss", or "draw"

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
}