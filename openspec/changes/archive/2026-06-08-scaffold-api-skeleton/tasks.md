<!-- Referencia de convenciones: C:\Users\Frank\source_code\sociedadsalvaje\services\api
     (app.py, config.py, app/__init__.py, app/config.py, Dockerfile, Makefile). -->

## 1. Esqueleto Flask

- [x] 1.1 Crear `services/api/app.py` (entrada → `create_app()`, `app.run` con puerto de env en dev)
- [x] 1.2 `config.py` (raíz): clase `Config` recortada — `ENV`, `APP_PORT`, `CORS_ORIGINS`, `DB_NAME` (default `(default)`), `MAIL_*` (placeholders)
- [x] 1.3 `app/__init__.py`: `create_app()` con Flask, CORS, logging JSON, registro de blueprints, headers de seguridad básicos
- [x] 1.4 `app/config.py`: `firestore.Client(database="(default)")` por ADC + `getDbClient()`
- [x] 1.5 Crear dirs `app/controllers/`, `app/services/`, `app/datastore/`, `app/models/` con `__init__.py`

## 2. Endpoints

- [x] 2.1 `app/controllers/health_controller.py`: `GET /health` → 200 `{status: ok, version}` (sin Firestore)
- [x] 2.2 `app/controllers/voluntarios_controller.py`: blueprint `/api/voluntarios` con handler stub → 501 "pendiente Fase 4"
- [x] 2.3 `app/controllers/contacto_controller.py`: blueprint `/api/contacto` con handler stub → 501 "pendiente Fase 4"
- [x] 2.4 Registrar los blueprints en `create_app()` (health sin prefijo; voluntarios/contacto con `/api/...`)

## 3. Logging sin PII (ADR-0012)

- [x] 3.1 Configurar `python-json-logger` → handler a stdout (nivel por `ENV`)
- [x] 3.2 Helper `log_event(event, **safe_fields)` que no acepta campos sensibles; documentar la regla de "nunca loguear cuerpos de request"

## 4. Empaquetado y deploy

- [x] 4.1 `requirements.txt`: flask, flask-cors, google-cloud-firestore, gunicorn, python-dotenv, flask-mail, python-json-logger
- [x] 4.2 `Dockerfile` (python:3.12-slim → gunicorn `app:create_app()` en :8080) + `.dockerignore`
- [x] 4.3 `Makefile`: `run` (flask dev), `deploy_prod` (build → push a AR `containers` → `gcloud run deploy api` en northamerica-south1 con `--service-account=chirimoyo-api`, `--allow-unauthenticated`, `--min-instances=0`)
- [x] 4.4 `.env.example` (sin secretos) + `README.md` (correr local con ADC, deploy, alcance mínimo)

## 5. Verificación local

- [x] 5.1 venv + `pip install -r requirements.txt`
- [x] 5.2 `gcloud auth application-default login` (ADC local)
- [x] 5.3 `python app.py` → `GET /health` responde 200; `/api/voluntarios` y `/api/contacto` responden 501
- [x] 5.4 `python -m compileall app` (smoke del CI de API)

## 6. Despliegue a Cloud Run

- [x] 6.1 `make deploy_prod` (build + push + deploy como `chirimoyo-api`)
- [x] 6.2 Verificar `GET <url-run.app>/health` → 200 y que la SA de runtime es `chirimoyo-api`
- [x] 6.3 Anotar la URL `run.app` en el README (el mapeo de `api.chirimoyo.org` queda para después)
