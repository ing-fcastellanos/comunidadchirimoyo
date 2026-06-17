from app.config import getDbClient
from app.models.mensaje_contacto import MensajeContacto

_COLECCION = "contacto_mensajes"


def guardar_mensaje(mensaje: MensajeContacto) -> str:
    """Persiste el mensaje en la colección `contacto_mensajes` y devuelve el ID
    del documento. Firestore es la fuente de verdad: si la escritura falla, la
    excepción se propaga para que el caller responda 5xx. Nunca se loguea el
    cuerpo (PII, ADR-0012)."""
    db = getDbClient()
    _, doc_ref = db.collection(_COLECCION).add(mensaje.to_firestore())
    return doc_ref.id
