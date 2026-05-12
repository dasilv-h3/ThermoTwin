from datetime import datetime

from pydantic import BaseModel, Field

from app.models.scan_session import (
    ArtisanSnapshot,
    HeatZone,
    ScanCaptureMode,
    ThermalStats,
)


class ScanSessionStartRequest(BaseModel):
    capture_mode: ScanCaptureMode = ScanCaptureMode.VIDEO


class ScanSessionStartResponse(BaseModel):
    scan_id: str
    started_at: datetime


class ScanSessionFinalizeRequest(BaseModel):
    frame_count: int = Field(ge=0, description="Nombre de frames captées pendant la session")


class ScanSessionFinalizeResponse(BaseModel):
    scan_id: str
    finalized_at: datetime
    credit_consumed: bool
    reason: str
    scans_used: int
    scans_limit: int


class ScanResultsRequest(BaseModel):
    location_label: str | None = None
    duration_ms: int | None = None
    dpe_consumption: float | None = None
    dpe_emissions: float | None = None
    dpe_class: str | None = None
    thermal_stats: ThermalStats | None = None
    heat_zones: list[HeatZone] = []
    nearby_artisans: list[ArtisanSnapshot] = []


class ScanSummary(BaseModel):
    """Item de liste dans l'historique : version compacte."""

    id: str
    started_at: datetime
    finalized_at: datetime | None
    location_label: str | None
    dpe_class: str | None
    duration_ms: int | None


class ScanHistoryResponse(BaseModel):
    items: list[ScanSummary]
    total: int


class ScanDetail(ScanSummary):
    capture_mode: ScanCaptureMode
    frame_count: int
    credit_consumed: bool
    dpe_consumption: float | None
    dpe_emissions: float | None
    thermal_stats: ThermalStats | None
    heat_zones: list[HeatZone]
    nearby_artisans: list[ArtisanSnapshot]
