## Context

`services/api` no existe aún. La referencia de convenciones es `services/api` de Sociedad Salvaje (factory `create_app()` en `app/__init__.py`, `config.py` raíz con `Config`, `app/config.py` con el cliente Firestore, división `controllers/services/datastore/models`, Dockerfile gunicorn, Makefile de deploy). Pero ese API es grande (JWT, pagos, Meta, scheduled, Sentry); el de Chirimoyo es **mínimo** (ADR-0006): solo inscripciones de voluntarios y contacto, y ambos se implementan en Fase 4 — este change es el **esqueleto**.

Infra lista (issue #2): proyecto `chirimoyo`, Firestore `(default)` en `northamerica-south1`, AR `containers`, SA `chirimoyo-api` con `roles/datastore.user`.

## Goals / Non-Goals

**Goals:**
- Esqueleto Flask desplegable con `/health` y la cadena a Cloud Run validada.
- Conexión a Firestore sin secretos (ADC).
- CORS y logging-sin-PII correctos desde el inicio.
- Contrato visible (stubs de voluntarios/contacto) sin implementar la lógica.

**Non-Goals:**
- Lógica de inscripción/contacto, email, privacidad (Fase 4); auth, pagos, Sentry, scheduled; mapeo de `api.chirimoyo.org`.

## Decisions

### D1 · Firestore por ADC, base `(default)`

`app/config.py`: `firestore.Client(database="(default)")`. Sin `GOOGLE_APPLICATION_CREDENTIALS` ni llave JSON:
- **Local**: `gcloud auth application-default login` provee ADC.
- **Cloud Run**: el servicio corre como `chirimoyo-api` (runtime SA = ADC).

Esto evita gestionar/commitear un service account JSON (a diferencia de SS, que aún usa `cleo-service_account.json`). Más simple y más seguro.

### D2 · Endpoints: `/health` + stubs

- `GET /health` → `200 {"status":"ok","version":...}`. Sin prefijo `/api` (para health checks de Cloud Run).
- Blueprints `voluntarios` (`/api/voluntarios`) y `contacto` (`/api/contacto`) registrados, pero sus handlers responden **501 Not Implemented** con un mensaje "pendiente Fase 4". Esto deja el contrato y las rutas visibles, y permite desplegar sin lógica.

### D3 · Logging JSON sin PII (ADR-0012)

`python-json-logger` → handler a stdout (Cloud Logging lo estructura). **Regla dura**: nunca loguear el cuerpo de las requests de voluntarios/contacto (PII). Se documenta y se provee un helper `log_event(event, **safe_fields)` que solo acepta campos no-sensibles. Sin Sentry (CLAUDE.md: solo Cloud Logging).

### D4 · CORS configurable

`flask-cors` sobre `/api/*`, orígenes desde env `CORS_ORIGINS` (CSV). Default: `https://chirimoyo.org`, `https://comunidad.chirimoyo.org`, `https://voluntarios.chirimoyo.org`, `http://localhost:3000`. **No** se incluye `aves.chirimoyo.org` (catálogo estático, no llama al API — ADR-0005).

### D5 · Despliegue a Cloud Run (prod-only)

- Dockerfile `python:3.12-slim` → `gunicorn -b 0.0.0.0:8080 app:create_app()`.
- Makefile `deploy_prod`: `docker build` → push a `northamerica-south1-docker.pkg.dev/chirimoyo/containers/api:latest` → `gcloud run deploy api --region=northamerica-south1 --service-account=chirimoyo-api@chirimoyo.iam.gserviceaccount.com --allow-unauthenticated --min-instances=0 --port=8080`.
- Un solo servicio/ambiente (`api`, prod) — ADR-0003. QA se añadiría con ADR.
- Variables de entorno (ENV, CORS_ORIGINS, MAIL_*) vía `--set-env-vars`; los secretos reales (SMTP password) se resuelven en Fase 4 (Secret Manager o env), no aquí.

### D6 · Config recortada

`config.py` `Config` con solo lo necesario: `ENV`, `APP_PORT`, `CORS_ORIGINS`, `DB_NAME` (default `(default)`), `MAIL_*` (placeholders). Sin bloques de JWT/pagos/Meta.

## Risks / Trade-offs

- **ADC local requiere `gcloud auth application-default login`** → se documenta en el README; si falta, el cliente Firestore falla con un error claro al primer uso (el `/health` no toca Firestore, así que arranca igual).
- **`allow-unauthenticated`** expone el API públicamente → aceptable: es un API público de formularios; la protección real (rate limiting, captcha, validación) se diseña en Fase 4.
- **Region `northamerica-south1` y domain mapping**: el mapeo de `api.chirimoyo.org` puede requerir Firebase Hosting rewrite si Cloud Run domain mapping no está en esa región → se resuelve al mapear (post-scaffold).
- **PII en logs**: riesgo si alguien loguea el payload → mitigado con la guía + helper y la ausencia de logging de cuerpos en el scaffold.

## Migration Plan

1. Crear `services/api/` (app.py, config.py, app/__init__.py, app/config.py, controllers/health+stubs, dirs services/datastore/models).
2. `requirements.txt`, `Dockerfile`, `.dockerignore`, `Makefile`, `.env.example`, `README.md`.
3. Local: venv + `pip install`; `gcloud auth application-default login`; `python app.py` → `GET /health` 200.
4. Deploy: `make deploy_prod` → Cloud Run; verificar `GET <run-url>/health` 200.
5. (Opcional) smoke test `tests/test_health.py`.

Rollback: borrar el servicio Cloud Run (`gcloud run services delete api`) y la carpeta; no hay datos ni consumidores.

## Open Questions

- Nombre del servicio Cloud Run: `api` (simple, prod-only) vs `api-prod`. Propuesta: `api`.
- Secret de SMTP: Secret Manager vs env var → se decide en Fase 4 (no se necesita en el scaffold).
- Mapeo `api.chirimoyo.org`: Firebase rewrite vs Cloud Run domain mapping → post-scaffold.
