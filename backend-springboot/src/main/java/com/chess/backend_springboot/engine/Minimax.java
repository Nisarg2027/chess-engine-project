package com.chess.backend_springboot.engine;

import java.util.List;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.move.Move;

public class Minimax {
    private final BoardEvaluator evaluator = new BoardEvaluator();

    public Move findBestMove(Board board, int depth) {
        List<Move> possibleMoves = board.legalMoves();
        Move bestMove = null;
        int bestValue = Integer.MIN_VALUE;

        for (Move move : possibleMoves) {
            board.doMove(move);
            // We want the move that results in the lowest score for the opponent
            int boardValue = minimax(board, depth - 1, false);
            board.undoMove();

            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
        return bestMove;
    }

    private int minimax(Board board, int depth, boolean isMaximizingPlayer) {
        if (depth == 0 || board.isMated() || board.isDraw()) {
            return evaluator.evaluate(board);
        }

        if (isMaximizingPlayer) {
            int maxEval = Integer.MIN_VALUE;
            for (Move move : board.legalMoves()) {
                board.doMove(move);
                maxEval = Math.max(maxEval, minimax(board, depth - 1, false));
                board.undoMove();
            }
            return maxEval;
        } else {
            int minEval = Integer.MAX_VALUE;
            for (Move move : board.legalMoves()) {
                board.doMove(move);
                minEval = Math.min(minEval, minimax(board, depth - 1, true));
                board.undoMove();
            }
            return minEval;
        }
    }
}