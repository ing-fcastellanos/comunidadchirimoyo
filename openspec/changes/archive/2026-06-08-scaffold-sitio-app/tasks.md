<!-- Referencia de convenciones: apps/catalogo (este repo) y
     C:\Users\Frank\source_code\sociedadsalvaje\apps\lectores (standalone + Cloud Run). -->

## 1. Andamiaje base

- [x] 1.1 Crear `apps/sitio` con Next 15 (App Router) + TypeScript + Tailwind v4 + `@tailwindcss/postcss`
- [x] 1.2 `next.config.ts`: `output: "standalone"` (Cloud Run)
- [x] 1.3 `tsconfig.json` (alias `@/*`), `postcss.config.mjs`, `eslint.config.mjs`, `components.json`
- [x] 1.4 `package.json`: scripts dev/build/start/lint/typecheck + deps (react 19, lucide-react, clsx, tailwind-merge)
- [x] 1.5 `.gitignore` de la app

## 2. Sistema de diseño

- [x] 2.1 `node scripts/sync-design-tokens.mjs` → `apps/sitio/app/tokens.css`
- [x] 2.2 `app/globals.css`: `@import "tailwindcss";` + `@import "./tokens.css";`
- [x] 2.3 `lib/fonts.ts` (next/font), `lib/utils.ts` (`cn`)
- [x] 2.4 Copiar primitivas a `components/ui/` (Badge, Section, SectionTitle, Icon)

## 3. Ruteo y secciones

- [x] 3.1 `middleware.ts`: ruteo por `Host` (comunidad.* → /comunidad, voluntarios.* → /voluntarios, resto → landing); matcher excluye `/_next`, estáticos y `/api`
- [x] 3.2 `app/page.tsx` (landing placeholder con el diseño)
- [x] 3.3 `app/comunidad/page.tsx` (placeholder)
- [x] 3.4 `app/voluntarios/page.tsx` (placeholder)
- [x] 3.5 Header/Footer propios de sitio en `components/layout/` + `app/layout.tsx` (fuentes + metadata/OG)

## 4. Contenido

- [x] 4.1 `lib/content.ts`: loader stub tipado que resuelve `content/` desde la raíz (default + `CONTENT_DIR`)

## 5. Empaquetado y deploy

- [x] 5.1 `Dockerfile` (Next standalone, node alpine, :8080) + `.dockerignore`
- [x] 5.2 `Makefile`/scripts: `deploy_prod` (build → push a AR `containers` imagen `sitio` → `gcloud run deploy sitio` en northamerica-south1, allow-unauthenticated, min-instances=0)
- [x] 5.3 `firebase.json`: site `chirimoyo` con rewrite `**` → Cloud Run `sitio` (region northamerica-south1) + `.firebaserc` (proyecto chirimoyo)
- [x] 5.4 `README.md` (comandos, ruteo por host, hosting Cloud Run + rewrite)

## 6. Verificación local

- [x] 6.1 `npm install`
- [x] 6.2 `npm run dev` → `/`, `/comunidad`, `/voluntarios` renderizan su placeholder con el diseño
- [x] 6.3 `npm run build` (standalone) + `npm run typecheck`/`lint` pasan

## 7. Despliegue y re-apuntado

- [x] 7.1 Build + deploy a Cloud Run `sitio`; verificar la URL `run.app` viva
- [x] 7.2 `firebase deploy --only hosting` (rewrite al site `chirimoyo`); verificar que `https://chirimoyo.org` sirve la app (no la holding)
- [x] 7.3 Eliminar `infra/holding/`
- [x] 7.4 Runbook para conectar `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` (consola Firebase + A+TXT en Porkbun) — paso del usuario

## 8. Decisión documentada

- [x] 8.1 Nota en el README/architecture confirmando el mecanismo de ADR-0008 (middleware por host) — sin cambiar la decisión
