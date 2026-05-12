import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_pdf_report(scan_data: dict, output_path: str = None) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontSize=24,
        textColor=colors.HexColor("#1B4F72"),
        spaceAfter=30,
        alignment=TA_CENTER,
    )

    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=16,
        textColor=colors.HexColor("#1B4F72"),
        spaceAfter=12,
    )

    # Titre
    story.append(Paragraph("ThermoTwin - Rapport de Diagnostic Thermique", title_style))
    story.append(Spacer(1, 0.3 * inch))

    # Infos générales
    story.append(Paragraph("Informations Générales", heading_style))

    date_str = scan_data.get("scan_date") or datetime.now().strftime("%d/%m/%Y %H:%M")
    location = scan_data.get("location_label", "—")
    dpe = scan_data.get("dpe_class", "N/A")
    score = scan_data.get("thermal_score", 0)
    dpe_conso = scan_data.get("dpe_consumption")
    dpe_ges = scan_data.get("dpe_emissions")

    info_data = [
        ["Date du scan:", date_str],
        ["Logement:", location],
        ["Classe DPE:", dpe],
        ["Score thermique:", f"{score}/100" if score else "N/A"],
    ]
    if dpe_conso is not None:
        info_data.append(["Conso énergétique:", f"{dpe_conso:.0f} kWhEP/m²·an"])
    if dpe_ges is not None:
        info_data.append(["Émissions GES:", f"{dpe_ges:.0f} kgeqCO2/m²·an"])

    info_table = Table(info_data, colWidths=[2 * inch, 4 * inch])
    info_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EBF5FB")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    story.append(info_table)
    story.append(Spacer(1, 0.3 * inch))

    # Statistiques thermiques (si fournies)
    thermal_stats = scan_data.get("thermal_stats")
    if thermal_stats:
        story.append(Paragraph("Statistiques Thermiques", heading_style))
        stats_data = [
            ["Min", f"{thermal_stats.get('min_celsius', 0):.1f} °C"],
            ["Moyenne", f"{thermal_stats.get('mean_celsius', 0):.1f} °C"],
            ["Max", f"{thermal_stats.get('max_celsius', 0):.1f} °C"],
        ]
        stats_table = Table(stats_data, colWidths=[2 * inch, 2 * inch])
        stats_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EBF5FB")),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]
            )
        )
        story.append(stats_table)
        story.append(Spacer(1, 0.3 * inch))

    # Évaluation globale
    assessment = scan_data.get("overall_assessment")
    if assessment:
        story.append(Paragraph("Évaluation Globale", heading_style))
        story.append(Paragraph(assessment, styles["Normal"]))
        story.append(Spacer(1, 0.2 * inch))

    # Résumé financier
    recs = scan_data.get("recommendations", [])
    if recs:
        story.append(Paragraph("Résumé Financier", heading_style))
        savings = scan_data.get("estimated_annual_savings", 0)
        total_cost = sum(r.get("cost", 0) for r in recs)
        avg_roi = sum(r.get("roi", 0) for r in recs) / len(recs)

        financial_data = [
            ["Métrique", "Valeur"],
            ["Économies annuelles estimées", f"{savings:.0f}€"],
            ["Coût total rénovation estimé", f"{total_cost:.0f}€"],
            ["ROI moyen", f"{round(avg_roi, 1)} ans"],
        ]
        financial_table = Table(financial_data, colWidths=[3 * inch, 2 * inch])
        financial_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1B4F72")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ]
            )
        )
        story.append(financial_table)
        story.append(Spacer(1, 0.3 * inch))

    # Zones de déperdition
    zones = scan_data.get("heat_zones", [])
    if zones:
        story.append(Paragraph("Zones de Déperdition Thermique", heading_style))
        severity_label = {"high": "Élevée", "medium": "Moyenne", "low": "Faible"}
        for i, zone in enumerate(zones, 1):
            story.append(Paragraph(f"<b>{i}. {zone.get('area', '')}</b>", styles["Normal"]))
            story.append(
                Paragraph(
                    f"Sévérité: {severity_label.get(zone.get('severity', ''), 'N/A')}",
                    styles["Normal"],
                )
            )
            if zone.get("description"):
                story.append(Paragraph(f"<i>{zone['description']}</i>", styles["Normal"]))
            story.append(Spacer(1, 0.15 * inch))

    # Recommandations
    if recs:
        story.append(Paragraph("Recommandations de Travaux", heading_style))
        for i, rec in enumerate(recs, 1):
            story.append(Paragraph(f"<b>{i}. {rec.get('title', '')}</b>", styles["Normal"]))
            rec_details = [
                ["Coût estimé", f"{rec.get('cost', 0):.0f}€"],
                ["Économies/an", f"{rec.get('savings', 0):.0f}€"],
                ["ROI", f"{rec.get('roi', 0)} ans"],
            ]
            rec_table = Table(rec_details, colWidths=[2 * inch, 2 * inch])
            rec_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EBF5FB")),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ]
                )
            )
            story.append(rec_table)
            story.append(Spacer(1, 0.2 * inch))

    # Artisans à proximité
    artisans = scan_data.get("artisans", [])
    if artisans:
        story.append(Paragraph("Artisans RGE à Proximité", heading_style))
        artisan_data = [["Entreprise", "Distance", "Spécialités", "Contact"]]
        for a in artisans:
            artisan_data.append(
                [
                    a.get("company_name", ""),
                    f"{a.get('distance_km', 0):.1f} km",
                    ", ".join(a.get("specialties", [])) or "—",
                    a.get("phone") or a.get("email") or "—",
                ]
            )
        artisan_table = Table(artisan_data, colWidths=[1.7 * inch, 0.8 * inch, 2 * inch, 1.5 * inch])
        artisan_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1B4F72")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )
        story.append(artisan_table)
        story.append(Spacer(1, 0.3 * inch))

    # Footer
    story.append(Spacer(1, 0.4 * inch))
    story.append(Paragraph("___", styles["Normal"]))
    story.append(Paragraph("ThermoTwin - Diagnostic Énergétique Intelligent", styles["Normal"]))
    story.append(Paragraph("Document généré à titre indicatif", styles["Normal"]))
    story.append(Paragraph("contact@thermotwin.fr", styles["Normal"]))

    doc.build(story)
    buffer.seek(0)

    if output_path:
        with open(output_path, "wb") as f:
            f.write(buffer.read())
        buffer.seek(0)

    return buffer
