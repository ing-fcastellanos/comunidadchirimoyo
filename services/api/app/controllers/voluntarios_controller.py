import hmac

from flask import Blueprint, current_app, jsonify, request

from app.datastore.inscripciones_datastore import desuscribir
from app.logging_utils import log_event
from app.services import inscripcion_service
from app.services.notificacion_service import notificar_semana

bp = Blueprint("voluntarios", __name__)


@bp.route("", methods=["POST"], strict_slashes=False)
def inscripcion():
    """Recibe una inscripción de voluntario a una jornada: valida, persiste en
    Firestore (fuente de verdad) y notifica por correo (best-effort). Anti-spam
    por honeypot. Nunca loguea PII (ADR-0012)."""
    payload = request.get_json(silent=True) or {}
    try:
        resultado = inscripcion_service.procesar_inscripcion(payload)
    except Exception as exc:
        # Fallo de persistencia u otro error: solo el tipo de excepción (no
        # mensaje ni traceback) para no filtrar PII, ver ADR-0012 / #26.
        log_event("inscripcion_error_persistencia", exception_type=type(exc).__name__)
        return jsonify({"error": "No se pudo procesar la inscripción"}), 500

    estado = resultado["resultado"]
    if estado == inscripcion_service.OK:
        return jsonify({"status": "ok"}), 201
    if estado == inscripcion_service.SPAM:
        # Éxito aparente: no revelamos al bot que fue descartada.
        return jsonify({"status": "ok"}), 200
    # INVALIDO → detalle genérico, sin reflejar PII.
    return jsonify({"error": "Solicitud inválida", "detalle": resultado["detalle"]}), 400


def _autorizado(req) -> bool:
    """Compara el header `Authorization: Bearer <secreto>` contra
    NOTIFICAR_VOLUNTARIOS_SECRET en tiempo constante (hmac.compare_digest ya es
    seguro sobre str). Fail-closed: sin secreto configurado, nunca autoriza.
    Mismo patrón que apps/sitio/app/api/revalidate/route.ts."""
    secret = current_app.config.get("NOTIFICAR_VOLUNTARIOS_SECRET")
    if not secret:
        return False
    header = req.headers.get("Authorization", "")
    provided = header[7:] if header.startswith("Bearer ") else ""
    return bool(provided) and hmac.compare_digest(provided, secret)


@bp.route("/notificar-semana", methods=["POST"], strict_slashes=False)
def notificar_semana_endpoint():
    """Recibe la agenda semanal calculada por apps/sitio (proximasJornadas) y
    envía el resumen agregado a los voluntarios suscritos. Protegido por
    secreto compartido — lo llama sitio, no el navegador."""
    if not _autorizado(request):
        return jsonify({"error": "no autorizado"}), 401

    payload = request.get_json(silent=True) or {}
    agenda = payload.get("agenda")
    if not isinstance(agenda, list):
        return jsonify({"error": "El campo 'agenda' debe ser una lista"}), 400

    resultado = notificar_semana(agenda)
    return jsonify(resultado), 200


@bp.route("/desuscribir", methods=["GET"], strict_slashes=False)
def desuscribir_endpoint():
    """Desuscribe a un voluntario del resumen semanal. Público (se llega desde
    un link de correo), idempotente, y no revela si el ID existía o no."""
    doc_id = request.args.get("id", "")
    if doc_id:
        desuscribir(doc_id)
    return jsonify({"status": "ok", "mensaje": "Ya no recibirás el resumen semanal de jornadas."}), 200
