import os
import sys
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.optimizers import Adam
import numpy as np

# Add the backend directory to the path to import models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from models import db, TrainingResult

def write_progress(progress, message):
    with open('progress.txt', 'w') as f:
        f.write(f"{progress}\n{message}")

def train_and_evaluate_models():
    write_progress(0, "Starting training...")

    # For demonstration, create dummy data
    # In real scenario, load from database
    np.random.seed(42)
    n_samples = 1000

    # RF Classification data
    X_clf = np.random.rand(n_samples, 10)
    y_clf = np.random.randint(0, 2, n_samples)

    X_train_clf, X_test_clf, y_train_clf, y_test_clf = train_test_split(X_clf, y_clf, test_size=0.2, random_state=42)

    write_progress(10, "Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train_clf, y_train_clf)

    y_pred_clf = rf_model.predict(X_test_clf)
    rf_accuracy = accuracy_score(y_test_clf, y_pred_clf)
    rf_precision = precision_score(y_test_clf, y_pred_clf, average='weighted')
    rf_recall = recall_score(y_test_clf, y_pred_clf, average='weighted')
    rf_f1 = f1_score(y_test_clf, y_pred_clf, average='weighted')

    write_progress(50, "Random Forest training completed. Training LSTM...")

    # LSTM Regression data
    X_reg = np.random.rand(n_samples, 10, 1)  # Sequence data
    y_reg = np.random.rand(n_samples)

    X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)

    lstm_model = Sequential()
    lstm_model.add(LSTM(50, input_shape=(10, 1)))
    lstm_model.add(Dense(1))
    lstm_model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')

    lstm_model.fit(X_train_reg, y_train_reg, epochs=10, batch_size=32, verbose=0)

    y_pred_reg = lstm_model.predict(X_test_reg)
    lstm_mse = np.mean((y_test_reg - y_pred_reg.flatten())**2)
    lstm_mae = np.mean(np.abs(y_test_reg - y_pred_reg.flatten()))

    write_progress(90, "LSTM training completed. Saving results...")

    # Save to database
    from app import app
    with app.app_context():
        with db.session.begin():
            rf_result = TrainingResult(
                model_type='rf',
                accuracy=rf_accuracy,
                precision=rf_precision,
                recall=rf_recall,
                f1_score=rf_f1
            )
            db.session.add(rf_result)

            lstm_result = TrainingResult(
                model_type='lstm',
                mse=lstm_mse,
                mae=lstm_mae
            )
            db.session.add(lstm_result)

    write_progress(100, "Training completed successfully.")

if __name__ == "__main__":
    train_and_evaluate_models()
