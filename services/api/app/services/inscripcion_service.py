import re

from flask import current_app

from app.datastore.inscripciones_datastore import guardar_inscripcion
from app.logging_utils import log_event
from app.models.inscripcion import Inscripcion
from app.services.email_service import enviar_correo

# Campo señuelo (honeypot). Un humano no lo ve ni lo rellena; un bot sí.
_HONEYPOT = "website"

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
# Teléfono laxo: dígitos, espacios y separadores comunes. Opcional.
_TEL_RE = re.compile(r"^[0-9+()\-\s]+$")

# Límites razonables para evitar payloads abusivos.
_MAX = {"nombre": 120, "telefono": 40, "jornada": 160}
_MAX_ACOMPANANTES = 20

# Resultados posibles del procesamiento (el controller los mapea a HTTP).
OK = "ok"
SPAM = "spam"
INVALIDO = "invalido"


def _texto(payload: dict, campo: str) -> str:
    valor = payload.get(campo)
    return valor.strip() if isinstance(valor, str) else ""


def _parse_acompanantes(payload: dict) -> int | None:
    """Devuelve el número de acompañantes (0 si ausente) o None si es inválido
    (no entero, negativo o fuera de tope). Acepta int o string numérica; rechaza
    bool y floats no enteros."""
    valor = payload.get("acompanantes")
    if valor is None or valor == "":
        return 0
    if isinstance(valor, bool):
        return None
    if isinstance(valor, int):
        n = valor
    elif isinstance(valor, str) and valor.strip().isdigit():
        n = int(valor.strip())
    else:
        return None
    if n < 0 or n > _MAX_ACOMPANANTES:
        return None
    return n


def _validar(payload: dict) -> str | None:
    """Devuelve un detalle genérico (sin PII) si el payload es inválido, o None
    si es válido."""
    nombre = _texto(payload, "nombre")
    if not nombre:
        return "El campo 'nombre' es requerido."
    if len(nombre) > _MAX["nombre"]:
        return "El campo 'nombre' excede el largo permitido."

    correo = _texto(payload, "correo")
    if not correo or not _EMAIL_RE.match(correo):
        return "El campo 'correo' no tiene un formato válido."

    telefono = _texto(payload, "telefono")
    if telefono and (len(telefono) > _MAX["telefono"] or not _TEL_RE.match(telefono)):
        return "El campo 'telefono' no tiene un formato válido."

    if len(_texto(payload, "jornada")) > _MAX["jornada"]:
        return "El campo 'jornada' excede el largo permitido."

    if _parse_acompanantes(payload) is None:
        return "El campo 'acompanantes' no es válido."

    if payload.get("consentimiento") is not True:
        return "Se requiere el consentimiento de privacidad."

    return None


def procesar_inscripcion(payload: dict) -> dict:
    """Valida, descarta spam, persiste y notifica una inscripción de voluntario.

    - Honeypot relleno → SPAM (descarte silencioso, sin persistir ni notificar).
    - Payload inválido → INVALIDO con detalle genérico (sin PII).
    - Válido → persiste en Firestore (fuente de verdad) y envía correos
      best-effort (un fallo de SMTP NO cambia el resultado OK).

    Un fallo de persistencia se propaga como excepción (el controller responde 5xx).
    """
    if _texto(payload, _HONEYPOT):
        log_event("inscripcion_spam_rechazada")
        return {"resultado": SPAM}

    detalle = _validar(payload)
    if detalle:
        return {"resultado": INVALIDO, "detalle": detalle}

    inscripcion = Inscripcion(
        nombre=_texto(payload, "nombre"),
        correo=_texto(payload, "correo"),
        telefono=_texto(payload, "telefono"),
        jornada=_texto(payload, "jornada"),
        acompanantes=_parse_acompanantes(payload) or 0,
        consentimiento=True,
    )

    doc_id = guardar_inscripcion(inscripcion)  # fuente de verdad; si falla, propaga
    log_event("inscripcion_recibida", doc_id=doc_id, origen=inscripcion.origen)

    _notificar(inscripcion)  # best-effort
    return {"resultado": OK}


def _notificar(inscripcion: Inscripcion) -> None:
    """Envía aviso interno y confirmación al voluntario. Best-effort: cualquier
    fallo de SMTP se loguea (sin PII) y NO interrumpe el flujo."""
    inbox = current_app.config["VOLUNTARIOS_INBOX"]
    jornada = inscripcion.jornada or "(sin especificar)"
    telefono = inscripcion.telefono or "(no proporcionado)"
    try:
        enviar_correo(
            asunto=f"[Voluntarios chirimoyo.org] Nueva inscripción — {jornada}",
            destinatarios=[inbox],
            cuerpo=(
                f"Nueva inscripción de voluntario.\n\n"
                f"Nombre: {inscripcion.nombre}\n"
                f"Correo: {inscripcion.correo}\n"
                f"Teléfono: {telefono}\n"
                f"Jornada: {jornada}\n"
                f"Acompañantes: {inscripcion.acompanantes}\n"
            ),
            responder_a=inscripcion.correo,
        )
        enviar_correo(
            asunto="Recibimos tu inscripción — Comunidad Chirimoyo",
            destinatarios=[inscripcion.correo],
            cuerpo=(
                f"Hola {inscripcion.nombre}:\n\n"
                "Gracias por sumarte a las jornadas de la Comunidad Chirimoyo. "
                "Registramos tu inscripción y te compartiremos los detalles de la "
                "jornada pronto.\n\n"
                "Por la defensa del humedal de Chirimoyo.\n"
            ),
        )
    except Exception:
        # Nunca logueamos el contenido (PII). Solo el evento.
        log_event("inscripcion_email_fallido")
