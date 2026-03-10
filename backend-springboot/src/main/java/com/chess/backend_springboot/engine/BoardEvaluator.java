package com.chess.backend_springboot.engine;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Piece;
import com.github.bhlangonijr.chesslib.Side;
import com.github.bhlangonijr.chesslib.Square;

public class BoardEvaluator {

    // Standard piece values
    private static final int PAWN_VALUE = 100;
    private static final int KNIGHT_VALUE = 320;
    private static final int BISHOP_VALUE = 330;
    private static final int ROOK_VALUE = 500;
    private static final int QUEEN_VALUE = 900;
    private static final int KING_VALUE = 20000;

    public int evaluate(Board board) {
        int score = 0;
        for (int i = 0; i < 64; i++) {
            Piece piece = board.getPiece(Square.values()[i]);
            if (piece == Piece.NONE)
                continue;

            int value = getPieceValue(piece);
            int pstValue = getPstValue(piece, i);

            if (piece.getPieceSide() == Side.BLACK) {
                score += (value + pstValue);
            } else {
                score -= (value + pstValue);
            }
        }
        return score;
    }

    private int getPstValue(Piece piece, int squareIndex) {
        int row = squareIndex / 8;
        int col = squareIndex % 8;

        // For Black pieces, we flip the table vertically
        if (piece.getPieceSide() == Side.BLACK)
            row = 7 - row;

        return switch (piece.getPieceType()) {
            case KNIGHT -> EvaluationConstants.KNIGHT_PST[row][col];
            case PAWN -> EvaluationConstants.PAWN_PST[row][col];
            default -> 0;
        };
    }

    private int getPieceValue(Piece piece) {
        return switch (piece.getPieceType()) {
            case PAWN -> PAWN_VALUE;
            case KNIGHT -> KNIGHT_VALUE;
            case BISHOP -> BISHOP_VALUE;
            case ROOK -> ROOK_VALUE;
            case QUEEN -> QUEEN_VALUE;
            case KING -> KING_VALUE;
            default -> 0;
        };
    }
}