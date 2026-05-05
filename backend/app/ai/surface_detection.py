"""
GPTT-37 - Détection surfaces planes
RANSAC pour identifier murs, sols et plafonds
"""

import numpy as np
import trimesh
from trimesh.sample import sample_surface


def detect_planes_ransac(
    mesh: trimesh.Trimesh, num_planes: int = 6, iterations: int = 1000, threshold: float = 0.02
) -> list:
    """
    Détecte les surfaces planes (murs/sols/plafonds) via RANSAC.
    num_planes: nombre de plans à détecter
    threshold: distance max pour considérer un point dans le plan
    """
    points, _ = sample_surface(mesh, count=5000)
    remaining_points = points.copy()
    planes = []

    for _ in range(num_planes):
        if len(remaining_points) < 3:
            break

        best_plane = None
        best_inliers = []

        for _ in range(iterations):
            # Échantillonne 3 points aléatoires
            idx = np.random.choice(len(remaining_points), 3, replace=False)
            sample = remaining_points[idx]

            # Calcule le plan
            v1 = sample[1] - sample[0]
            v2 = sample[2] - sample[0]
            normal = np.cross(v1, v2)
            norm = np.linalg.norm(normal)
            if norm < 1e-6:
                continue
            normal = normal / norm
            d = -np.dot(normal, sample[0])

            # Trouve les inliers
            distances = np.abs(np.dot(remaining_points, normal) + d)
            inliers = remaining_points[distances < threshold]

            if len(inliers) > len(best_inliers):
                best_inliers = inliers
                best_plane = (normal, d)

        if best_plane is None:
            break

        normal, d = best_plane
        surface_type = classify_surface(normal)

        planes.append(
            {
                "normal": normal.tolist(),
                "d": float(d),
                "surface_type": surface_type,
                "inliers_count": len(best_inliers),
                "area_estimate_m2": round(len(best_inliers) / 5000 * mesh.area, 2),
            }
        )

        # Retire les inliers pour trouver le prochain plan
        distances = np.abs(np.dot(remaining_points, normal) + d)
        remaining_points = remaining_points[distances >= threshold]

    return planes


def classify_surface(normal: np.ndarray) -> str:
    """Classifie une surface selon sa normale"""
    normal = np.abs(normal)
    dominant = np.argmax(normal)

    if dominant == 2:  # axe Z
        return "sol" if normal[2] > 0.8 else "plafond"
    elif dominant == 0:
        return "mur_est_ouest"
    else:
        return "mur_nord_sud"


if __name__ == "__main__":
    # Test avec une boîte (6 faces planes)
    mesh = trimesh.creation.box(extents=[4, 5, 3])  # pièce 4x5m, hauteur 3m
    print(f"Mesh pièce : {len(mesh.vertices)} vertices, {len(mesh.faces)} faces")

    planes = detect_planes_ransac(mesh, num_planes=6)

    print(f"\n{len(planes)} surfaces détectées :")
    for i, plane in enumerate(planes):
        print(f"  {i + 1}. {plane['surface_type']} — {plane['inliers_count']} points — ~{plane['area_estimate_m2']}m²")

    print("\nDétection surfaces planes ✅")
