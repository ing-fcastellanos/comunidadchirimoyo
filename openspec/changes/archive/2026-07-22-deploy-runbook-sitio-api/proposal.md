## Why

`apps/sitio` y `services/api` nunca han recibido un deploy real desde su scaffold inicial de Fase 0 (2026-06-08) — confirmado en vivo: `chirimoyo.org` sirve el placeholder "ANDAMIAJE" en `/`, `/comunidad` y `/voluntarios` (no el landing/linktree/contacto real de Fase 3-4), y `POST /api/contacto` responde `501 "No implementado"` (el stub original, no la implementación real de #46). Todo lo construido desde entonces — contacto, inscripción de voluntarios, retención TTL, fix de logging, Firestore rules (estas sí están aplicadas, verificado) — está mergeado en main pero nunca llegó a producción. Además, `docs/guias/desplegar-sitio-produccion.md` no existe, y los redirects vanity `comunidad.*`/`voluntarios.*` nunca se configuraron (confirmado: no resuelven en vivo).

## What Changes

- Nuevo runbook `docs/guias/desplegar-sitio-produccion.md` (equivalente al de fauna/admin) cubriendo, en un solo documento: redeploy real de `services/api` (con secrets SMTP vía Secret Manager, hoy inexistentes — la API ni siquiera está habilitada en el proyecto), redeploy real de `apps/sitio`, y la configuración de los redirects vanity `comunidad.chirimoyo.org`/`voluntarios.chirimoyo.org` (redirect plano a la raíz de sección, igual que el precedente ya viviendo de `aves.chirimoyo.org` — sin preservar subpath).
- El runbook documenta el orden correcto (api primero, verificar que ya no responda 501, luego sitio) y consolida los hallazgos de esta exploración: qué está realmente desplegado hoy, qué falta, y por qué.
- `api.chirimoyo.org` (DNS público del API) queda **fuera de alcance** — el navegador nunca llama a esa URL directamente; `apps/sitio` usa `API_URL` server-side apuntando a la URL cruda de Cloud Run.
- Este cambio entrega el **runbook** (documentación); ejecutar el redeploy real de `api`/`sitio` y configurar el DNS en Porkbun son acciones posteriores del usuario siguiendo el runbook — mismo patrón que `deploy-runbook-admin` (#144).

## Capabilities

### New Capabilities
- `deploy-runbook-sitio-api`: no es comportamiento de aplicación; es el requisito de que exista un runbook de deploy para `apps/sitio` + `services/api` que cubra el redeploy real, los secrets SMTP y los redirects vanity, verificable por inspección del documento.

### Modified Capabilities
(ninguna)

## Impact

- **Documentación nueva:** `docs/guias/desplegar-sitio-produccion.md`.
- **Sin cambios de código de aplicación** en este change — el runbook documenta acciones de infra (Secret Manager, IAM, `gcloud run deploy`, DNS en Porkbun) que el usuario ejecuta después, no cambios al Dockerfile/firebase.json/Makefile existentes (ya son correctos).
- **Sub-dominios afectados:** `sitio` (chirimoyo.org + comunidad/voluntarios), `api`.
