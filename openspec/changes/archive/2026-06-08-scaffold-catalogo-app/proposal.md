## Why

`aves.chirimoyo.org` es el sitio más avanzado del proyecto (catálogo inicial, imágenes y diseños v0.dev ya existen) y la prioridad de lanzamiento. Antes de construir listado/buscador/detalle hace falta el **andamiaje de la app** Next 15: estructura, integración del sistema de diseño ya creado (`docs/design-system/`), y el modelo de hosting. Es el issue #6 de Fase 0.

**Sub-dominios afectados:** `aves` (la app), `foundation` (decisión de hosting → ADR).

## What Changes

- Se crea **`apps/catalogo`**: Next.js 15 (App Router) + TypeScript + Tailwind v4, espejo de las convenciones de `apps/lectores` de Sociedad Salvaje (alias `@/*`, `lib/`, `components/`, `output` de Next, deploy scripts).
- **Hosting por export estático**: `next.config` con `output: "export"`; Firebase Hosting sirve `out/` **directo, sin Cloud Run ni Docker**. Es el ajuste correcto para un catálogo 100% estático (ADR-0005) y **diverge de ADR-0003** → se documenta en un **ADR nuevo (0014)**.
- **Consumo del sistema de diseño**: `globals.css` hace `@import "tailwindcss"` + `@import "./tokens.css"` (generado por `scripts/sync-design-tokens.mjs`); `lib/fonts.ts` con `next/font` (Cormorant Garamond + Source Sans 3); primitivas (`Badge`, `Section`, `SectionTitle`, `Icon`) copiadas a `components/ui/`; `lucide-react` añadido.
- **Layout del catálogo**: `Header`/`Footer` portados del handoff a `components/layout/`, `app/layout.tsx` con fuentes + metadata/OpenGraph, y una **home placeholder que renderiza con el diseño** (prueba visible de la integración).
- **Acceso a contenido**: `lib/content.ts` como loader (stub tipado) que lee `content/fauna/` desde la raíz del repo en build.
- **Config de deploy**: `firebase.json` + `.firebaserc` con un target `prod` apuntando al site de `aves.chirimoyo.org`; script `deploy_prod` = `next build && firebase deploy`.

### No-goals

- **No** implementa listado (#11), buscador/filtros (#12), detalle por especie (#13) ni PDF (#14).
- **No** migra los datos ni las imágenes reales del catálogo (#10) — solo deja el loader y la estrategia de imágenes definidos.
- **No** conecta el dominio `aves.chirimoyo.org` (DNS, #3) ni despliega a producción (#15); solo deja la config lista.
- **No** introduce Cloud Run/Docker para el catálogo, ni `packages/`/workspaces.

## Capabilities

### New Capabilities

- `catalogo-app`: la aplicación del catálogo de fauna (`aves.chirimoyo.org`) — su andamiaje, integración del sistema de diseño, modelo de hosting por export estático y acceso a contenido en build.

### Modified Capabilities

<!-- Ninguna. -->

## Impact

- **Nuevos archivos**: árbol `apps/catalogo/` (config Next/TS/Tailwind, `app/`, `components/`, `lib/`, `firebase.json`, `.firebaserc`, `README.md`).
- **Nuevas dependencias** (en la app): `next` 15, `react`/`react-dom` 19, `tailwindcss` v4 + `@tailwindcss/postcss`, `lucide-react`, `clsx` + `tailwind-merge` (`cn()`), `sharp` (optimización de imágenes en build), `gray-matter` (si el contenido es Markdown+frontmatter — formato a confirmar en #9).
- **Documentación**: **ADR-0014** (catálogo como export estático en Firebase Hosting, sin Cloud Run) + actualización del índice de ADRs.
- **Consumidores/CI**: el CI de frontend (`ci-frontend.yml`, activado en #8) empezará a correr lint/typecheck/build sobre `apps/catalogo`.
- **Sin impacto** en `services/api` ni en `apps/sitio`.
