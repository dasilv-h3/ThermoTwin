"""Modèle d'une session de scan AR : track les frames captées et la consommation
de crédit (GPTT-250), puis stocke les résultats thermiques et DPE finaux (GPTT-252)."""

from datetime import UTC, datetime
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from pymongo import IndexModel


class ScanCaptureMode(str, Enum):
    VIDEO = "video"
    VIDEO_WITH_LIDAR = "video-with-lidar"


class HeatZoneSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ThermalStats(BaseModel):
    min_celsius: float
    max_celsius: float
    mean_celsius: float


class HeatZone(BaseModel):
    area: str  # ex. "fenêtre salon", "joint porte d'entrée"
    severity: HeatZoneSeverity
    temperature_celsius: float | None = None
    description: str | None = None


class ArtisanSnapshot(BaseModel):
    """Snapshot d'un artisan au moment du scan : embedded pour que l'historique
    reste lisible même si les données artisan évoluent ensuite."""

    id: str
    company_name: str
    distance_km: float
    specialties: list[str] = []
    certifications: list[str] = []
    phone: str | None = None
    email: str | None = None


class ScanSession(Document):
    user_id: PydanticObjectId
    capture_mode: ScanCaptureMode = ScanCaptureMode.VIDEO

    # Crédit / cycle de vie (GPTT-250)
    frame_count: int = 0
    finalized_at: datetime | None = None
    credit_consumed: bool = False
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Résultats / historique (GPTT-252)
    location_label: str | None = None
    duration_ms: int | None = None
    dpe_consumption: float | None = None  # kWhEP/m²·an
    dpe_emissions: float | None = None  # kgeqCO2/m²·an
    dpe_class: str | None = None  # 'A'..'G'
    thermal_stats: ThermalStats | None = None
    heat_zones: list[HeatZone] = []
    nearby_artisans: list[ArtisanSnapshot] = []

    class Settings:
        name = "scan_sessions"
        indexes = [
            IndexModel([("user_id", 1), ("started_at", -1)]),
            IndexModel([("user_id", 1), ("finalized_at", -1)]),
        ]
