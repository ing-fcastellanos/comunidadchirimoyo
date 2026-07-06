import os

from dotenv import load_dotenv

load_dotenv()

# Retención de datos de voluntarios (ADR-0012 / ADR-0027): las inscripciones
# (PII) se conservan este número de meses tras su creación y luego se borran.
# Fuente única del umbral, compartida por el modelo (sella `expira_en` para el
# TTL de Firestore) y por el script de respaldo `scripts/purgar_inscripciones.py`.
RETENCION_MESES = 12

# Cliente Firestore por ADC, base (default). Lazy: NO se instancia al importar,
# así /health funciona sin credenciales. En local, ADC viene de
# `gcloud auth application-default login`; en Cloud Run, de la SA runtime
# (chirimoyo-api). Sin llave JSON. Ver ADR-0003 / ADR-0006.
_client = None


def getDbClient():
    global _client
    if _client is None:
        from google.cloud import firestore

        _client = firestore.Client(database=os.getenv("DB_NAME", "(default)"))
    return _client
