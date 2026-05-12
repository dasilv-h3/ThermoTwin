from datetime import datetime

from pydantic import BaseModel, Field

from app.models.scan_session import ScanCaptureMode


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
