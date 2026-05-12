"""
GPTT-49 - Rendu heatmap shader
Fragment shader gradient thermique : bleu (froid) → rouge (chaud)
"""

from typing import Tuple


def thermal_color(value: float) -> Tuple[int, int, int]:
    """
    Mappe une valeur [0.0 - 1.0] vers une couleur RGB thermique.
    0.0 = bleu (bonne isolation)
    0.5 = jaune/vert (isolation moyenne)
    1.0 = rouge (mauvaise isolation)
    """
    value = max(0.0, min(1.0, value))

    if value < 0.25:
        # Bleu → Cyan
        t = value / 0.25
        r = 0
        g = int(255 * t)
        b = 255
    elif value < 0.5:
        # Cyan → Vert
        t = (value - 0.25) / 0.25
        r = 0
        g = 255
        b = int(255 * (1 - t))
    elif value < 0.75:
        # Vert → Jaune
        t = (value - 0.5) / 0.25
        r = int(255 * t)
        g = 255
        b = 0
    else:
        # Jaune → Rouge
        t = (value - 0.75) / 0.25
        r = 255
        g = int(255 * (1 - t))
        b = 0

    return (r, g, b)


def apply_thermal_shader(heat_zones: list) -> list:
    """
    Applique le shader thermique sur les zones détectées par Groq Vision.
    Input : liste de zones avec severity (low/medium/high)
    Output : même liste avec couleur RGB ajoutée
    """
    severity_map = {"low": 0.2, "medium": 0.6, "high": 0.9}

    result = []
    for zone in heat_zones:
        severity = zone.get("severity", "low")
        value = severity_map.get(severity, 0.5)
        r, g, b = thermal_color(value)

        result.append({**zone, "color_rgb": (r, g, b), "color_hex": f"#{r:02x}{g:02x}{b:02x}", "thermal_value": value})

    return result


def generate_heatmap_data(thermal_score: int, heat_zones: list) -> dict:
    """
    Génère les données complètes pour le rendu heatmap frontend.
    """
    zones_colored = apply_thermal_shader(heat_zones)
    overall_value = 1.0 - (thermal_score / 100)
    overall_color = thermal_color(overall_value)

    return {
        "overall_color": {
            "rgb": overall_color,
            "hex": f"#{overall_color[0]:02x}{overall_color[1]:02x}{overall_color[2]:02x}",
        },
        "zones": zones_colored,
        "legend": {"cold": "#0000ff", "medium": "#00ff00", "hot": "#ff0000"},
    }


if __name__ == "__main__":
    # Test avec les données de fenetre.jpeg
    heat_zones = [
        {"area": "fenêtre", "severity": "high", "description": "Déperdition importante"},
        {"area": "mur nord", "severity": "medium", "description": "Isolation insuffisante"},
        {"area": "sol", "severity": "low", "description": "Bonne isolation"},
    ]

    result = generate_heatmap_data(thermal_score=40, heat_zones=heat_zones)

    print(f"Couleur globale : {result['overall_color']['hex']}")
    print("\nZones colorées :")
    for zone in result["zones"]:
        print(f"  {zone['area']} ({zone['severity']}) → {zone['color_hex']}")
    print("\nRendu heatmap shader ✅")
