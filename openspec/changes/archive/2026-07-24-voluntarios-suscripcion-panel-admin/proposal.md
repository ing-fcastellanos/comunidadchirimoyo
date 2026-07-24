## Why

Hoy una inscripción de voluntario es un evento único: se persiste, se manda una confirmación, y nadie vuelve a tocar ese registro hasta que el TTL de retención lo borra (12 meses, ADR-0027). No existe ningún mecanismo de seguimiento — ni recordatorios de jornadas próximas para quien se inscribió, ni una forma de que el equipo organizador vea, filtre o dé seguimiento a quién se ha inscrito, más allá de acceso directo a Firestore vía IAM.

Esto deja dos huecos concretos:
1. Alguien que se inscribe "otra / disponibilidad general" (o a cualquier jornada) nunca vuelve a saber de nosotros salvo que el equipo lo contacte manualmente, uno por uno.
2. El equipo organizador no tiene forma de ver la lista de inscritos, filtrarla, ni registrar que ya se contactó a alguien — todo vive en Firestore sin UI.

## What Changes

### Capability 1 — `notificaciones-jornadas-voluntarios` (nueva)
- Las inscripciones **nuevas** de voluntarios quedan **suscritas** (`suscrito: true`) a un resumen semanal de jornadas/eventos próximos. Las inscripciones **existentes** (anteriores a este cambio) **no** quedan suscritas retroactivamente — se hicieron bajo un aviso de privacidad que no mencionaba correos recurrentes (ADR-0012); un admin puede suscribirlas manualmente desde el panel si hace falta (capability 2).
- Cloud Scheduler (semanal) dispara un Route Handler en `apps/sitio`, que calcula la agenda de la semana reusando `proximasJornadas()` (ya existente, `apps/sitio/lib/jornadas.ts`) y hace `POST` a un endpoint nuevo en `services/api`, protegido por un secreto compartido (mismo patrón que `REVALIDATE_SECRET`).
- `services/api` lee los voluntarios `suscrito: true`, arma un correo de **resumen agregado** (una sola plantilla HTML con todas las jornadas/eventos de la semana, no un correo por jornada) usando `plantilla_html()` ya existente, y lo envía.
- Cada correo incluye un link de **desuscripción** (`GET /api/voluntarios/desuscribir?id=<docId>`, público, sin auth — el ID de documento de Firestore ya es un token aleatorio de 20 caracteres). La suscripción es **indefinida** (sin expiración propia más allá del TTL general).
- El formulario de inscripción (`apps/sitio`) actualiza su texto de consentimiento para mencionar explícitamente el resumen semanal y la opción de darse de baja.

### Capability 2 — `panel-voluntarios-admin` (nueva)
- Nueva sección en `apps/admin` para ver los voluntarios inscritos (`voluntarios_inscripciones`), con filtros (por jornada, por estado de suscripción, por si ya fue contactado).
- **Log de contactos**: subcolección `voluntarios_inscripciones/{id}/contactos` — múltiples entradas por voluntario, cada una con quién de staff lo hizo, cuándo, y una nota. El panel muestra el estado de suscripción de cada voluntario.
- **Exportación a CSV** que respeta los filtros activos en pantalla (no siempre el universo completo).

## Capabilities

### New Capabilities
- `notificaciones-jornadas-voluntarios`: suscripción a resumen semanal de jornadas/eventos, con desuscripción vía link en cada correo.
- `panel-voluntarios-admin`: vista de voluntarios inscritos en `apps/admin`, log de contactos por voluntario, exportación a CSV filtrada.

### Modified Capabilities
- `inscripcion-voluntarios`: la persistencia de una inscripción nueva agrega el campo `suscrito: true`.
- `inscripcion-voluntarios-frontend`: el copy de consentimiento del formulario menciona el resumen semanal y la opción de darse de baja.

## Impact

- **Código nuevo**: Route Handler en `apps/sitio` (cálculo de agenda semanal + trigger), dos endpoints nuevos en `services/api` (notificar semana + desuscribir), sección nueva en `apps/admin` (lista + detalle + log de contactos + export CSV).
- **Firestore**: nuevo campo `suscrito` en `voluntarios_inscripciones`; nueva subcolección `voluntarios_inscripciones/{id}/contactos`.
- **Infra**: nuevo Cloud Scheduler (semanal), nuevo secreto compartido `NOTIFICAR_VOLUNTARIOS_SECRET` entre `sitio` y `api`.
- **Contenido**: copy del formulario de inscripción (`apps/sitio`) actualizado.
- **Sub-dominios afectados**: `sitio`, `api`, `admin`.
