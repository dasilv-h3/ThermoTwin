"""
GPTT-197 - Résultats pré-calculés pour la démo
Heatmaps + recommandations des 3 maisons types
"""

from app.ai.colormap import score_to_color
from app.ai.demo_data import DEMO_HOUSES
from app.ai.heatmap_shader import generate_heatmap_data
from app.ai.roi_service import enrich_recommendations


def precompute_all_results() -> dict:
    """Pré-calcule heatmaps + recommandations pour les 3 maisons."""
    results = {}

    for key, house in DEMO_HOUSES.items():
        heatmap = generate_heatmap_data(thermal_score=house["thermal_score"], heat_zones=house["heat_zones"])
        recommendations = enrich_recommendations(house["recommendations"])
        score_color = score_to_color(house["thermal_score"])

        results[key] = {
            "name": house["name"],
            "dpe_class": house["dpe_class"],
            "thermal_score": house["thermal_score"],
            "score_color": score_color["hex"],
            "heatmap": heatmap,
            "recommendations": recommendations,
            "estimated_annual_savings": house["estimated_annual_savings"],
        }

    return results


if __name__ == "__main__":
    results = precompute_all_results()
    print("=== Résultats pré-calculés ===\n")
    for key, result in results.items():
        print(f"🏠 {result['name']}")
        print(f"   Score : {result['thermal_score']}/100 → {result['score_color']}")
        print(f"   DPE : {result['dpe_class']}")
        print(f"   Couleur globale heatmap : {result['heatmap']['overall_color']['hex']}")
        print(f"   Recommandations : {len(result['recommendations'])}")
        print(f"   Économies : {result['estimated_annual_savings']}€/an")
        print()
    print("Résultats pré-calculés ✅")
