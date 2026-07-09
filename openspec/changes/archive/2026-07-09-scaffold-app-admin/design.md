## Context

`apps/sitio` y `apps/catalogo` ya establecen el patrón de app Next 15 + Tailwind v4 + shadcn en este monorepo (ADR-0001, sin tooling de workspace). `apps/admin` (issue #138, ADR-0030) es la tercera app: **Firebase-native**, corre en Cloud Run como `sitio` (no export estático como `catalogo`), y sirve `admin.chirimoyo.org` — el site de Firebase Hosting `admin-chirimoyo` **ya existe** (creado fuera del repo). Este cambio entrega el esqueleto deployable; login (#139) y CRUD (#140/#141) son issues posteriores.

El proyecto hermano `sociedadsalvaje` (mismo stack heredado, ADR-0002) tiene su propio `apps/admin` ya en producción bajo el **mismo patrón de infra** (Firebase Hosting rewrite → Cloud Run, Next 15) — sus decisiones de infraestructura (no las de negocio/auth, que son propias) son un precedente directo.

## Goals / Non-Goals

**Goals:**
- Scaffold de `apps/admin` idéntico en convenciones a `sitio`/`catalogo`, deployable de punta a punta.
- Route group `(authed)` creado (vacío) para que #139 no reestructure rutas.
- Documentar, para que no se pierdan, las restricciones de infraestructura que #139 va a necesitar.

**Non-Goals:**
- Login, Web SDK de Firebase, CRUD, subida de imágenes, aprovisionar el site de Hosting o el servicio de Cloud Run, tocar Flask/reglas Firestore.

## Decisions

- **D1 — Mirror de configuración, no reinvención.** `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json` se copian de `apps/sitio` sin cambios de fondo (mismo `@/*` path alias, mismo estilo shadcn `new-york`). Mantiene el proyecto homogéneo entre las tres apps.

- **D2 — `Dockerfile` en `node:24-alpine`, corrigiendo un drift ya encontrado.** `apps/sitio/Dockerfile` usa `node:22-alpine`, pero el toolchain fijo del proyecto ([ADR-0022](../../../docs/decisions/0022-toolchain-node-fijo.md), `.nvmrc` → `24.12.0`) existe **específicamente** porque Node 22 (npm 10.9.8) y Node 24 (npm 11) resuelven distinto las dependencias wasm opcionales (`@emnapi/*`), rompiendo `npm ci` con lockfiles cruzados. `admin` usa `node:24-alpine` desde el día uno — no se hereda el drift. (El Dockerfile de `sitio` queda fuera de alcance de este cambio; se puede corregir aparte.)

- **D3 — Firebase Hosting: wiring a un site existente, no aprovisionamiento.** `admin-chirimoyo` ya existe como site de Hosting. `.firebaserc` declara un `target` (mismo patrón que `catalogo` → `fauna-chirimoyo`) mapeado a ese site; `firebase.json` usa ese target con `rewrites` hacia Cloud Run `admin` en **`us-central1`** (ADR-0015: Firebase Hosting rewrites a Cloud Run solo soporta una lista acotada de regiones, sin incluir `northamerica-south1`). El servicio Cloud Run en sí **no existe todavía** — lo crea el primer `deploy_run` (operación manual, runbook #144), igual que ocurrió con `sitio`.

- **D4 — Route group `(authed)` como stub, no como feature.** Se crea `app/(authed)/layout.tsx` que simplemente renderiza `children` (sin gate, sin `getSession`). Esto fija la **forma de las rutas** desde ahora: cuando #139 añada el chequeo de sesión, no mueve ningún archivo ni cambia URLs — solo llena el layout. Alternativa descartada: no crear el route group y dejar que #139 decida la estructura → reabre una decisión que ya está tomada por el precedente del hermano.

- **D5 — `.env.example` con `NEXT_PUBLIC_FIREBASE_*`, sin el SDK.** Los nombres de variables del Web SDK de Firebase (`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, etc. — todas **públicas por diseño**, no son secretos) se documentan ahora porque son parte de la forma del "esqueleto de config" de la app, pero **no** se instala `firebase` ni se escribe el cliente: eso es específicamente lo que construye #139.

- **D6 — Deploy scripts completos desde el scaffold.** `package.json` incluye `docker:build`, `docker:push`, `deploy_run` (`gcloud run deploy admin --region=us-central1 ...`), `firebase:deploy` (`--project=chirimoyo`), `deploy_prod` — mismo patrón exacto que `sitio`, sustituyendo el nombre del servicio. Un "scaffold" que no se puede desplegar no cumple su propósito; la *ejecución* real del primer deploy y su documentación narrada quedan en el runbook #144.

- **D7 — CI: agregar `admin` a la matriz ahora, no esperar a #144.** `.github/workflows/ci-frontend.yml` ya detecta por `package.json` si una app existe y hace skip si no — agregar `admin` al array `matrix.app` es seguro incluso antes de que el scaffold exista, y crítico para que **#139–#143 tengan lint/typecheck automático desde su primer PR** en vez de construirse cuatro issues sin red de seguridad de CI.

- **D8 — Restricciones de infraestructura documentadas ahora, implementadas en #139.** Del precedente `sociedadsalvaje/apps/admin` (mismo patrón Firebase Hosting → Cloud Run):
  - La **cookie de sesión** que use Firebase Auth (vía `createSessionCookie` del Admin SDK, patrón típico de SSR con Firebase Auth) **debe llamarse exactamente `__session`**. Firebase Hosting descarta cualquier otro nombre de cookie antes de proxiar el request a Cloud Run ([doc oficial](https://firebase.google.com/docs/hosting/manage-cache#using_cookies)) — con otro nombre, la sesión simplemente no persistiría, un bug silencioso y caro de diagnosticar sin este precedente.
  - El **gate de auth debe vivir en el layout del route group `(authed)`** (Server Component, `export const dynamic = "force-dynamic"`), **no en middleware**: Next 15 corre middleware en Edge Runtime, y detrás de un rewrite de Firebase Hosting a Cloud Run el proyecto hermano encontró problemas de cacheo de redirects. Esta nota vive aquí para que #139 no tenga que re-descubrirlo.

## Risks / Trade-offs

- **Servicio Cloud Run inexistente hasta el primer deploy** → el rewrite de `firebase.json` apuntará a un servicio que no existe hasta que se corra `deploy_run` una vez; documentado como paso manual (runbook #144), mismo camino que siguió `sitio`.
- **DNS manual en Porkbun** → fuera del repo, sin verificación automatizable desde aquí; se confirma visitando `admin.chirimoyo.org` tras el primer deploy.
- **Deuda de scaffold**: `firebase-admin`, `firebase` (Web SDK), y el layout de `(authed)` real llegan en issues distintos — riesgo bajo, ya que D4/D5 fijan la forma exacta que esos issues deben respetar.
