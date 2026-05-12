"""Pure geo helpers: haversine distance, bounding boxes."""

from math import asin, cos, radians, sin, sqrt

EARTH_RADIUS_KM = 6371.0088


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance between two WGS84 points, in kilometers.

    Used to fill `distance_km` on artisan responses after MongoDB's `$near`
    sorts by distance but doesn't expose the value. Accurate to ~0.5% over
    short distances (city-scale), which is largely sufficient here.
    """
    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    dlat = lat2_rad - lat1_rad
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlng / 2) ** 2
    c = 2 * asin(sqrt(a))
    return EARTH_RADIUS_KM * c
