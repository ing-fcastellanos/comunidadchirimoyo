## Why

La inscripción de voluntarios (#21) dejó la **política de retención documentada + un script de borrado manual** (`scripts/purgar_inscripciones.py`, ADR-0012): las inscripciones (PII) se conservan ~12 meses y luego se borran. Hoy ese borrado **depende de correr el script a mano**, lo que es frágil (si nadie lo ejecuta, los datos se acumulan indefinidamente) y contradice de facto lo que el aviso de privacidad (#44) ya **promete** al usuario ("las inscripciones se eliminan alrededor de un año después de la jornada").

Este cambio **automatiza** la retención con una **política TTL de Firestore**: cada inscripción guarda un campo `expira_en` (fecha de creación + umbral), y Firestore borra los documentos vencidos sin intervención humana. La activación de la política es un paso de configuración manual (Firestore no se gestiona con IaC en este proyecto), por lo que se documenta y se registra en un **ADR-0027**.

## What Changes

- **Materializar `expira_en`** en cada inscripción nueva: `app/models/inscripcion.py` añade `expira_en = creado_en + RETENCION_MESES` al documento (calculado en el servidor al escribir).
- **Centralizar el umbral de retención**: nueva constante `RETENCION_MESES = 12` en `app/config.py`, usada por el modelo y por el script de purga (hoy el `12` vive solo en el script → fuente única).
- **Documentar la política TTL** en `services/api/README.md`: cómo activarla (`gcloud`/consola) sobre `expira_en` en `voluntarios_inscripciones`, su naturaleza best-effort (24–72 h) y la validación post-deploy.
- **Registrar la decisión** en `docs/decisions/0027-retencion-inscripciones-firestore-ttl.md` + fila en `docs/adr/_index.md`.
- **Mantener el script manual** como respaldo (cubre documentos previos sin `expira_en` y la latencia del TTL); ahora importa `RETENCION_MESES`.

## No-goals

- **No** se automatiza contacto (`contacto_mensajes`): el aviso no promete umbral fijo ahí (queda como nota/issue futuro).
- **No** se retira el script de purga (se conserva como respaldo).
- **No** se introduce IaC ni Cloud Functions: la política TTL se activa a mano y se documenta (ADR-0006, sin infra nueva de código).
- **No** se cambia el contrato del endpoint `POST /api/voluntarios` ni el esquema visible del cliente.
- **No** se hace backfill masivo de documentos viejos (el script de respaldo los cubre).

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `inscripcion-voluntarios`: la política de retención SHALL incluir además la **automatización vía Firestore TTL** (campo `expira_en` sellado al inscribir + política TTL documentada), dejando el script como medio de respaldo.

## Impact

- **Servicio afectado:** `services/api`.
- **Código:** `app/config.py` (constante `RETENCION_MESES`), `app/models/inscripcion.py` (campo `expira_en`), `scripts/purgar_inscripciones.py` (importa la constante).
- **Docs:** `services/api/README.md` (setup TTL), `docs/decisions/0027-*.md` (ADR nuevo), `docs/adr/_index.md` (índice).
- **Firestore:** requiere activar una **política TTL** sobre `expira_en` (paso manual, documentado; no es código).
- **Decisión no trivial (activar TTL de infra)** → **ADR-0027**. Implementa y refuerza ADR-0012.
- **Verificación:** el PR valida que `expira_en` se escribe correcto; el borrado automático real es validación **post-deploy** (Firestore tarda hasta 72 h), documentada como paso manual.
