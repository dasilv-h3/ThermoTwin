"""
GPTT-59 - Gradient colormap
Bleu (froid) → Rouge (chaud)
"""

from typing import List, Tuple


def get_colormap_color(value: float, colormap: str = "thermal") -> Tuple[int, int, int]:
    """
    Retourne une couleur RGB selon la valeur [0.0 - 1.0] et le colormap choisi.
    thermal: bleu → cyan → vert → jaune → rouge
    hot: noir → rouge → jaune → blanc
    cool: cyan → magenta
    """
    value = max(0.0, min(1.0, value))

    if colormap == "thermal":
        colors = [
            (0, 0, 255),  # 0.0 — bleu
            (0, 255, 255),  # 0.25 — cyan
            (0, 255, 0),  # 0.5 — vert
            (255, 255, 0),  # 0.75 — jaune
            (255, 0, 0),  # 1.0 — rouge
        ]
    elif colormap == "hot":
        colors = [
            (0, 0, 0),
            (255, 0, 0),
            (255, 255, 0),
            (255, 255, 255),
        ]
    elif colormap == "cool":
        colors = [
            (0, 255, 255),
            (255, 0, 255),
        ]
    else:
        colors = [(0, 0, 255), (255, 0, 0)]

    n = len(colors) - 1
    idx = value * n
    low = int(idx)
    high = min(low + 1, n)
    t = idx - low

    r = int(colors[low][0] * (1 - t) + colors[high][0] * t)
    g = int(colors[low][1] * (1 - t) + colors[high][1] * t)
    b = int(colors[low][2] * (1 - t) + colors[high][2] * t)

    return (r, g, b)


def generate_colormap_gradient(steps: int = 10, colormap: str = "thermal") -> List[dict]:
    """Génère un gradient complet avec N étapes pour la légende."""
    gradient = []
    for i in range(steps):
        value = i / (steps - 1)
        r, g, b = get_colormap_color(value, colormap)
        gradient.append(
            {
                "value": round(value, 2),
                "rgb": (r, g, b),
                "hex": f"#{r:02x}{g:02x}{b:02x}",
                "label": f"{int(value * 100)}%",
            }
        )
    return gradient


def score_to_color(thermal_score: int, colormap: str = "thermal") -> dict:
    """Convertit un score thermique /100 en couleur."""
    value = 1.0 - (thermal_score / 100)
    r, g, b = get_colormap_color(value, colormap)
    return {"score": thermal_score, "value": value, "rgb": (r, g, b), "hex": f"#{r:02x}{g:02x}{b:02x}"}


if __name__ == "__main__":
    print("=== Gradient colormap thermique ===")
    gradient = generate_colormap_gradient(steps=5)
    for step in gradient:
        print(f"  {step['label']} → {step['hex']}")

    print("\n=== Score thermique → couleur ===")
    for score in [90, 60, 40, 20]:
        result = score_to_color(score)
        print(f"  Score {score}/100 → {result['hex']}")

    print("\nGradient colormap ✅")
