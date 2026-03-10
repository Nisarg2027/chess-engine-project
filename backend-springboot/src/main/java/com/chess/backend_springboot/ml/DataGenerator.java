package com.chess.backend_springboot.ml;

import java.io.FileWriter;
import java.io.PrintWriter;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.game.Game;
import com.github.bhlangonijr.chesslib.game.GameResult;
import com.github.bhlangonijr.chesslib.move.MoveList;
import com.github.bhlangonijr.chesslib.pgn.PgnIterator;

public class DataGenerator {

    public static void generateDataset(String pgnFilePath, String outputCsvPath) {
        System.out.println("Starting Data Extraction...");
        
        try (PrintWriter writer = new PrintWriter(new FileWriter(outputCsvPath))) {
            // Write the CSV Headers
            writer.println("FEN,Result");

            // Use the memory-safe PgnIterator to stream the file
            PgnIterator games = new PgnIterator(pgnFilePath);
            int gameCount = 0;

            for (Game game : games) {
                // We must explicitly load the move text for each streamed game
                game.loadMoveText(); 

                // Map the result (1.0 = White Wins, -1.0 = Black Wins, 0.0 = Draw)
                double numericResult = 0.0;
                if (game.getResult() == GameResult.WHITE_WON) {
                    numericResult = 1.0;
                } else if (game.getResult() == GameResult.BLACK_WON) {
                    numericResult = -1.0;
                } else {
                    // Skip draws. They confuse basic ML models by muddying the win/loss signals.
                    continue; 
                }

                // Replay the game step-by-step
                Board board = new Board();
                MoveList moves = game.getHalfMoves();
                
                for (com.github.bhlangonijr.chesslib.move.Move move : moves) {
                    board.doMove(move);
                    
                    // Skip the first 10 moves (standard openings) to prevent overfitting
                    if (board.getMoveCounter() > 10) {
                        writer.println(board.getFen() + "," + numericResult);
                    }
                }
                
                gameCount++;
                if (gameCount % 100 == 0) {
                    System.out.println("Processed " + gameCount + " games...");
                }
            }
            
            System.out.println("✅ Dataset generated successfully! Total games processed: " + gameCount);

        } catch (Exception e) {
            System.err.println("❌ Error writing dataset: " + e.getMessage());
            e.printStackTrace();
        }
    }
}