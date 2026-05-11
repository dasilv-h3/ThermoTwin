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
        "CustomHeading", parent=styles["Heading2"], fontSize=16, textColor=colors.HexColor("#1B4F72"), spaceAfter=12
    )

    # Titre
    story.append(Paragraph("ThermoTwin - Rapport de Diagnostic Thermique", title_style))
    story.append(Spacer(1, 0.3 * inch))

    # Infos générales
    story.append(Paragraph("Informations Générales", heading_style))

    date_str = datetime.now().strftime("%d/%m/%Y %H:%M")
    dpe = scan_data.get("dpe_class", "N/A")
    score = scan_data.get("thermal_score", 0)

    info_data = [
        ["Date du scan:", date_str],
        ["Classe DPE:", dpe],
        ["Score thermique:", f"{score}/100"],
    ]

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

    # Évaluation globale
    story.append(Paragraph("Évaluation Globale", heading_style))
    story.append(Paragraph(scan_data.get("overall_assessment", "N/A"), styles["Normal"]))
    story.append(Spacer(1, 0.2 * inch))

    # Résumé financier
    story.append(Paragraph("Résumé Financier", heading_style))

    savings = scan_data.get("estimated_annual_savings", 0)
    recs = scan_data.get("recommendations", [])
    total_cost = sum(r.get("cost", 0) for r in recs)
    avg_roi = sum(r.get("roi", 0) for r in recs) / len(recs) if recs else 0

    financial_data = [
        ["Métrique", "Valeur"],
        ["Économies annuelles estimées", f"{savings}€"],
        ["Coût total rénovation estimé", f"{total_cost}€"],
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
    story.append(Paragraph("Zones de Déperdition Thermique", heading_style))

    for i, zone in enumerate(scan_data.get("heat_zones", []), 1):
        story.append(Paragraph(f"<b>{i}. {zone.get('area', '')}</b>", styles["Normal"]))
        severity = {"high": "Élevée", "medium": "Moyenne", "low": "Faible"}.get(zone.get("severity", ""), "N/A")
        story.append(Paragraph(f"Sévérité: {severity}", styles["Normal"]))
        story.append(Paragraph(f"<i>{zone.get('description', '')}</i>", styles["Normal"]))
        story.append(Spacer(1, 0.15 * inch))

    # Recommandations
    story.append(Paragraph("Recommandations de Travaux", heading_style))

    for i, rec in enumerate(recs, 1):
        story.append(Paragraph(f"<b>{i}. {rec.get('title', '')}</b>", styles["Normal"]))
        zone_details = [
            ["Coût estimé", f"{rec.get('cost', 0)}€"],
            ["Économies/an", f"{rec.get('savings', 0)}€"],
            ["ROI", f"{rec.get('roi', 0)} ans"],
        ]
        zone_table = Table(zone_details, colWidths=[2 * inch, 2 * inch])
        zone_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EBF5FB")),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                ]
            )
        )
        story.append(zone_table)
        story.append(Spacer(1, 0.2 * inch))

    # Footer
    story.append(Spacer(1, 0.5 * inch))
    story.append(Paragraph("___", styles["Normal"]))
    story.append(Paragraph("ThermoTwin - Diagnostic Énergétique Intelligent", styles["Normal"]))
    story.append(Paragraph("contact@thermotwin.fr", styles["Normal"]))

    doc.build(story)
    buffer.seek(0)

    if output_path:
        with open(output_path, "wb") as f:
            f.write(buffer.read())
        buffer.seek(0)

    return buffer
