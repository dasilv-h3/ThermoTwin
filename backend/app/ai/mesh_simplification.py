"""
GPTT-36 - Simplification mesh 3D
Réduit le nombre de polygones pour optimiser les performances
"""

import trimesh


def simplify_mesh(mesh: trimesh.Trimesh, target_ratio: float = 0.5) -> dict:
    """
    Simplifie le mesh en réduisant le nombre de faces.
    target_ratio: ratio cible (0.5 = garder 50% des faces)
    """
    faces_before = len(mesh.faces)
    vertices_before = len(mesh.vertices)

    reduction = 1 - target_ratio  # ex: 0.5 ratio → 0.5 reduction

    reduction = 1.0 - target_ratio  # 0.3 ratio → 0.7 reduction
    simplified = mesh.simplify_quadric_decimation(reduction)

    return {
        "vertices_before": vertices_before,
        "vertices_after": len(simplified.vertices),
        "faces_before": faces_before,
        "faces_after": len(simplified.faces),
        "reduction_ratio": round(1 - len(simplified.faces) / faces_before, 2),
        "mesh": simplified,
    }


def adaptive_simplification(mesh: trimesh.Trimesh, max_faces: int = 5000) -> dict:
    """
    Simplifie le mesh seulement si nécessaire selon un seuil max de faces.
    """
    if len(mesh.faces) <= max_faces:
        return {
            "simplified": False,
            "message": "Mesh déjà dans les limites acceptables",
            "faces": len(mesh.faces),
            "mesh": mesh,
        }

    ratio = max_faces / len(mesh.faces)
    result = simplify_mesh(mesh, target_ratio=ratio)
    result["simplified"] = True
    return result


if __name__ == "__main__":
    mesh = trimesh.creation.icosphere(subdivisions=4)
    print(f"Mesh original : {len(mesh.vertices)} vertices, {len(mesh.faces)} faces")

    result = simplify_mesh(mesh, target_ratio=0.3)
    print(f"Après simplification 30% : {result['vertices_after']} vertices, {result['faces_after']} faces")
    print(f"Réduction : {result['reduction_ratio'] * 100:.0f}%")
    print("Simplification mesh ✅")
