"""Service de gestion des scans thermiques - ThermoTwin"""

import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List
from fastapi import HTTPException, status

from app.database import db
from app.ai.analyzer import analyze_thermal_image
from app.ai.roi_service import enrich_recommendations, generate_action_plan
from app.ai.report_service import generate_pdf_report

logger = logging.getLogger(__name__)


class ScanService:

    @staticmethod
    async def create_scan(user: Dict[str, Any], image_base64: str) -> Dict[str, Any]:
        """Créer un nouveau scan thermique via Groq Vision"""

        # Sauvegarder l'image temporairement
        import base64
        import tempfile
        import os

        image_data = image_base64
        if 'base64,' in image_base64:
            image_data = image_base64.split('base64,')[1]

        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            tmp.write(base64.b64decode(image_data))
            tmp_path = tmp.name

        try:
            # Analyse Groq Vision
            analysis = analyze_thermal_image(tmp_path)
        except Exception as e:
            logger.error(f"Erreur analyse Groq Vision: {str(e)}")
            analysis = ScanService._get_default_analysis()
        finally:
            os.unlink(tmp_path)

        # Enrichir les recommandations avec ROI
        enriched_recs = enrich_recommendations(analysis.get('recommendations', []))

        # Créer le document scan
        scan_id = str(uuid.uuid4())
        scan_doc = {
            'id': scan_id,
            'user_id': user['id'],
            'image_base64': image_data,
            'thermal_score': analysis.get('thermal_score', 50),
            'dpe_class': analysis.get('dpe_class', 'N/A'),
            'heat_zones': analysis.get('heat_zones', []),
            'recommendations': enriched_recs,
            'overall_assessment': analysis.get('overall_assessment', ''),
            'estimated_annual_savings': analysis.get('estimated_annual_savings', 0),
            'created_at': datetime.utcnow().isoformat()
        }

        await db.scans.insert_one(scan_doc)
        await db.users.update_one(
            {'id': user['id']},
            {'$inc': {'scans_count': 1}}
        )

        logger.info(f"Scan créé: {scan_id} pour {user.get('email')}")
        return scan_doc

    @staticmethod
    async def get_scan_recommendations(scan_id: str, user_id: str, budget: float = None) -> Dict[str, Any]:
        """GET /scan/{id}/recommendations — retourne le plan d'action ROI"""
        scan = await db.scans.find_one({'id': scan_id, 'user_id': user_id})

        if not scan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan non trouvé"
            )

        plan = generate_action_plan(scan.get('recommendations', []), budget=budget)

        return {
            'scan_id': scan_id,
            'thermal_score': scan.get('thermal_score'),
            'dpe_class': scan.get('dpe_class'),
            'action_plan': plan
        }

    @staticmethod
    async def get_scan_by_id(scan_id: str, user_id: str) -> Dict[str, Any]:
        """Récupérer un scan par son ID"""
        scan = await db.scans.find_one({'id': scan_id, 'user_id': user_id})

        if not scan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan non trouvé"
            )
        return scan

    @staticmethod
    async def get_user_scans(user_id: str) -> List[Dict[str, Any]]:
        """Récupérer tous les scans d'un utilisateur"""
        cursor = db.scans.find({'user_id': user_id}).sort('created_at', -1)
        scans = await cursor.to_list(length=100)
        return scans

    @staticmethod
    def _get_default_analysis() -> Dict[str, Any]:
        """Analyse par défaut si Groq échoue"""
        return {
            'thermal_score': 60,
            'dpe_class': 'D',
            'heat_zones': [{
                'area': 'Zone non identifiable',
                'severity': 'medium',
                'description': 'Analyse automatique non disponible',
            }],
            'recommendations': [{
                'title': 'Audit énergétique recommandé',
                'cost': 500,
                'savings': 150,
                'roi': 3.0
            }],
            'overall_assessment': 'Une analyse plus détaillée est nécessaire.',
            'estimated_annual_savings': 150
        }