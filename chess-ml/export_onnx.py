import tensorflow as tf
import tf2onnx

# Load your trained Keras model
model = tf.keras.models.load_model('chess_evaluator.keras')

# Convert to ONNX
spec = (tf.TensorSpec((None, 64), tf.float32, name="input"),)
output_path = "chess_evaluator.onnx"
model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec, output_path=output_path)

print("✅ Successfully exported to chess_evaluator.onnx!")