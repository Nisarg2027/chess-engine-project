import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split

# 1. Map chess pieces to numerical values
piece_map = {
    'P': 1, 'N': 2, 'B': 3, 'R': 4, 'Q': 5, 'K': 6,
    'p': -1, 'n': -2, 'b': -3, 'r': -4, 'q': -5, 'k': -6
}

def fen_to_vector(fen):
    """Converts a FEN string into a flat 64-element numerical array."""
    board_part = fen.split(' ')[0]
    vector = []
    for char in board_part:
        if char.isdigit():
            # If it's a number, it represents empty squares. Add that many 0s.
            vector.extend([0] * int(char))
        elif char in piece_map:
            # If it's a piece, add its numerical value
            vector.append(piece_map[char])
        elif char == '/':
            continue
            
    # Ensure it's exactly 64 squares (sometimes edge cases exist in FENs)
    if len(vector) != 64:
        raise ValueError(f"Invalid FEN parsing. Got {len(vector)} squares.")
    return np.array(vector)

# 2. Load the Dataset
print("Loading dataset...")
# Make sure to copy your chess_dataset.csv into this Python folder!
df = pd.read_csv('chess_dataset.csv')

print(f"Loaded {len(df)} positions. Processing features...")

# 3. Apply the vectorization
X = np.stack(df['FEN'].apply(fen_to_vector).values)
y = df['Result'].values

# Split into Training and Validation sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# 4. Build the Neural Network Architecture
model = tf.keras.Sequential([
    tf.keras.layers.Dense(256, activation='relu', input_shape=(64,)),
    tf.keras.layers.Dropout(0.2), # Prevent overfitting to Kasparov's specific style
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(1, activation='tanh') # Outputs a continuous score between -1 and 1
])

# Compile the Regressor using Mean Squared Error (MSE)
model.compile(optimizer='adam', loss='mse', metrics=['mae'])

print("Starting Training Phase...")

# 5. Train the Model
history = model.fit(
    X_train, y_train,
    epochs=15,          # Passes through the dataset 15 times
    batch_size=64,      # Looks at 64 boards at a time
    validation_data=(X_test, y_test)
)

# 6. Export the Brain
model.save('chess_evaluator.keras')
print("✅ Model trained and saved as 'chess_evaluator.keras'!")