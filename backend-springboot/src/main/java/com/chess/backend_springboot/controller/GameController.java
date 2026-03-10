package com.chess.backend_springboot.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.chess.backend_springboot.engine.Minimax;
import com.chess.backend_springboot.engine.OpeningBook;
import com.chess.backend_springboot.engine.RoomManager;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.move.Move;

@Controller
public class GameController {
    private final Minimax ai = new Minimax();
    private final OpeningBook openingBook = new OpeningBook();
    
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomManager roomManager;

    public GameController(SimpMessagingTemplate messagingTemplate, RoomManager roomManager) {
        this.messagingTemplate = messagingTemplate;
        this.roomManager = roomManager;
    }

    @MessageMapping("/move")
    public void processMove(MoveRequest request) {
        String cleanFen = request.getFen().replace("\"", "");
        Board board = new Board();
        board.loadFromFen(cleanFen);

        if (board.isMated() || board.isDraw()) {
            messagingTemplate.convertAndSend("/topic/board", "{\"fen\":\"" + board.getFen() + "\"}");
            return;
        }

        int searchDepth = 5; 
        if ("easy".equalsIgnoreCase(request.getDifficulty())) searchDepth = 1;
        else if ("medium".equalsIgnoreCase(request.getDifficulty())) searchDepth = 3;

        Move bestMove = openingBook.getBookMove(board); 
        if (bestMove == null) {
            bestMove = ai.findBestMove(board, searchDepth); 
        }

        if (bestMove != null) {
            String aiMoveStr = bestMove.toString(); // Retrieves the LAN string, e.g., e7e5
            board.doMove(bestMove);
            
            // NEW: Send both the move and the new FEN back as JSON
            String payload = "{\"move\":\"" + aiMoveStr + "\", \"fen\":\"" + board.getFen() + "\"}";
            messagingTemplate.convertAndSend("/topic/board", payload);
        }
    }

    @MessageMapping("/room/move")
    public void processRoomMove(RoomMoveRequest request) {
        // In multiplayer, this now holds the full PGN history string
        String cleanData = request.getFen().replace("\"", ""); 
        roomManager.updateRoom(request.getRoomId(), cleanData);
        messagingTemplate.convertAndSend("/topic/room/" + request.getRoomId(), cleanData);
    }
}