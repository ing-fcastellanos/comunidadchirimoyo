## Context

El proyecto ya tiene el sistema de diseño (`docs/design-system/`, change `establish-design-system` archivado) y la infra GCP (proyecto `chirimoyo`, Firebase Hosting `chirimoyo.web.app`). Falta el andamiaje de la app del catálogo. La referencia de convenciones es `apps/lectores` de Sociedad Salvaje (Next App Router, Tailwind v4, `next/font` en `lib/fonts.ts`, alias `@/*`, `components.json` de shadcn, deploy con `firebase.json`+`.firebaserc`).

Diferencia central con la referencia: `lectores` es una app dinámica (auth, pagos, SSR) desplegada en Cloud Run; el **catálogo es 100% estático** (ADR-0005). Eso permite un modelo de hosting más simple y barato.

## Goals / Non-Goals

**Goals:**
- Un andamiaje Next 15 que **renderice con el sistema de diseño** y compile a estático.
- Modelo de hosting/deploy correcto para contenido 100% estático.
- Acceso a `content/` (raíz del repo) en build, resolviendo el problema de fronteras del monorepo.
- Dejar listas las extensiones (listado/buscador/detalle/PDF) sin implementarlas.

**Non-Goals:**
- Páginas reales del catálogo, datos/imágenes reales, conexión de dominio, deploy a prod.
- Cloud Run, Docker, `packages/`/workspaces.

## Decisions

### D1 · Hosting: export estático en Firebase Hosting (sin Cloud Run)

`next.config.ts` con `output: "export"`. `next build` emite `out/` (HTML/CSS/JS puro) y Firebase Hosting lo sirve **directo** (`"public": "out"`), sin rewrite a Cloud Run y **sin Dockerfile**.

- **Por qué**: el catálogo no usa SSR, middleware, route handlers ni API (ADR-0005). Un contenedor Node 24/7 sería costo e infra inútil. El export es más barato, es CDN puro y el build corre en la raíz (resuelve D3).
- **Alternativa descartada — Cloud Run standalone (patrón `lectores`)**: consistente con ADR-0003 y con next/image en servidor, pero desproporcionado para contenido estático y reintroduce el problema de contexto Docker para `content/`.
- **Divergencia**: rompe la generalidad de ADR-0003 (Cloud Run + rewrites) → se registra en **ADR-0014**. El proyecto queda con hosting híbrido (`catalogo` estático; `sitio`/`api` en Cloud Run).
- **Compatibilidad**: el detalle por especie usa `generateStaticParams` (rutas conocidas en build); el buscador es cliente sobre un JSON estático; el PDF se genera en build → todo es compatible con `export`.

### D2 · Imágenes: en repo + optimización en build

En `export` no hay optimizador de `next/image` en servidor. Estrategia: las fotos viven con el contenido (repo) y un paso de build con **`sharp`** genera variantes responsive + placeholder; se sirven como estáticos (vía `<img>`/loader estático o `next/image` con `unoptimized` apoyado en las variantes pre-generadas). El detalle fino (tamaños, formatos, dónde viven exactamente) se cierra en **#10** (migrar imágenes). El scaffold solo fija `images` en `next.config` y deja el gancho del pipeline.

### D3 · Acceso a `content/` desde la raíz

El build corre en `apps/catalogo` pero el contenido vive en `<repo>/content/`. Como el build es local/CI (no Docker), `lib/content.ts` resuelve la raíz del repo (p. ej. `path.resolve(process.cwd(), "../../content")`, con override por env `CONTENT_DIR`) y lee `content/fauna/` en build. En el scaffold es un **stub tipado** (firma + tipos del esquema de #9), sin parsear datos reales aún.

### D4 · Consumo del sistema de diseño

- `app/globals.css`: `@import "tailwindcss";` seguido de `@import "./tokens.css";`. `app/tokens.css` se genera con `node scripts/sync-design-tokens.mjs` (ADR-0013).
- `lib/fonts.ts`: copia de `docs/design-system/fonts.ts` (next/font Cormorant + Source Sans 3); variables aplicadas en `<html className>` en `app/layout.tsx`.
- `components/ui/`: copia de las primitivas (`Badge`, `Section`, `SectionTitle`, `Icon`) + `lib/utils.ts` con `cn()` (clsx + tailwind-merge). `components.json` de shadcn para futuras adiciones.
- `lucide-react` como dependencia.

### D5 · Versión y ambientes

Next **15** (alineado a ADR-0002 y CLAUDE.md) + React 19. **Solo prod** (ADR-0003): un target `prod` en `firebase.json`/`.firebaserc` apuntando al site de `aves.chirimoyo.org`; `deploy_prod` = `next build && firebase deploy --only hosting:prod`. Sin QA por ahora.

### D6 · Layout y placeholder

`Header`/`Footer` del handoff portados a `components/layout/` (Server Components; adaptados de JSX a TSX, iconos vía `lucide-react`). `app/layout.tsx` con fuentes + `metadata`/OpenGraph base (`metadataBase` = `https://aves.chirimoyo.org`). `app/page.tsx` = home placeholder que usa tokens/primitivas para **probar** la integración visual contra la guía de estilo del handoff.

## Risks / Trade-offs

- **Sin optimizador de imágenes en servidor** → Mitigación: pipeline `sharp` en build (D2); se cierra en #10.
- **Divergencia de ADR-0003** → Mitigación: ADR-0014 explícito; el patrón Cloud Run sigue vigente para `sitio`/`api`.
- **Resolución de `content/` por ruta relativa** podría romperse si cambia la profundidad del monorepo → Mitigación: override por `CONTENT_DIR` y una sola función central (`lib/content.ts`).
- **Tailwind v4 + `@import` de tokens** debe resolver utilidades (`bg-forest`, etc.) → Mitigación: validar en la home placeholder.

## Migration Plan

1. `create-next-app` (o equivalente manual) en `apps/catalogo` con TS + Tailwind v4 + App Router.
2. Configurar `next.config.ts` (export, images), `tsconfig` (alias `@/*`), `postcss`, `eslint`, `components.json`.
3. `node scripts/sync-design-tokens.mjs` → `app/tokens.css`; wiring en `globals.css`; `lib/fonts.ts`; primitivas en `components/ui/` + `cn()`.
4. `Header`/`Footer` en `components/layout/`; `layout.tsx`; `page.tsx` placeholder.
5. `lib/content.ts` stub; `firebase.json` + `.firebaserc` (target prod); scripts en `package.json`.
6. ADR-0014 + actualizar `docs/adr/_index.md`.
7. Validar: `npm run dev` (placeholder estilizado), `npm run build` (genera `out/`), `npm run typecheck`/`lint`.

Rollback: borrar `apps/catalogo/` y el ADR; no hay consumidores aún.

## Open Questions

- Formato exacto del contenido (Markdown+frontmatter vs JSON) → se cierra en #9; el loader stub se adapta luego.
- Nombre del site de Firebase para `aves.chirimoyo.org` → se fija al conectar DNS (#3); el `.firebaserc` deja un target con nombre provisional documentado.
