from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from google.cloud import firestore

from app.config import RETENCION_MESES


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
        la inscripción). `expira_en` es la fecha de borrado por retención
        (ADR-0027): la política TTL de Firestore elimina el documento cuando ese
        timestamp queda en el pasado. Se calcula en el cliente porque
        `SERVER_TIMESTAMP` es una sentinela sin valor hasta el commit y no admite
        aritmética; la diferencia con el `creado_en` real es de milisegundos,
        irrelevante para una retención de 12 meses. Misma convención de
        30 días/mes que el script de respaldo, para que ambos coincidan."""
        expira_en = datetime.now(timezone.utc) + timedelta(days=30 * RETENCION_MESES)
        return {
            "nombre": self.nombre,
            "correo": self.correo,
            "telefono": self.telefono,
            "jornada": self.jornada,
            "acompanantes": self.acompanantes,
            "consentimiento": self.consentimiento,
            "consentimiento_ts": firestore.SERVER_TIMESTAMP,
            "creado_en": firestore.SERVER_TIMESTAMP,
            "expira_en": expira_en,
            "origen": self.origen,
        }
