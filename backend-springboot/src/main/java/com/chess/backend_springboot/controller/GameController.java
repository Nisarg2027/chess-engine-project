package com.chess.backend_springboot.controller; // Ensure this matches!
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.chess.backend_springboot.engine.Minimax;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.move.Move;

@Controller
public class GameController {
    private final Minimax ai = new Minimax();

    @MessageMapping("/move")
    @SendTo("/topic/board")
    public String processMove(String incomingFenStr) {
        // Clean the incoming FEN (strip extra quotes if they exist)
        String cleanFen = incomingFenStr.replace("\"", "");
        
        Board board = new Board();
        board.loadFromFen(cleanFen);

        // Check if the game is already over before AI moves
        if (board.isMated() || board.isDraw()) {
            return board.getFen();
        }

        // 1. Let the AI find the best move (Depth 3 or 4)
        Move bestMove = ai.findBestMove(board, 3); 
        
        // 2. Execute the move
        if (bestMove != null) {
            board.doMove(bestMove);
        }

        // 3. Return the new board state
        return board.getFen();
    }
}