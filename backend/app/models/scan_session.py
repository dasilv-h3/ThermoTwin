"""Modèle d'une session de scan AR : track les frames captées et la consommation
de crédit. Étendu par GPTT-252 avec les résultats thermiques, DPE et artisans."""

from datetime import UTC, datetime
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import IndexModel


class ScanCaptureMode(str, Enum):
    VIDEO = "video"
    VIDEO_WITH_LIDAR = "video-with-lidar"


class ScanSession(Document):
    user_id: PydanticObjectId
    capture_mode: ScanCaptureMode = ScanCaptureMode.VIDEO
    frame_count: int = 0
    # Idempotence : finalize ne consomme un crédit qu'une fois par session.
    finalized_at: datetime | None = None
    credit_consumed: bool = False
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "scan_sessions"
        indexes = [
            IndexModel([("user_id", 1), ("started_at", -1)]),
        ]
