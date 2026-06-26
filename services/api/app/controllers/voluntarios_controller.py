from flask import Blueprint, jsonify, request

from app.logging_utils import log_event
from app.services import inscripcion_service

bp = Blueprint("voluntarios", __name__)


@bp.route("", methods=["POST"], strict_slashes=False)
def inscripcion():
    """Recibe una inscripción de voluntario a una jornada: valida, persiste en
    Firestore (fuente de verdad) y notifica por correo (best-effort). Anti-spam
    por honeypot. Nunca loguea PII (ADR-0012)."""
    payload = request.get_json(silent=True) or {}
    try:
        resultado = inscripcion_service.procesar_inscripcion(payload)
    except Exception:
        # Fallo de persistencia u otro error: sin pistas y sin PII en el log.
        log_event("inscripcion_error_persistencia")
        return jsonify({"error": "No se pudo procesar la inscripción"}), 500

    estado = resultado["resultado"]
    if estado == inscripcion_service.OK:
        return jsonify({"status": "ok"}), 201
    if estado == inscripcion_service.SPAM:
        # Éxito aparente: no revelamos al bot que fue descartada.
        return jsonify({"status": "ok"}), 200
    # INVALIDO → detalle genérico, sin reflejar PII.
    return jsonify({"error": "Solicitud inválida", "detalle": resultado["detalle"]}), 400
