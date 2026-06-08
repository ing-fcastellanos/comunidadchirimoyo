import logging

# Campos que NUNCA deben loguearse (PII de voluntarios/contacto). Ver ADR-0012.
_SENSITIVE = {
    "nombre", "name", "email", "correo", "telefono", "phone",
    "mensaje", "message", "contacto", "acompanantes", "payload", "body",
}

_logger = logging.getLogger("chirimoyo.api")


def log_event(event: str, **safe_fields) -> None:
    """Loguea un evento estructurado. Descarta cualquier campo sensible (PII).
    NUNCA pasar nombre, email, teléfono ni el cuerpo de la request."""
    safe = {k: v for k, v in safe_fields.items() if k.lower() not in _SENSITIVE}
    _logger.info(event, extra=safe)
