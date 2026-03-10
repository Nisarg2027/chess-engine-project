import tensorflow as tf
import tf2onnx

print("1. Loading Keras model...")
model = tf.keras.models.load_model('chess_evaluator.keras')

print("2. Wrapping model in tf.function...")
@tf.function(input_signature=[tf.TensorSpec(shape=(None, 64), dtype=tf.float32, name="input")])
def model_predict(inputs):
    return model(inputs)

print("3. Converting function to ONNX...")
output_path = "chess_evaluator.onnx"

# Pass the tf.function itself, NOT the concrete function!
model_proto, _ = tf2onnx.convert.from_function(
    model_predict, 
    input_signature=[tf.TensorSpec(shape=(None, 64), dtype=tf.float32, name="input")],
    output_path=output_path
)

print(f"✅ Successfully exported to {output_path}!")