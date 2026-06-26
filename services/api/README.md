# services/api

API de Comunidad Chirimoyo → **api.chirimoyo.org**. Python 3.12 + Flask + Firestore.

**Alcance mínimo** (ADR-0006): solo inscripciones de voluntarios y formulario de contacto. **Sin** auth de usuarios, RBAC, pagos, Sentry ni scheduled tasks. Ampliar el alcance requiere un ADR.

> Estado: `/health`, `POST /api/contacto` y `POST /api/voluntarios` (inscripción) implementados. Persistencia en Firestore (fuente de verdad), email best-effort, anti-spam por honeypot y sin PII en logs (ADR-0012).

## Estructura

```
services/api/
├── app.py              entrada local (python app.py)
├── config.py           Config (env): ENV, CORS_ORIGINS, DB_NAME, MAIL_*
├── app/
│   ├── __init__.py     create_app(): Flask · CORS · logging JSON · blueprints
│   ├── config.py       cliente Firestore (lazy, ADC, base (default))
│   ├── logging_utils.py  log_event() — sin PII (ADR-0012)
│   ├── controllers/    health · voluntarios (inscripción) · contacto
│   └── services/ datastore/ models/   contacto + inscripción de voluntarios
├── scripts/            purgar_inscripciones.py (retención, ADR-0012)
├── Dockerfile · Makefile · requirements.txt · .env.example
```

## Desarrollo local

```bash
python -m venv .venv
source .venv/Scripts/activate        # Windows; en Unix: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                  # ajusta si hace falta

# Para que Firestore funcione localmente (no requerido por /health):
gcloud auth application-default login

ENV=dev python app.py                 # Flask en :8080
curl http://localhost:8080/health     # {"status":"ok",...}
```

`/health` no toca Firestore, así que arranca sin ADC. Los stubs responden `501`.

## Despliegue (Cloud Run, prod)

Requiere Docker y `gcloud` autenticado. Imagen → Artifact Registry `containers`; servicio corre como la SA `chirimoyo-api` (sin llave JSON).

```bash
make deploy_prod
# build → push → gcloud run deploy api (northamerica-south1, escala a cero)
```

URL `run.app` del servicio: _(se anota tras el primer deploy)_. El mapeo de `api.chirimoyo.org` queda para después (Firebase rewrite o domain mapping).

## Retención de datos de voluntarios (ADR-0012)

Las inscripciones (`voluntarios_inscripciones`) contienen datos personales y se conservan **solo mientras son útiles para organizar las jornadas**. Política: se borran **pasados 12 meses** desde su creación (umbral ajustable). El borrado es por ahora **manual**, con el script versionado:

```bash
# desde services/api/, con ADC del proyecto disponible
python -m scripts.purgar_inscripciones --dry-run     # lista las vencidas, no borra
python -m scripts.purgar_inscripciones               # borra (umbral 12 meses)
python -m scripts.purgar_inscripciones --meses 6     # otro umbral
```

El script no imprime PII (solo IDs y conteos). La **automatización** del borrado (Firestore TTL) es una mejora futura con su propio issue.

## Convenciones

- División `controllers/` (HTTP) → `services/` (lógica) → `datastore/` (Firestore) → `models/` (entidades).
- Firestore por ADC; **nunca** commitear un service account JSON.
- **Nunca** loguear cuerpos de request (PII de voluntarios). Usar `log_event()` con campos no sensibles. Ver ADR-0012.
- Cambios de comportamiento → actualizar la spec OpenSpec correspondiente.
