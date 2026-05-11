"""
GPTT-35 - Cleaning outliers du mesh 3D
Nettoyage des points aberrants pour améliorer la qualité du scan
"""

import numpy as np
import trimesh


def remove_statistical_outliers(mesh: trimesh.Trimesh, std_ratio: float = 2.0) -> trimesh.Trimesh:
    """
    Supprime les vertices aberrants basé sur la distance moyenne aux voisins.
    std_ratio: seuil en écart-type (plus bas = plus agressif)
    """
    vertices = mesh.vertices
    distances = []

    for i, vertex in enumerate(vertices):
        dists = np.linalg.norm(vertices - vertex, axis=1)
        dists = dists[dists > 0]
        distances.append(np.mean(dists))

    distances = np.array(distances)
    mean_dist = np.mean(distances)
    std_dist = np.std(distances)

    threshold = mean_dist + std_ratio * std_dist
    valid_mask = distances < threshold

    clean_mesh = mesh.copy()
    clean_mesh.update_vertices(valid_mask)

    return clean_mesh


def remove_degenerate_faces(mesh: trimesh.Trimesh) -> trimesh.Trimesh:
    """Supprime les faces dégénérées (area = 0)"""
    clean = mesh.copy()
    mask = clean.nondegenerate_faces()
    clean.update_faces(mask)
    clean = trimesh.Trimesh(vertices=clean.vertices, faces=clean.faces, process=True)
    return clean


def clean_mesh(mesh: trimesh.Trimesh) -> dict:
    """Pipeline complet de nettoyage"""
    vertices_before = len(mesh.vertices)
    faces_before = len(mesh.faces)

    mesh = remove_degenerate_faces(mesh)
    mesh = remove_statistical_outliers(mesh)

    return {
        "vertices_before": vertices_before,
        "vertices_after": len(mesh.vertices),
        "faces_before": faces_before,
        "faces_after": len(mesh.faces),
        "vertices_removed": vertices_before - len(mesh.vertices),
        "mesh": mesh,
    }


if __name__ == "__main__":
    # Test avec un mesh synthétique + outliers artificiels
    mesh = trimesh.creation.icosphere(subdivisions=2)

    # Ajoute des outliers artificiels
    outliers = np.random.uniform(-5, 5, (10, 3))
    mesh.vertices = np.vstack([mesh.vertices, outliers])

    print(f"Avant nettoyage : {len(mesh.vertices)} vertices")
    result = clean_mesh(mesh)
    print(f"Après nettoyage : {result['vertices_after']} vertices")
    print(f"Outliers supprimés : {result['vertices_removed']}")
    print("Cleaning outliers ✅")
