## Why

`services/api` (api.chirimoyo.org) es el único backend del proyecto y hoy no existe. Antes de implementar inscripciones de voluntarios y contacto (Fase 4) necesitamos el **esqueleto** del servicio Flask: factory, conexión a Firestore, CORS, logging sin PII y la cadena de despliegue a Cloud Run. La infra ya está lista (issue #2): Firestore `(default)`, Artifact Registry `containers`, SA `chirimoyo-api`. Es el issue #7 de Fase 0.

**Sub-dominios afectados:** `api`.

## What Changes

- Se crea **`services/api`**: Python 3.12 + Flask, espejo recortado de `services/api` de Sociedad Salvaje (factory `create_app()`, división `controllers/services/datastore/models`, Dockerfile gunicorn, Makefile de deploy).
- **Alcance MÍNIMO** (ADR-0006): **sin** JWT/auth de usuarios, **sin** RBAC, **sin** pagos, **sin** Sentry, **sin** scheduled tasks. Si algo de eso hiciera falta, requiere un ADR.
- **Firestore** vía `firestore.Client(database="(default)")` con ADC: local usa `gcloud auth application-default login`; Cloud Run corre como la SA `chirimoyo-api` (sin llave JSON). Cero secretos para Firestore.
- **Endpoints**: `GET /health` funcional (200). Blueprints `/api/voluntarios` y `/api/contacto` **registrados como stub (501 "pendiente Fase 4")** — dejan visible el contrato; la lógica real es Fase 4.
- **CORS**: orígenes de `apps/sitio` (chirimoyo.org, comunidad, voluntarios) + localhost, configurable por env. El catálogo (aves) **no** se incluye: es estático y no llama al API (ADR-0005).
- **Logging**: JSON estructurado a stdout (Cloud Logging), **sin loguear cuerpos de request** (contienen PII de voluntarios) — guía + helper desde el inicio (ADR-0012).
- **Despliegue**: build → Artifact Registry `containers` → Cloud Run (`northamerica-south1`), corriendo como `chirimoyo-api`, escala a cero, `allow-unauthenticated`. Solo ambiente **prod** (ADR-0003). Se despliega ahora para validar la cadena y dejar `/health` vivo.

### No-goals

- **No** implementa la lógica de inscripción de voluntarios ni de contacto (validación, escritura en Firestore, modelos) → Fase 4.
- **No** envía emails de confirmación (solo deja `flask-mail` + config placeholder) → Fase 4.
- **No** define el aviso de privacidad / consentimiento / retención (ADR-0012) → Fase 4.
- **No** mapea `api.chirimoyo.org` (Firebase rewrite o domain mapping) — el scaffold deja `/health` en la URL `run.app`.
- **No** introduce auth, pagos, Sentry ni scheduled tasks.

## Capabilities

### New Capabilities

- `api-skeleton`: el esqueleto del servicio API — factory Flask, conexión a Firestore por ADC, `/health`, CORS, logging sin PII, blueprints stub de voluntarios/contacto, y la cadena de despliegue a Cloud Run.

### Modified Capabilities

<!-- Ninguna. -->

## Impact

- **Nuevos archivos**: árbol `services/api/` (app.py, config.py, app/, Dockerfile, Makefile, requirements.txt, .env.example, README.md).
- **Nuevas dependencias** (Python): `flask`, `flask-cors`, `google-cloud-firestore`, `gunicorn`, `python-dotenv`, `flask-mail` (uso real en Fase 4), `python-json-logger`.
- **Infra**: un servicio Cloud Run nuevo (`api`/prod) en `northamerica-south1`, imagen en AR `containers`, corriendo como `chirimoyo-api`.
- **CI**: `ci-api.yml` (activado en #8) correrá ruff + `compileall` sobre `services/api`.
- **Sin impacto** en `apps/catalogo` (no usa el API) ni en `apps/sitio` (aún no existe).
