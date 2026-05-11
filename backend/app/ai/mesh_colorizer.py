"""
GPTT-58 - Mapping données → vertices
Attribution couleur thermique par face du mesh 3D
"""

import numpy as np
import trimesh

from app.ai.heatmap_shader import thermal_color


def colorize_mesh_by_zones(mesh: trimesh.Trimesh, heat_zones: list) -> trimesh.Trimesh:
    """
    Attribue une couleur thermique à chaque face du mesh
    selon les zones de déperdition détectées.
    """
    severity_map = {"low": 0.2, "medium": 0.6, "high": 0.9}

    # Couleur par défaut : bleu (bonne isolation)
    face_colors = np.zeros((len(mesh.faces), 4), dtype=np.uint8)
    face_colors[:, 2] = 255  # bleu
    face_colors[:, 3] = 255  # alpha

    # Calcul du centre de chaque face
    face_centers = mesh.triangles_center

    for zone in heat_zones:
        severity = zone.get("severity", "low")
        value = severity_map.get(severity, 0.2)
        r, g, b = thermal_color(value)

        # Attribue la couleur aux faces selon leur position Z
        if zone.get("area", "").lower() in ["sol", "floor"]:
            mask = face_centers[:, 2] < np.percentile(face_centers[:, 2], 20)
        elif zone.get("area", "").lower() in ["plafond", "toit", "roof"]:
            mask = face_centers[:, 2] > np.percentile(face_centers[:, 2], 80)
        else:
            # Murs — faces verticales
            mask = np.abs(face_centers[:, 2] - np.mean(face_centers[:, 2])) < 1.0

        face_colors[mask] = [r, g, b, 255]

    colored_mesh = mesh.copy()
    colored_mesh.visual.face_colors = face_colors

    return colored_mesh


def export_colored_mesh_data(mesh: trimesh.Trimesh) -> dict:
    """
    Exporte les données du mesh colorisé pour le frontend.
    vertices: coordonnées 3D
    faces: indices des triangles
    colors: couleur RGBA par face
    """
    return {
        "vertices": mesh.vertices.tolist(),
        "faces": mesh.faces.tolist(),
        "face_colors": mesh.visual.face_colors.tolist(),
        "vertex_count": len(mesh.vertices),
        "face_count": len(mesh.faces),
    }


if __name__ == "__main__":
    mesh = trimesh.creation.box(extents=[4, 5, 3])

    heat_zones = [
        {"area": "fenêtre", "severity": "high"},
        {"area": "sol", "severity": "low"},
        {"area": "plafond", "severity": "medium"},
    ]

    colored = colorize_mesh_by_zones(mesh, heat_zones)
    data = export_colored_mesh_data(colored)

    print(f"Vertices : {data['vertex_count']}")
    print(f"Faces : {data['face_count']}")
    print(f"Couleurs attribuées : {len(data['face_colors'])} faces")
    print(f"Exemple couleur face 0 : {data['face_colors'][0]}")
    print("Mapping données → vertices ✅")
