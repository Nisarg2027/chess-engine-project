package com.chess.backend_springboot.engine;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Piece;
import com.github.bhlangonijr.chesslib.Square;

import java.util.Collections;

public class NeuralEvaluator {
    private OrtEnvironment env;
    private OrtSession session;

    public NeuralEvaluator() {
        try {
            env = OrtEnvironment.getEnvironment();
            // Load the ONNX model from the resources folder
            String modelPath = getClass().getClassLoader().getResource("chess_evaluator.onnx").getPath();
            
            // On Windows, getPath() sometimes prepends a slash (e.g., /C:/...). We strip it.
            if (System.getProperty("os.name").toLowerCase().contains("win") && modelPath.startsWith("/")) {
                modelPath = modelPath.substring(1);
            }
            
            session = env.createSession(modelPath, new OrtSession.SessionOptions());
            System.out.println("🧠 Neural Network loaded into Java successfully!");
        } catch (Exception e) {
            System.err.println("Failed to load ONNX model: " + e.getMessage());
        }
    }

    public int evaluate(Board board) {
        try {
            // 1. Convert the board to the exact 64-element float array our Python model expects
            float[][] inputMatrix = new float[1][64];
            for (int i = 0; i < 64; i++) {
                Piece piece = board.getPiece(Square.values()[i]);
                inputMatrix[0][i] = getNumericValue(piece);
            }

            // 2. Create the ONNX Tensor
            OnnxTensor tensor = OnnxTensor.createTensor(env, inputMatrix);

            // 3. Run the Neural Network Inference
            OrtSession.Result result = session.run(Collections.singletonMap("input", tensor));
            
            // 4. Extract the prediction (which is a float between -1.0 and 1.0)
            float[][] output = (float[][]) result.get(0).getValue();
            float prediction = output[0][0];

            // Clean up memory to prevent leaks during the millions of Minimax iterations
            tensor.close();
            result.close();

            // 5. Scale it up for Minimax (e.g., 1.0 becomes 1000 points)
            return (int) (prediction * 1000);

        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    // Maps chesslib pieces to the exact integers we used in our Python training script
    private float getNumericValue(Piece piece) {
        if (piece == Piece.NONE) return 0f;
        
        float val = switch (piece.getPieceType()) {
            case PAWN -> 1f;
            case KNIGHT -> 2f;
            case BISHOP -> 3f;
            case ROOK -> 4f;
            case QUEEN -> 5f;
            case KING -> 6f;
            default -> 0f;
        };
        return piece.getPieceSide() == com.github.bhlangonijr.chesslib.Side.WHITE ? val : -val;
    }
}