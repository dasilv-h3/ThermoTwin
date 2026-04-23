"""
GPTT-74 - Preprocessing et augmentation du dataset thermique
"""
import numpy as np
from tensorflow.keras.utils import to_categorical


def normalize(X: np.ndarray) -> np.ndarray:
    """Normalisation pixel [0-255] -> [0-1]"""
    return X.astype('float32') / 255.0


def augment(X: np.ndarray) -> np.ndarray:
    """Augmentation : flip horizontal + bruit aléatoire"""
    augmented = []
    for img in X:
        if np.random.rand() > 0.5:
            img = np.fliplr(img)
        noise = np.random.normal(0, 0.01, img.shape)
        img = np.clip(img + noise, 0, 1)
        augmented.append(img)
    return np.array(augmented)


def preprocess(X_train, X_test, y_train, y_test, num_classes=7):
    """Pipeline complet : normalize + augment + one-hot encode"""
    X_train = normalize(X_train)
    X_test = normalize(X_test)

    X_train = augment(X_train)

    y_train = to_categorical(y_train, num_classes)
    y_test = to_categorical(y_test, num_classes)

    print(f"Preprocessing OK — X_train: {X_train.shape}, y_train: {y_train.shape}")
    return X_train, X_test, y_train, y_test


if __name__ == "__main__":
    from app.ai.ml.dataset import load_dataset
    X_train, X_test, y_train, y_test = load_dataset()
    X_train, X_test, y_train, y_test = preprocess(X_train, X_test, y_train, y_test)