from dataclasses import dataclass

from google.cloud import firestore


@dataclass(frozen=True)
class Inscripcion:
    """Inscripción de un voluntario a una jornada. Contiene PII (ADR-0012):
    nunca loguear sus campos; el consentimiento y su momento se persisten como
    evidencia. Esquema minimizado: solo lo necesario para organizar la jornada."""

    nombre: str
    correo: str
    consentimiento: bool
    telefono: str = ""
    jornada: str = ""
    acompanantes: int = 0
    origen: str = "voluntarios"

    def to_firestore(self) -> dict:
        """Documento para la colección `voluntarios_inscripciones`.
        `consentimiento_ts` y `creado_en` se sellan en el servidor (momento de
        la inscripción)."""
        return {
            "nombre": self.nombre,
            "correo": self.correo,
            "telefono": self.telefono,
            "jornada": self.jornada,
            "acompanantes": self.acompanantes,
            "consentimiento": self.consentimiento,
            "consentimiento_ts": firestore.SERVER_TIMESTAMP,
            "creado_en": firestore.SERVER_TIMESTAMP,
            "origen": self.origen,
        }
