"""
GPTT-34 - Import mesh Python
Open3D + Trimesh pour traitement des scans 3D
"""

import numpy as np
import open3d as o3d
import trimesh


def load_mesh_trimesh(file_path: str) -> dict:
    """Charge un mesh avec Trimesh"""
    mesh = trimesh.load(file_path)
    return {
        "vertices": len(mesh.vertices),
        "faces": len(mesh.faces),
        "volume": float(mesh.volume) if mesh.is_watertight else None,
        "bounds": mesh.bounds.tolist(),
        "is_watertight": mesh.is_watertight,
    }


def load_mesh_open3d(file_path: str) -> dict:
    """Charge un mesh avec Open3D"""
    mesh = o3d.io.read_triangle_mesh(file_path)
    vertices = np.asarray(mesh.vertices)
    triangles = np.asarray(mesh.triangles)
    return {
        "vertices": len(vertices),
        "faces": len(triangles),
        "bounds_min": vertices.min(axis=0).tolist(),
        "bounds_max": vertices.max(axis=0).tolist(),
    }


def test_import():
    """Test basique sans fichier réel"""
    # Crée un mesh synthétique pour tester
    mesh = trimesh.creation.box(extents=[1, 1, 1])
    print(f"Trimesh box — vertices: {len(mesh.vertices)}, faces: {len(mesh.faces)}")

    box = o3d.geometry.TriangleMesh.create_box(1, 1, 1)
    print(f"Open3D box — vertices: {len(box.vertices)}, faces: {len(box.triangles)}")
    print("Import mesh Python ✅")


if __name__ == "__main__":
    test_import()
