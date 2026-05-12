"""
GPTT-196 - 3 maisons types pour la démo
Pavillon récent / Appartement ancien / Maison mal isolée
"""

DEMO_HOUSES = {
    "pavillon_recent": {
        "id": "demo_001",
        "name": "Pavillon récent — Sophie Martin",
        "type": "Pavillon",
        "surface": 120,
        "construction_year": 2015,
        "heating_type": "pompe_a_chaleur",
        "postal_code": "75001",
        "thermal_score": 78,
        "dpe_class": "B",
        "heat_zones": [
            {
                "area": "fenêtres double vitrage",
                "severity": "low",
                "description": "Légère déperdition autour des joints",
            },
            {"area": "toit", "severity": "low", "description": "Isolation conforme aux normes RT2012"},
        ],
        "recommendations": [{"title": "Remplacement joints fenêtres", "cost": 300, "savings": 80, "roi": 3.75}],
        "overall_assessment": "Logement bien isolé conforme RT2012. Quelques améliorations mineures possibles.",
        "estimated_annual_savings": 80,
    },
    "appartement_ancien": {
        "id": "demo_002",
        "name": "Appartement ancien — Jean Dupont",
        "type": "Appartement",
        "surface": 65,
        "construction_year": 1972,
        "heating_type": "electrique",
        "postal_code": "69001",
        "thermal_score": 42,
        "dpe_class": "E",
        "heat_zones": [
            {"area": "murs extérieurs", "severity": "high", "description": "Pas d'isolation thermique par l'extérieur"},
            {
                "area": "fenêtres simple vitrage",
                "severity": "high",
                "description": "Simple vitrage années 70, déperdition majeure",
            },
            {"area": "plancher bas", "severity": "medium", "description": "Isolation insuffisante sous le plancher"},
        ],
        "recommendations": [
            {"title": "Isolation thermique extérieure", "cost": 15000, "savings": 1200, "roi": 12.5},
            {"title": "Remplacement fenêtres double vitrage", "cost": 4000, "savings": 600, "roi": 6.67},
            {"title": "Isolation plancher bas", "cost": 3000, "savings": 300, "roi": 10.0},
        ],
        "overall_assessment": "Logement énergivore typique des années 70. Travaux urgents recommandés.",
        "estimated_annual_savings": 2100,
    },
    "maison_mal_isolee": {
        "id": "demo_003",
        "name": "Maison mal isolée — Marie Lambert",
        "type": "Maison individuelle",
        "surface": 180,
        "construction_year": 1958,
        "heating_type": "fioul",
        "postal_code": "33000",
        "thermal_score": 18,
        "dpe_class": "G",
        "heat_zones": [
            {"area": "combles non isolés", "severity": "high", "description": "30% des pertes thermiques par le toit"},
            {
                "area": "murs en pierre sans isolation",
                "severity": "high",
                "description": "Murs anciens très conducteurs",
            },
            {
                "area": "fenêtres simple vitrage",
                "severity": "high",
                "description": "Simple vitrage partout, ponts thermiques majeurs",
            },
            {
                "area": "chaudière fioul vétuste",
                "severity": "high",
                "description": "Rendement < 70%, remplacement urgent",
            },
        ],
        "recommendations": [
            {"title": "Isolation combles perdus", "cost": 2500, "savings": 900, "roi": 2.78},
            {"title": "Remplacement chaudière par PAC", "cost": 12000, "savings": 2000, "roi": 6.0},
            {"title": "Isolation murs intérieure", "cost": 18000, "savings": 1500, "roi": 12.0},
            {"title": "Remplacement fenêtres triple vitrage", "cost": 8000, "savings": 800, "roi": 10.0},
        ],
        "overall_assessment": "Passoire thermique classée G. Rénovation globale indispensable. Éligible MaPrimeRénov.",
        "estimated_annual_savings": 5200,
    },
}


def get_demo_house(house_type: str) -> dict:
    """Retourne les données d'une maison type pour la démo."""
    return DEMO_HOUSES.get(house_type, DEMO_HOUSES["appartement_ancien"])


def get_all_demo_houses() -> list:
    """Retourne toutes les maisons types."""
    return list(DEMO_HOUSES.values())


if __name__ == "__main__":
    houses = get_all_demo_houses()
    print("=== 3 Maisons types ThermoTwin ===\n")
    for house in houses:
        print(f"🏠 {house['name']}")
        print(f"   DPE: {house['dpe_class']} | Score: {house['thermal_score']}/100")
        print(f"   Zones: {len(house['heat_zones'])} | Économies: {house['estimated_annual_savings']}€/an")
        print()
    print("3 maisons types ✅")
