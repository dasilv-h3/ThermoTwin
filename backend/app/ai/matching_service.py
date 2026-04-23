from typing import List, Dict
import math


def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))


def filter_by_location(artisans: List[Dict], user_lat: float, user_lon: float, radius_km: float = 30) -> List[Dict]:
    """GPTT-111 — Filtre artisans dans un rayon de 30km"""
    result = []
    for artisan in artisans:
        dist = calculate_distance_km(user_lat, user_lon, artisan['lat'], artisan['lon'])
        if dist <= radius_km:
            artisan['distance_km'] = round(dist, 2)
            result.append(artisan)
    return result


def filter_by_speciality(artisans: List[Dict], recommended_works: List[str]) -> List[Dict]:
    """GPTT-112 — Filtre artisans par spécialité selon travaux recommandés"""
    result = []
    for artisan in artisans:
        specialities = [s.lower() for s in artisan.get('specialities', [])]
        for work in recommended_works:
            if any(work.lower() in s for s in specialities):
                result.append(artisan)
                break
    return result


def score_artisan(artisan: Dict) -> float:
    """GPTT-113 — Score = (note × log(nb_avis+1)) / distance"""
    note = artisan.get('rating', 0)
    nb_avis = artisan.get('reviews_count', 0)
    distance = artisan.get('distance_km', 30)
    weighted_rating = note * math.log(nb_avis + 1)
    distance_penalty = max(distance, 1)
    return round(weighted_rating / distance_penalty, 4)


def match_artisans(artisans: List[Dict], user_lat: float, user_lon: float, recommended_works: List[str], budget: float = None) -> List[Dict]:
    """GPTT-114 — Pipeline complet : filtre localisation + spécialité + scoring → top 5"""
    filtered = filter_by_location(artisans, user_lat, user_lon)
    filtered = filter_by_speciality(filtered, recommended_works)
    for artisan in filtered:
        artisan['match_score'] = score_artisan(artisan)
    filtered.sort(key=lambda x: -x['match_score'])
    return filtered[:5]