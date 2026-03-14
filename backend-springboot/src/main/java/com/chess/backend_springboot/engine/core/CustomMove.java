package com.chess.backend_springboot.engine.core;

public class CustomMove {
    private final String fromSquare; // e.g., "e2"
    private final String toSquare;   // e.g., "e4"
    private final String promotion;  // "q", "r", etc.

    public CustomMove(String fromSquare, String toSquare, String promotion) {
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
        this.promotion = promotion;
    }

    public String getFrom() { return fromSquare; }
    public String getTo() { return toSquare; }
    
    @Override
    public String toString() {
        return fromSquare + toSquare + (promotion != null ? promotion : "");
    }
}