## Why

`apps/admin` nunca se ha desplegado de verdad a Cloud Run — todo el trabajo de Fase 6 (#138-#143) se verificó contra emulators y el bucket real de GCS, pero nunca contra el pipeline de deploy completo. La exploración de #144 encontró que **falta `apps/admin/.env.production`**: sin él, el primer deploy real horneraría un cliente de Firebase roto (`NEXT_PUBLIC_FIREBASE_API_KEY` etc. como `undefined` en el bundle), porque esos valores solo viven hoy en `.env.local` (gitignoreado, nunca llega al build de Docker). Además, el conocimiento de qué IAM/env vars/pasos manuales hacen falta antes de desplegar está disperso en secciones separadas del README por cada issue — sin un runbook único, cualquiera que intente el primer deploy real tiene que reconstruir ese conocimiento a mano.

## What Changes

- Nuevo `apps/admin/.env.production` con los 6 `NEXT_PUBLIC_FIREBASE_*` (placeholders vacíos — el usuario los rellena con los valores reales desde Firebase Console antes de desplegar), mismo patrón ya usado por `apps/sitio`/`apps/catalogo` para su token público de Cloudflare.
- Nuevo runbook `docs/guias/desplegar-admin-produccion.md` (mismo formato que `desplegar-fauna-produccion.md`), adaptado a la arquitectura real de `admin` (Cloud Run + Docker, ADR-0015 — no export estático): prerequisitos, pasos de deploy, checklist de smoke manual, cierre, rollback.
- El runbook consolida en un solo lugar los 3 roles IAM ya otorgados a lo largo de Fase 6, las env vars runtime que hay que configurar en el servicio Cloud Run (no se bakean en Docker), y los pasos manuales de provisión en Firebase Console.
- Confirma (sin cambiar nada) que el CI ya cubre `admin` desde #138 — el checklist item correspondiente del issue #144 ya está satisfecho.
- `apps/admin/README.md` gana una sección breve "Deploy a producción" que enlaza al runbook nuevo como fuente de verdad del "cómo", sin duplicar el contenido ya explicado por issue.

## Capabilities

### New Capabilities

- `deploy-runbook-admin` — no es comportamiento de aplicación; es el requisito operativo de que exista un runbook de deploy y un `.env.production` completos para `apps/admin`, verificable por inspección de archivos (no introduce ni modifica comportamiento en runtime del sistema).

### Modified Capabilities
(ninguna)

## Impact

- **Código/config nuevo:** `apps/admin/.env.production` (placeholders, sin valores reales).
- **Documentación nueva:** `docs/guias/desplegar-admin-produccion.md`.
- **Documentación modificada:** `apps/admin/README.md` (sección "Deploy a producción" enlazando al runbook).
- **Sin cambios:** Dockerfile, `firebase.json`, `.firebaserc`, scripts `deploy_run`/`deploy_prod`, `.github/workflows/ci-frontend.yml` (ya cubre admin), ningún código de aplicación.
- **Subdominios afectados:** admin (exclusivamente).
