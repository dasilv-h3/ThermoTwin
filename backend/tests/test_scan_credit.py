"""Tests unitaires de la décision pure de consommation de crédit (GPTT-250)."""

from app.services.scan_credit import decide_credit_consumption


def test_consumes_when_first_finalize_with_frames_and_quota_available():
    d = decide_credit_consumption(frame_count=100, already_finalized=False, scans_used=0, scans_limit=5)
    assert d.should_consume is True
    assert d.reason == "ok"


def test_does_not_consume_when_already_finalized():
    d = decide_credit_consumption(frame_count=100, already_finalized=True, scans_used=0, scans_limit=5)
    assert d.should_consume is False
    assert d.reason == "already-finalized"


def test_does_not_consume_when_no_frames_captured():
    d = decide_credit_consumption(frame_count=0, already_finalized=False, scans_used=0, scans_limit=5)
    assert d.should_consume is False
    assert d.reason == "no-frames"


def test_does_not_consume_when_quota_exhausted():
    d = decide_credit_consumption(frame_count=100, already_finalized=False, scans_used=5, scans_limit=5)
    assert d.should_consume is False
    assert d.reason == "quota-exceeded"


def test_consumes_on_last_available_quota():
    # 4 used, limit 5 → consommer doit être OK (passe à 5/5)
    d = decide_credit_consumption(frame_count=10, already_finalized=False, scans_used=4, scans_limit=5)
    assert d.should_consume is True


def test_negative_frame_count_treated_as_no_frames():
    d = decide_credit_consumption(frame_count=-1, already_finalized=False, scans_used=0, scans_limit=5)
    assert d.should_consume is False
    assert d.reason == "no-frames"
