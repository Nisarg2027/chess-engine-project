package com.chess.backend_springboot.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.chess.backend_springboot.engine.Minimax;
import com.chess.backend_springboot.engine.OpeningBook;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.move.Move;

@Controller
public class GameController {
    private final Minimax ai = new Minimax();
    private final OpeningBook openingBook = new OpeningBook();

    @MessageMapping("/move")
    @SendTo("/topic/board")
    public String processMove(String incomingFenStr) {
        String cleanFen = incomingFenStr.replace("\"", "");
        Board board = new Board();
        board.loadFromFen(cleanFen);

        if (board.isMated() || board.isDraw()) {
            return board.getFen();
        }

        // 1. Check the Opening Book FIRST
        Move bestMove = openingBook.getBookMove(board);
        // 2. If no book move is found, turn on the Minimax engine (Depth 5)
        if (bestMove == null) {
            System.out.println("No book move found. AI is thinking...");
            bestMove = ai.findBestMove(board, 5);
        } else {
            System.out.println("📖 Book move played instantly!");
        }

        // 3. Execute the move
        if (bestMove != null) {
            board.doMove(bestMove);
        }

        return board.getFen();
    }
}