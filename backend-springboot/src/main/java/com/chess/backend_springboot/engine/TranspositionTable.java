package com.chess.backend_springboot.engine;

import com.github.bhlangonijr.chesslib.move.Move;

public class TranspositionTable {
    // 1 million entries takes ~32MB of RAM. Very lightweight.
    private static final int TABLE_SIZE = 1000000; 
    private final TTEntry[] table = new TTEntry[TABLE_SIZE];

    public void store(long zobristKey, int depth, int score, HashType type, Move bestMove) {
        // Simple modulo hashing to find the array index
        int index = (int) (Math.abs(zobristKey) % TABLE_SIZE);
        
        // Always replace if the new depth is greater or equal (it's a better calculation)
        if (table[index] == null || table[index].depth <= depth) {
            table[index] = new TTEntry(zobristKey, depth, score, type, bestMove);
        }
    }

    public TTEntry probe(long zobristKey) {
        int index = (int) (Math.abs(zobristKey) % TABLE_SIZE);
        TTEntry entry = table[index];
        
        // Ensure the keys match exactly (handles hash collisions)
        if (entry != null && entry.zobristKey == zobristKey) {
            return entry;
        }
        return null;
    }

    public void clear() {
        for (int i = 0; i < TABLE_SIZE; i++) {
            table[i] = null;
        }
    }
}