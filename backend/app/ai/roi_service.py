from typing import Dict, List

# Règles métier : priorité isolation (combles > murs > fenêtres)
TRAVAUX_PRIORITY = {
    "isolation combles": 1,
    "isolation murs": 2,
    "changement fenêtres": 3,
    "isolation sol": 4,
    "chaudière": 5,
    "pompe à chaleur": 6,
}

# Prix moyens 2024 en euros
TRAVAUX_COSTS = {
    "isolation combles": {"min": 1500, "max": 3000, "unit": "forfait"},
    "isolation murs": {"min": 8000, "max": 20000, "unit": "forfait"},
    "changement fenêtres": {"min": 500, "max": 1200, "unit": "par fenêtre"},
    "isolation sol": {"min": 3000, "max": 8000, "unit": "forfait"},
    "chaudière": {"min": 3000, "max": 6000, "unit": "forfait"},
    "pompe à chaleur": {"min": 8000, "max": 15000, "unit": "forfait"},
}


def calculate_roi_score(savings: float, cost: float) -> float:
    """Score ROI = économies annuelles / coût travaux. Plus c'est élevé, mieux c'est."""
    if cost == 0:
        return 0
    return round(savings / cost, 4)


def get_priority(title: str) -> int:
    """Retourne la priorité d'un travail selon les règles métier."""
    title_lower = title.lower()
    for key, priority in TRAVAUX_PRIORITY.items():
        if key in title_lower:
            return priority
    return 99  # Priorité basse si inconnu


def enrich_recommendations(recommendations: List[Dict]) -> List[Dict]:
    """
    Enrichit et trie les recommandations par score ROI et priorité métier.
    Input : liste de recommandations depuis analyzer.py
    Output : liste triée avec score ROI + priorité ajoutés
    """
    enriched = []

    for rec in recommendations:
        cost = rec.get("cost", 0)
        savings = rec.get("savings", 0)
        roi_years = rec.get("roi", 0)

        roi_score = calculate_roi_score(savings, cost)
        priority = get_priority(rec.get("title", ""))

        enriched.append(
            {
                **rec,
                "roi_score": roi_score,
                "priority": priority,
                "roi_years": roi_years,
                "payback_label": f"Remboursé en {roi_years:.1f} ans" if roi_years > 0 else "N/A",
            }
        )

    # Trier par priorité métier d'abord, puis par ROI score décroissant
    enriched.sort(key=lambda x: (x["priority"], -x["roi_score"]))

    return enriched


def generate_action_plan(recommendations: List[Dict], budget: float = None) -> Dict:
    """
    Génère un plan d'action priorisé selon le budget disponible.
    Si pas de budget, retourne toutes les recommandations triées.
    """
    enriched = enrich_recommendations(recommendations)

    if budget is None:
        return {
            "plan": enriched,
            "total_cost": sum(r["cost"] for r in enriched),
            "total_savings": sum(r["savings"] for r in enriched),
            "budget_used": None,
        }

    # Sélection selon budget
    selected = []
    budget_remaining = budget

    for rec in enriched:
        if rec["cost"] <= budget_remaining:
            selected.append(rec)
            budget_remaining -= rec["cost"]

    return {
        "plan": selected,
        "total_cost": sum(r["cost"] for r in selected),
        "total_savings": sum(r["savings"] for r in selected),
        "budget_used": budget - budget_remaining,
        "budget_remaining": budget_remaining,
    }
