"""Tests du générateur PDF (logique pure — rend différents payloads sans crash)."""

from app.ai.report_service import generate_pdf_report


def test_generate_with_minimal_payload():
    pdf = generate_pdf_report({})
    data = pdf.getvalue()
    assert data.startswith(b"%PDF-"), "Output must be a valid PDF"


def test_generate_with_full_payload():
    pdf = generate_pdf_report(
        {
            "location_label": "Pavillon Le Mans",
            "scan_date": "12/05/2026 14:30",
            "dpe_class": "D",
            "dpe_consumption": 185,
            "dpe_emissions": 28,
            "thermal_score": 62,
            "thermal_stats": {"min_celsius": 12.5, "max_celsius": 22.1, "mean_celsius": 17.8},
            "overall_assessment": "Logement avec des pertes thermiques modérées.",
            "estimated_annual_savings": 850,
            "heat_zones": [
                {"area": "Fenêtre salon", "severity": "high", "description": "Joints usés"},
                {"area": "Plafond chambre", "severity": "medium", "description": "Isolation faible"},
            ],
            "recommendations": [
                {"title": "Remplacer joints fenêtres", "cost": 200, "savings": 80, "roi": 2.5},
                {"title": "Isolation combles", "cost": 4500, "savings": 600, "roi": 7.5},
            ],
            "artisans": [
                {
                    "company_name": "EcoRénov Le Mans",
                    "distance_km": 2.3,
                    "specialties": ["iso_thermique", "fenetres"],
                    "phone": "0243000000",
                },
            ],
        }
    )
    data = pdf.getvalue()
    assert data.startswith(b"%PDF-")
    assert len(data) > 2000  # Un PDF significatif


def test_generate_handles_missing_optional_sections():
    pdf = generate_pdf_report({"location_label": "Test", "dpe_class": "A"})
    assert pdf.getvalue().startswith(b"%PDF-")
