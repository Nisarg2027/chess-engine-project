package com.chess.backend_springboot.engine.core;

import java.util.ArrayList;
import java.util.List;

public class CustomBoard {
    // A simple representation: 64 squares. 0 = empty, 1 = White Pawn, -1 = Black Pawn, etc.
    private int[] squares = new int[64]; 
    private boolean isWhiteTurn;
    private String currentFen;

    public void loadFromFen(String fen) {
        this.currentFen = fen;
        // TODO: Write a loop that parses the FEN string and fills the 'squares' array
    }

    public String getFen() {
        return currentFen; // TODO: Write logic to generate FEN from the 'squares' array
    }

    public void doMove(CustomMove move) {
        // TODO: Move the piece in the array, handle captures
    }

    public void undoMove() {
        // TODO: Revert the last doMove()
    }

    // THE FINAL BOSS OF THIS PROJECT
    public List<CustomMove> getLegalMoves() {
        List<CustomMove> moves = new ArrayList<>();
        // TODO: Loop through all 64 squares. If it's your turn, calculate valid L-shapes for knights, 
        // diagonals for bishops, check for absolute pins, prevent moving into check, etc.
        return moves; 
    }

    public boolean isLegal(String moveStr) {
        // moveStr is like "e2e4"
        List<CustomMove> legal = getLegalMoves();
        return legal.stream().anyMatch(m -> m.toString().equals(moveStr));
    }

    public boolean isMated() { return false; /* TODO */ }
    public boolean isDraw() { return false; /* TODO */ }
    public long getZobristKey() { return 0L; /* TODO */ }
}