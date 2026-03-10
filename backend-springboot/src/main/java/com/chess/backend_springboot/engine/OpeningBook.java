package com.chess.backend_springboot.engine;

import java.util.HashMap;
import java.util.Map;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Square;
import com.github.bhlangonijr.chesslib.move.Move;

public class OpeningBook {
    // This map links a specific FEN to a specific counter-move
    private final Map<String, String> book = new HashMap<>();

    public OpeningBook() {
        // 1. e4 (King's Pawn) -> AI responds with c5 (The Sicilian Defense)
        book.put("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1", "C7C5");
        
        // 1. d4 (Queen's Pawn) -> AI responds with d5 (Queen's Pawn Game)
        book.put("rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1", "D7D5");
        
        // 1. e4 e5 2. Nf3 (Knight attack) -> AI responds with Nc6 (Defend the pawn)
        book.put("rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2", "B8C6");
    }

    public Move getBookMove(Board board) {
        String currentFen = board.getFen();
        
        // If the current board state is in our dictionary, play the memorized move
        if (book.containsKey(currentFen)) {
            String uciMove = book.get(currentFen);
            
            // Convert our string (e.g., "C7C5") into chesslib Square objects
            Square from = Square.valueOf(uciMove.substring(0, 2));
            Square to = Square.valueOf(uciMove.substring(2, 4));
            
            return new Move(from, to);
        }
        
        return null; // If we don't have it memorized, return null so the AI has to think
    }
}