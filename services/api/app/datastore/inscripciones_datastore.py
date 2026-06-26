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
