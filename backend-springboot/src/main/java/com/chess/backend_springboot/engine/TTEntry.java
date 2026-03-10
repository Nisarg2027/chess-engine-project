package com.chess.backend_springboot.engine;

import com.github.bhlangonijr.chesslib.move.Move;

public class TTEntry {
    public long zobristKey;
    public int depth;
    public int score;
    public HashType type;
    public Move bestMove;

    public TTEntry(long zobristKey, int depth, int score, HashType type, Move bestMove) {
        this.zobristKey = zobristKey;
        this.depth = depth;
        this.score = score;
        this.type = type;
        this.bestMove = bestMove;
    }
}