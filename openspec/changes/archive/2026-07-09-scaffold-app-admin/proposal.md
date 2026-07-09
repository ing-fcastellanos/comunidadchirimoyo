## Why

La Fase 6 necesita un panel de administración para gestionar noticias y jornadas ([ADR-0030](../../../docs/decisions/0030-app-admin-firebase-native.md)). Antes de construir login (#139) o cualquier CRUD (#140/#141), hace falta el **esqueleto deployable** de la app: `apps/admin` scaffoldeado con el mismo stack y convenciones que `sitio`/`catalogo`, y su subdominio (`admin.chirimoyo.org`) cableado de punta a punta. Sin esto, no hay dónde aterrizar el resto de la épica #133 (issue #138).

## What Changes

- **Nueva app `apps/admin`** (Next 15, App Router), scaffold espejo de `apps/sitio`: `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json` (shadcn), `next.config.ts` (`output: "standalone"`, Cloud Run). Reusa **tokens de diseño por copia** (ADR-0013) — `scripts/sync-design-tokens.mjs` ya es genérico y los sincroniza sin cambios.
- **Layout base minimalista**: `app/layout.tsx` (tokens/globals, branding "Comunidad Chirimoyo · Admin") + `app/page.tsx` placeholder. **Route group `(authed)/` creado como stub** (carpeta + `layout.tsx` vacío, sin lógica de auth) para que #139 solo rellene el gate sin reestructurar rutas.
- **`.env.example`** con `NEXT_PUBLIC_FIREBASE_*` **stubbeado** (config pública del Web SDK: `apiKey`, `authDomain`, `projectId`, etc.) — sin la dependencia `firebase` ni código de auth, que son de #139.
- **`Dockerfile`** (`node:24-alpine`, corrigiendo el drift de `sitio/Dockerfile` que usa `node:22-alpine` pese a que ADR-0022 fija Node 24.12.0 como toolchain del proyecto).
- **`firebase.json` + `.firebaserc`**: target apuntando al site de Firebase Hosting **ya existente** `admin-chirimoyo` (no se aprovisiona, solo se referencia), con rewrite a un servicio Cloud Run `admin` en **`us-central1`** (ADR-0015, misma restricción de región que `sitio`).
- **`package.json` con scripts de deploy completos** (`docker:build`, `docker:push`, `deploy_run`, `firebase:deploy`, `deploy_prod`) — el scaffold es un skeleton *deployable*, no solo código.
- **`.github/workflows/ci-frontend.yml`**: se agrega `admin` a la matriz (`[sitio, catalogo, admin]`) para que lint/typecheck corran automático desde el primer PR de #139.
- **DNS**: `admin.chirimoyo.org` apuntando a Firebase Hosting en Porkbun (paso manual, fuera del repo — mismo patrón que los demás subdominios).

## No-goals

- **No** se implementa login ni ninguna lógica de auth (#139): el route group `(authed)` queda vacío, sin gate.
- **No** se instala el Web SDK de Firebase (`firebase`) ni se inicializa el cliente — solo los nombres de variables de entorno quedan documentados en `.env.example`.
- **No** se construye ningún CRUD de noticias/jornadas (#140/#141) ni subida de imágenes (#142).
- **No** se aprovisiona el site de Firebase Hosting `admin-chirimoyo` (ya existe); tampoco se crea el service Cloud Run en GCP como parte del código — el primer deploy real (que sí crea el servicio) es una operación manual posterior, documentada en el runbook #144.
- **No** se toca el API Flask ni las reglas de Firestore (ADR-0006/0012 preservados).

## Capabilities

### New Capabilities
- `apps-admin`: existencia y forma del scaffold de `apps/admin` — stack, convenciones, layout base, route group de auth (vacío) y su despliegue en `admin.chirimoyo.org` vía Firebase Hosting + Cloud Run.

### Modified Capabilities
<!-- ninguna: ci-frontend.yml no tiene spec propia (es tooling de CI, no comportamiento de producto) -->

## Impact

- **Sub-dominios afectados:** admin (nuevo), foundation (CI).
- **Código:** `apps/admin/**` (nuevo), `.github/workflows/ci-frontend.yml` (matriz +`admin`).
- **Infra:** subdominio `admin.chirimoyo.org` (DNS manual en Porkbun), rewrite de Firebase Hosting hacia Cloud Run `us-central1` apuntando al site ya existente `admin-chirimoyo`.
- **Docs:** notas sobre la restricción de la cookie `__session` y el patrón de gate de auth en layout (no middleware) capturadas en `design.md` para que #139 las herede sin tener que re-descubrirlas.
- **Sin** cambios en API, reglas Firestore, ni convenciones documentadas → **no requiere ADR nuevo** (implementa el ya aceptado ADR-0030).
