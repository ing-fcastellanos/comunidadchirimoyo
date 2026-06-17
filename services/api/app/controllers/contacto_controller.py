from flask import Blueprint, jsonify, request

from app.logging_utils import log_event
from app.services import contacto_service

bp = Blueprint("contacto", __name__)


@bp.route("", methods=["POST"], strict_slashes=False)
def contacto():
    """Recibe un mensaje de contacto del público: valida, persiste en Firestore
    (fuente de verdad) y notifica por correo (best-effort). Anti-spam por
    honeypot. Nunca loguea PII (ADR-0012)."""
    payload = request.get_json(silent=True) or {}
    try:
        resultado = contacto_service.procesar_contacto(payload)
    except Exception:
        # Fallo de persistencia u otro error: sin pistas y sin PII en el log.
        log_event("contacto_error_persistencia")
        return jsonify({"error": "No se pudo procesar el mensaje"}), 500

    estado = resultado["resultado"]
    if estado == contacto_service.OK:
        return jsonify({"status": "ok"}), 201
    if estado == contacto_service.SPAM:
        # Éxito aparente: no revelamos al bot que fue descartado.
        return jsonify({"status": "ok"}), 200
    # INVALIDO → detalle genérico, sin reflejar PII.
    return jsonify({"error": "Solicitud inválida", "detalle": resultado["detalle"]}), 400
