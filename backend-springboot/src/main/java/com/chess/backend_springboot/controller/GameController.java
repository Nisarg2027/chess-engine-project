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

        String difficulty = request.getDifficulty() != null ? request.getDifficulty() : "hard";
        int searchDepth = 5; 
        
        if ("easy".equalsIgnoreCase(difficulty)) searchDepth = 1;
        else if ("medium".equalsIgnoreCase(difficulty)) searchDepth = 3;

        Move bestMove = null;
        
        // Disable Opening Book for Easy mode so it plays like a true beginner
        if (!"easy".equalsIgnoreCase(difficulty)) {
            bestMove = openingBook.getBookMove(board); 
        }

        // Pass the difficulty into our newly upgraded Minimax router
        if (bestMove == null) {
            bestMove = ai.findBestMove(board, searchDepth, difficulty); 
        }

        if (bestMove != null) {
            String aiMoveStr = bestMove.toString(); 
            board.doMove(bestMove);
            
            String payload = "{\"move\":\"" + aiMoveStr + "\", \"fen\":\"" + board.getFen() + "\"}";
            messagingTemplate.convertAndSend("/topic/board", payload);
        }
    }

    // NOTE: If you implemented the secure RoomState logic earlier for Tournaments, 
    // you will eventually combine this method with the ChessWebSocketController we built!
    @MessageMapping("/room/move")
    public void processRoomMove(RoomMoveRequest request) {
        String cleanData = request.getFen().replace("\"", ""); 
        roomManager.updateRoom(request.getRoomId(), cleanData);
        messagingTemplate.convertAndSend("/topic/room/" + request.getRoomId(), cleanData);
    }
}