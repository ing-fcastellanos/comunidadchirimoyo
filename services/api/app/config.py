import os

from dotenv import load_dotenv

load_dotenv()

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
