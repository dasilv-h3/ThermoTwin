"""Unit tests for the geo helpers."""

from app.services.geo import haversine_km


def test_haversine_zero_distance():
    assert haversine_km(48.8566, 2.3522, 48.8566, 2.3522) == 0


def test_haversine_paris_to_lyon():
    # Paris (48.8566, 2.3522) → Lyon (45.7640, 4.8357) ≈ 392 km
    d = haversine_km(48.8566, 2.3522, 45.7640, 4.8357)
    assert 390 < d < 395


def test_haversine_symmetric():
    a = haversine_km(48.8566, 2.3522, 45.7640, 4.8357)
    b = haversine_km(45.7640, 4.8357, 48.8566, 2.3522)
    assert abs(a - b) < 1e-9


def test_haversine_paris_to_marseille():
    # Paris → Marseille (43.2965, 5.3698) ≈ 661 km
    d = haversine_km(48.8566, 2.3522, 43.2965, 5.3698)
    assert 658 < d < 664


def test_haversine_short_distance_meters_scale():
    # 100 m east at Paris latitude ≈ 0.00139° longitude
    d = haversine_km(48.8566, 2.3522, 48.8566, 2.3522 + 0.00139)
    assert 0.09 < d < 0.11
