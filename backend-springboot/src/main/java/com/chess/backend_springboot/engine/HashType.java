package com.chess.backend_springboot.engine;

public enum HashType {
    EXACT,      // We know the exact score of this board
    ALPHA,      // Upper bound (the score is at most this value)
    BETA        // Lower bound (the score is at least this value)
}   