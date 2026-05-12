"""Schémas du rapport scan PDF (GPTT-254).

Le payload est intentionnellement permissif : le frontend pousse tout ce qu'il
a (DPE, thermal, zones, artisans, recommandations) et le backend rend ce qui
est présent. Permet de générer un PDF même quand certaines données manquent.
"""

from pydantic import BaseModel


class ReportThermalStats(BaseModel):
    min_celsius: float
    max_celsius: float
    mean_celsius: float


class ReportHeatZone(BaseModel):
    area: str
    severity: str  # 'low' | 'medium' | 'high'
    description: str | None = None
    temperature_celsius: float | None = None


class ReportArtisan(BaseModel):
    company_name: str
    distance_km: float
    specialties: list[str] = []
    certifications: list[str] = []
    phone: str | None = None
    email: str | None = None


class ReportRecommendation(BaseModel):
    title: str
    cost: float = 0
    savings: float = 0
    roi: float = 0


class ScanReportRequest(BaseModel):
    location_label: str | None = None
    scan_date: str | None = None  # ISO 8601
    dpe_class: str | None = None  # 'A'..'G'
    dpe_consumption: float | None = None  # kWhEP/m²·an
    dpe_emissions: float | None = None  # kgeqCO2/m²·an
    thermal_score: float | None = None
    thermal_stats: ReportThermalStats | None = None
    overall_assessment: str | None = None
    heat_zones: list[ReportHeatZone] = []
    recommendations: list[ReportRecommendation] = []
    artisans: list[ReportArtisan] = []
    estimated_annual_savings: float | None = None
