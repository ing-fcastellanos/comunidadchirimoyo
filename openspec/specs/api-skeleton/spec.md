# api-skeleton Specification

## Purpose
TBD - created by archiving change scaffold-api-skeleton. Update Purpose after archive.
## Requirements
### Requirement: Servicio Flask con factory

`services/api` SHALL ser un servicio Python 3.12 + Flask con un factory `create_app()` (en `app/__init__.py`) y un punto de entrada `app.py`. El servicio SHALL seguir la división `controllers/` (entrada HTTP), `services/` (lógica), `datastore/` (Firestore) y `models/` (entidades). El servicio NO SHALL incluir auth de usuarios, RBAC, pagos, Sentry ni scheduled tasks.

#### Scenario: El factory crea la app
- **WHEN** se invoca `create_app()`
- **THEN** devuelve una instancia Flask con las rutas y CORS registrados, sin errores

#### Scenario: Alcance mínimo
- **WHEN** se inspecciona el servicio
- **THEN** no hay JWT/auth, pagos, Sentry ni scheduled tasks (ADR-0006)

### Requirement: Endpoint de salud

El servicio SHALL exponer `GET /health` que responde `200` con un cuerpo JSON que incluye al menos `status: "ok"`. Este endpoint NO SHALL requerir Firestore ni autenticación.

#### Scenario: Health responde
- **WHEN** se hace `GET /health`
- **THEN** responde `200` con `{"status": "ok", ...}`

#### Scenario: Health no depende de Firestore
- **WHEN** Firestore no está disponible o sin credenciales
- **THEN** `GET /health` sigue respondiendo `200`

### Requirement: Conexión a Firestore por ADC

El servicio SHALL conectarse a Firestore con `firestore.Client(database="(default)")` usando Application Default Credentials: en local vía `gcloud auth application-default login`; en Cloud Run vía la service account runtime `chirimoyo-api`. El servicio NO SHALL requerir ni commitear un archivo de service account JSON.

#### Scenario: Sin llave JSON en el repo
- **WHEN** se revisa el repositorio
- **THEN** no existe ningún `*service_account*.json`; el cliente Firestore usa ADC

### Requirement: Endpoints de voluntarios y contacto como stub

El servicio SHALL registrar los blueprints `voluntarios` (`/api/voluntarios`) y `contacto` (`/api/contacto`). El handler de `voluntarios` SHALL responder `501 Not Implemented` indicando que su lógica se implementa más adelante; su lógica real (validación, escritura en Firestore, email, privacidad) NO SHALL implementarse en este alcance. El handler de `contacto` SHALL implementar su comportamiento real, definido en la capability `contacto` (recepción, validación, persistencia y notificación), y por tanto NO SHALL responder `501`.

#### Scenario: Stub de voluntarios visible
- **WHEN** se hace una petición a `/api/voluntarios`
- **THEN** responde `501` con un mensaje que indica que está pendiente

#### Scenario: Contacto ya no es stub
- **WHEN** se hace `POST /api/contacto` con un payload válido
- **THEN** NO responde `501`; procesa el mensaje según la capability `contacto`

### Requirement: CORS configurable sin el catálogo

El servicio SHALL aplicar CORS sobre `/api/*` con orígenes tomados de la variable de entorno `CORS_ORIGINS` (lista separada por comas), con un default que incluye los subdominios de `apps/sitio` y `localhost` de desarrollo. El origen del catálogo (`aves.chirimoyo.org`) NO SHALL ser necesario (el catálogo es estático y no llama al API).

#### Scenario: Orígenes permitidos
- **WHEN** una petición a `/api/*` viene de un origen en `CORS_ORIGINS`
- **THEN** la respuesta incluye los headers CORS correspondientes

### Requirement: Logging estructurado sin PII

El servicio SHALL emitir logs en JSON a stdout (para Cloud Logging) y NO SHALL loguear los cuerpos de las peticiones de voluntarios/contacto (contienen datos personales). El scaffold SHALL documentar esta regla y proveer un helper de logging que solo acepte campos no sensibles.

#### Scenario: No se loguea PII
- **WHEN** llega una petición con datos personales
- **THEN** los logs registran el evento/metadatos pero nunca el cuerpo con PII (ADR-0012)

### Requirement: Despliegue a Cloud Run

El servicio SHALL incluir un `Dockerfile` (Python 3.12, gunicorn en el puerto 8080) y un `Makefile` con `deploy_prod` que construya la imagen, la suba a Artifact Registry `containers` y despliegue a Cloud Run en `northamerica-south1` corriendo como la service account `chirimoyo-api`, con escala a cero. SHALL existir un único ambiente (prod).

#### Scenario: Health vivo en Cloud Run
- **WHEN** se despliega con `make deploy_prod` y se consulta `GET <url-run.app>/health`
- **THEN** responde `200`

#### Scenario: Corre como la SA dedicada
- **WHEN** se revisa el servicio Cloud Run
- **THEN** su service account de runtime es `chirimoyo-api@chirimoyo.iam.gserviceaccount.com`

