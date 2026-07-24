from app.config import getDbClient
from app.models.inscripcion import Inscripcion

_COLECCION = "voluntarios_inscripciones"


def guardar_inscripcion(inscripcion: Inscripcion) -> str:
    """Persiste la inscripción en la colección `voluntarios_inscripciones` y
    devuelve el ID del documento. Firestore es la fuente de verdad: si la
    escritura falla, la excepción se propaga para que el caller responda 5xx.
    Nunca se loguean los datos del voluntario (PII, ADR-0012)."""
    db = getDbClient()
    _, doc_ref = db.collection(_COLECCION).add(inscripcion.to_firestore())
    return doc_ref.id


def listar_suscritos() -> list[dict]:
    """Voluntarios con `suscrito == True`, para el resumen semanal. Cada dict
    incluye `id` (el ID del documento, usado como token de desuscripción) y
    `nombre`/`correo`. Nunca se loguea el resultado (PII, ADR-0012)."""
    db = getDbClient()
    docs = db.collection(_COLECCION).where("suscrito", "==", True).stream()
    return [{"id": d.id, **d.to_dict()} for d in docs]


def desuscribir(doc_id: str) -> None:
    """Pone `suscrito: False` en el documento `doc_id`. Idempotente y silencioso
    si el documento no existe (el endpoint público nunca revela si un ID era
    válido, ver design.md D4)."""
    db = getDbClient()
    try:
        db.collection(_COLECCION).document(doc_id).update({"suscrito": False})
    except Exception:
        pass  # ID inexistente u otro error: no se revela, no se propaga
