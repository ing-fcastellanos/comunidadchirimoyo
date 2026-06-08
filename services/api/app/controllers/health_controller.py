from flask import Blueprint, jsonify

from app.version import __version__

bp = Blueprint("health", __name__)


@bp.get("/health")
def health():
    """Liveness para Cloud Run. No toca Firestore ni requiere auth."""
    return jsonify({"status": "ok", "service": "api", "version": __version__}), 200
