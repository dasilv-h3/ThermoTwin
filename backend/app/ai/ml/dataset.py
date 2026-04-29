"""
GPTT-73 - Collecte et gestion du dataset thermique
Utilise des images publiques pour simuler un dataset DPE
"""

from typing import Tuple

import numpy as np

# Classes DPE : A=0, B=1, C=2, D=3, E=4, F=5, G=6
DPE_CLASSES = ["A", "B", "C", "D", "E", "F", "G"]
IMG_SIZE = (224, 224)


def generate_synthetic_dataset(n_samples: int = 200) -> Tuple[np.ndarray, np.ndarray]:
    """
    GPTT-73 — Génère un dataset synthétique d'images thermiques.
    En prod, on remplacerait par de vraies images ADEME/DPE.
    """
    np.random.seed(42)
    X = []
    y = []

    for i in range(n_samples):
        label = i % len(DPE_CLASSES)

        # Simule une image thermique avec gradient de couleur selon DPE
        # DPE F/G = plus rouge (chaud = mauvaise isolation)
        # DPE A/B = plus bleu (froid = bonne isolation)
        r = int(50 + (label / 6) * 200)
        g = int(100 - (label / 6) * 50)
        b = int(200 - (label / 6) * 150)

        img = np.random.randint(low=max(0, r - 30), high=min(255, r + 30), size=(224, 224, 3), dtype=np.uint8)
        img[:, :, 1] = np.random.randint(max(0, g - 30), min(255, g + 30), (224, 224))
        img[:, :, 2] = np.random.randint(max(0, b - 30), min(255, b + 30), (224, 224))

        X.append(img)
        y.append(label)

    return np.array(X), np.array(y)


def load_dataset() -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Charge et split le dataset en train/test (80/20)
    """
    from sklearn.model_selection import train_test_split

    X, y = generate_synthetic_dataset(n_samples=300)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"Dataset chargé: {len(X_train)} train, {len(X_test)} test")
    print(f"Classes: {DPE_CLASSES}")

    return X_train, X_test, y_train, y_test


if __name__ == "__main__":
    X_train, X_test, y_train, y_test = load_dataset()
    print(f"Shape X_train: {X_train.shape}")
    print(f"Shape y_train: {y_train.shape}")
