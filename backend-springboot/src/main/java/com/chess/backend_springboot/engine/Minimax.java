package com.chess.backend_springboot.engine;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Piece;
import com.github.bhlangonijr.chesslib.move.Move;

public class Minimax {
    private final BoardEvaluator fastEvaluator = new BoardEvaluator();
    private final NeuralEvaluator smartEvaluator = new NeuralEvaluator();
    private final TranspositionTable tt = new TranspositionTable();
    private final Random random = new Random();

    private static class MoveScore {
        Move move;
        int score;
        MoveScore(Move move, int score) {
            this.move = move;
            this.score = score;
        }
    }

    // NEW: Accepts difficulty parameter to scale logic
    public Move findBestMove(Board board, int depth, String difficulty) {
        tt.clear(); 

        List<Move> legalMoves = board.legalMoves();
        if (legalMoves.isEmpty()) return null;

        // --- EASY MODE: The "Blunder" Factor ---
        // A real beginner doesn't always play the mathematically best move. 
        // 25% chance to play a completely random move (hangs pieces, misses mates).
        if ("easy".equalsIgnoreCase(difficulty) && random.nextInt(100) < 25) {
            return legalMoves.get(random.nextInt(legalMoves.size()));
        }
        
        // 1. FAST ENGINE: Calculate the Minimax score for every root move
        List<MoveScore> evaluatedMoves = legalMoves.parallelStream().map(move -> {
            Board threadBoard = board.clone();
            threadBoard.doMove(move);
            
            int score = minimax(threadBoard, depth - 1, Integer.MIN_VALUE, Integer.MAX_VALUE, false);
            return new MoveScore(move, score);
        })
        .sorted((ms1, ms2) -> Integer.compare(ms2.score, ms1.score))
        .collect(Collectors.toList());

        if (evaluatedMoves.isEmpty()) return null;

        // --- EASY / MEDIUM MODE: Bypass the Neural Network ---
        if ("easy".equalsIgnoreCase(difficulty) || "medium".equalsIgnoreCase(difficulty)) {
            // Easy Mode has an extra human flaw: 40% chance to pick the 2nd best move instead of the best one.
            if ("easy".equalsIgnoreCase(difficulty) && evaluatedMoves.size() > 1 && random.nextInt(100) < 40) {
                return evaluatedMoves.get(1).move;
            }
            // Medium relies strictly on raw tactical calculation (Depth 3)
            return evaluatedMoves.get(0).move;
        }

        // --- HARD MODE: THE NEURAL JURY ---
        int candidatesToConsider = Math.min(3, evaluatedMoves.size());
        List<MoveScore> topCandidates = evaluatedMoves.subList(0, candidatesToConsider);

        Move bestStrategicMove = topCandidates.get(0).move;
        int bestNeuralScore = Integer.MIN_VALUE;

        for (MoveScore candidate : topCandidates) {
            board.doMove(candidate.move);
            int neuralScore = smartEvaluator.evaluate(board);
            board.undoMove();

            if (neuralScore > bestNeuralScore) {
                bestNeuralScore = neuralScore;
                bestStrategicMove = candidate.move;
            }
        }

        return bestStrategicMove;
    }

    private int minimax(Board board, int depth, int alpha, int beta, boolean isMaximizing) {
        int originalAlpha = alpha;
        long zobristKey = board.getZobristKey();

        TTEntry entry = tt.probe(zobristKey);
        if (entry != null && entry.depth >= depth) {
            if (entry.type == HashType.EXACT) return entry.score;
            if (entry.type == HashType.ALPHA && entry.score <= alpha) return entry.score;
            if (entry.type == HashType.BETA && entry.score >= beta) return entry.score;
        }

        if (board.isMated() || board.isDraw()) {
            return fastEvaluator.evaluate(board); 
        }

        if (depth == 0) {
            int standPat = fastEvaluator.evaluate(board);
            return quiescenceSearch(board, alpha, beta, isMaximizing, standPat);
        }

        int bestScore = isMaximizing ? Integer.MIN_VALUE : Integer.MAX_VALUE;
        Move bestMove = null;

        List<Move> moves = board.legalMoves();
        moves.sort((m1, m2) -> {
            boolean c1 = board.getPiece(m1.getTo()) != Piece.NONE;
            boolean c2 = board.getPiece(m2.getTo()) != Piece.NONE;
            return Boolean.compare(c2, c1);
        });

        for (Move move : moves) {
            board.doMove(move);
            int score = minimax(board, depth - 1, alpha, beta, !isMaximizing);
            board.undoMove();

            if (isMaximizing) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, bestScore);
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                beta = Math.min(beta, bestScore);
            }

            if (beta <= alpha) break; 
        }

        HashType hashType = HashType.EXACT;
        if (bestScore <= originalAlpha) hashType = HashType.ALPHA;
        else if (bestScore >= beta) hashType = HashType.BETA;
        
        tt.store(zobristKey, depth, bestScore, hashType, bestMove);

        return bestScore;
    }

    private int quiescenceSearch(Board board, int alpha, int beta, boolean isMaximizing, int standPat) {
        if (isMaximizing) {
            if (standPat >= beta) return beta;
            if (standPat > alpha) alpha = standPat;
            for (Move move : board.legalMoves()) {
                if (board.getPiece(move.getTo()) != Piece.NONE) {
                    board.doMove(move);
                    int nextStandPat = fastEvaluator.evaluate(board);
                    int score = quiescenceSearch(board, alpha, beta, false, nextStandPat);
                    board.undoMove();
                    if (score >= beta) return beta;
                    if (score > alpha) alpha = score;
                }
            }
            return alpha;
        } else {
            if (standPat <= alpha) return alpha;
            if (standPat < beta) beta = standPat;
            for (Move move : board.legalMoves()) {
                if (board.getPiece(move.getTo()) != Piece.NONE) {
                    board.doMove(move);
                    int nextStandPat = fastEvaluator.evaluate(board);
                    int score = quiescenceSearch(board, alpha, beta, true, nextStandPat);
                    board.undoMove();
                    if (score <= alpha) return alpha;
                    if (score < beta) beta = score;
                }
            }
            return beta;
        }
    }
}