# Tasks — scaffold-app-admin (issue #138)

## 1. Scaffold base

- [x] 1.1 `apps/admin/package.json` — Next 15, React 19, Tailwind v4, `lucide-react`; scripts `dev`/`build`/`start`/`lint`/`typecheck`/`sync:tokens`, engines Node 24 (espejo de `apps/sitio/package.json`, sin las deps de Firestore/markdown que no aplican).
- [x] 1.2 `apps/admin/tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json` — copiados de `apps/sitio` (alias `@/*`, shadcn `new-york`).
- [x] 1.3 `apps/admin/next.config.ts` — `output: "standalone"`.
- [x] 1.4 Correr `node scripts/sync-design-tokens.mjs` una vez creada `apps/admin/app/` para generar `tokens.css`; confirmar que el script no requirió cambios.

## 2. Layout base + route group stub

- [x] 2.1 `apps/admin/app/globals.css` — `@import "tailwindcss"` + `@import "./tokens.css"` (espejo de `sitio`).
- [x] 2.2 `apps/admin/app/layout.tsx` — layout raíz con branding mínimo ("Comunidad Chirimoyo · Admin"), fuentes/tokens.
- [x] 2.3 `apps/admin/app/page.tsx` — placeholder de home.
- [x] 2.4 `apps/admin/app/(authed)/layout.tsx` — **stub**: renderiza `children` sin ningún chequeo de sesión ni redirect. Comentario explícito de que el gate llega en #139.

## 3. Config de Firebase (solo variables)

- [x] 3.1 `apps/admin/.env.example` — documentar `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (y demás campos estándar de inicialización del Web SDK). **No** agregar el paquete `firebase` a dependencies.

## 4. Deploy: Docker + Firebase Hosting + Cloud Run

- [x] 4.1 `apps/admin/Dockerfile` — `node:24-alpine` en las tres etapas (deps/builder/runner), `output: standalone` (espejo de `sitio/Dockerfile` corrigiendo la versión de Node).
- [x] 4.2 `apps/admin/.firebaserc` — `target` de hosting apuntando al site existente `admin-chirimoyo` (mismo patrón que `catalogo` → `fauna-chirimoyo`).
- [x] 4.3 `apps/admin/firebase.json` — `rewrites` hacia Cloud Run `admin` en `us-central1`, usando el target de 4.2.
- [x] 4.4 `apps/admin/package.json` — scripts `docker:build`, `docker:push`, `deploy_run` (`gcloud run deploy admin --region=us-central1 ...`), `firebase:deploy`, `deploy_prod` (espejo de `sitio`, sustituyendo el nombre del servicio).

## 5. CI

- [x] 5.1 `.github/workflows/ci-frontend.yml` — agregar `admin` a `matrix.app` (`[sitio, catalogo, admin]`).

## 6. Verificación

- [x] 6.1 `npm install && npm run build && npm run typecheck && npm run lint` en `apps/admin`, en verde.
- [x] 6.2 Preview local (`npm run dev`) — el placeholder de home y `(authed)/` (si se navega directo) renderizan sin error, sin redirect ni gate.
- [x] 6.3 Confirmar que `firebase` (Web SDK) NO aparece en `apps/admin/package.json` dependencies.
- [x] 6.4 Confirmar que el `Dockerfile` usa `node:24-alpine` en sus tres etapas.
