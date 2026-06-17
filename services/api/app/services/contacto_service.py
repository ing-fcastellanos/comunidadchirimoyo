import re

from flask import current_app

from app.datastore.contacto_datastore import guardar_mensaje
from app.logging_utils import log_event
from app.models.mensaje_contacto import MensajeContacto
from app.services.email_service import enviar_correo

# Campo señuelo (honeypot). Un humano no lo ve ni lo rellena; un bot sí.
_HONEYPOT = "website"

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Límites razonables para evitar payloads abusivos.
_MAX = {"nombre": 120, "asunto": 160, "mensaje": 5000}

# Resultados posibles del procesamiento (el controller los mapea a HTTP).
OK = "ok"
SPAM = "spam"
INVALIDO = "invalido"


def _texto(payload: dict, campo: str) -> str:
    valor = payload.get(campo)
    return valor.strip() if isinstance(valor, str) else ""


def _validar(payload: dict) -> str | None:
    """Devuelve un detalle genérico (sin PII) si el payload es inválido, o None
    si es válido."""
    for campo in ("nombre", "asunto", "mensaje"):
        texto = _texto(payload, campo)
        if not texto:
            return f"El campo '{campo}' es requerido."
        if len(texto) > _MAX[campo]:
            return f"El campo '{campo}' excede el largo permitido."

    correo = _texto(payload, "correo")
    if not correo or not _EMAIL_RE.match(correo):
        return "El campo 'correo' no tiene un formato válido."

    if payload.get("consentimiento") is not True:
        return "Se requiere el consentimiento de privacidad."

    return None


def procesar_contacto(payload: dict) -> dict:
    """Valida, descarta spam, persiste y notifica un mensaje de contacto.

    - Honeypot relleno → SPAM (descarte silencioso, sin persistir ni notificar).
    - Payload inválido → INVALIDO con detalle genérico (sin PII).
    - Válido → persiste en Firestore (fuente de verdad) y envía correos
      best-effort (un fallo de SMTP NO cambia el resultado OK).

    Un fallo de persistencia se propaga como excepción (el controller responde 5xx).
    """
    if _texto(payload, _HONEYPOT):
        log_event("contacto_spam_rechazado")
        return {"resultado": SPAM}

    detalle = _validar(payload)
    if detalle:
        return {"resultado": INVALIDO, "detalle": detalle}

    mensaje = MensajeContacto(
        nombre=_texto(payload, "nombre"),
        correo=_texto(payload, "correo"),
        asunto=_texto(payload, "asunto"),
        mensaje=_texto(payload, "mensaje"),
        consentimiento=True,
    )

    doc_id = guardar_mensaje(mensaje)  # fuente de verdad; si falla, propaga
    log_event("contacto_recibido", doc_id=doc_id, origen=mensaje.origen)

    _notificar(mensaje)  # best-effort
    return {"resultado": OK}


def _notificar(mensaje: MensajeContacto) -> None:
    """Envía aviso interno y confirmación al remitente. Best-effort: cualquier
    fallo de SMTP se loguea (sin PII) y NO interrumpe el flujo."""
    inbox = current_app.config["CONTACTO_INBOX"]
    try:
        enviar_correo(
            asunto=f"[Contacto chirimoyo.org] {mensaje.asunto}",
            destinatarios=[inbox],
            cuerpo=(
                f"Nuevo mensaje de contacto.\n\n"
                f"Nombre: {mensaje.nombre}\n"
                f"Correo: {mensaje.correo}\n"
                f"Asunto: {mensaje.asunto}\n\n"
                f"{mensaje.mensaje}\n"
            ),
            responder_a=mensaje.correo,
        )
        enviar_correo(
            asunto="Recibimos tu mensaje — Comunidad Chirimoyo",
            destinatarios=[mensaje.correo],
            cuerpo=(
                f"Hola {mensaje.nombre}:\n\n"
                "Gracias por escribir a la Comunidad Chirimoyo. Recibimos tu "
                "mensaje y te responderemos pronto.\n\n"
                "Por la defensa del humedal de Chirimoyo.\n"
            ),
        )
    except Exception:
        # Nunca logueamos el contenido (PII). Solo el evento.
        log_event("contacto_email_fallido")
