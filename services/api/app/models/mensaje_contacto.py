from dataclasses import dataclass

from google.cloud import firestore


@dataclass(frozen=True)
class MensajeContacto:
    """Mensaje de contacto del público. Contiene PII (ADR-0012): nunca loguear
    sus campos; el consentimiento y su momento se persisten como evidencia."""

    nombre: str
    correo: str
    asunto: str
    mensaje: str
    consentimiento: bool
    origen: str = "landing"

    def to_firestore(self) -> dict:
        """Documento para la colección `contacto_mensajes`. `consentimiento_ts` y
        `creado_en` se sellan en el servidor (momento de la inscripción)."""
        return {
            "nombre": self.nombre,
            "correo": self.correo,
            "asunto": self.asunto,
            "mensaje": self.mensaje,
            "consentimiento": self.consentimiento,
            "consentimiento_ts": firestore.SERVER_TIMESTAMP,
            "creado_en": firestore.SERVER_TIMESTAMP,
            "origen": self.origen,
        }
