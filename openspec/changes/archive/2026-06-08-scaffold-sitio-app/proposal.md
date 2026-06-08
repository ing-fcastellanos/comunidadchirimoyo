## Why

`apps/sitio` sirve los tres subdominios de contenido (chirimoyo.org, comunidad, voluntarios) y es el último componente de Fase 0 sin levantar. Antes de construir landing/historia/noticias/jornadas (Fases 3–4) necesitamos su andamiaje y, sobre todo, **resolver el ruteo multi-subdominio** (ADR-0008) — que no tiene precedente en Sociedad Salvaje (allá cada subdominio es una app aparte). Es el issue #5.

**Sub-dominios afectados:** `sitio`, `comunidad`, `voluntarios` (la app), `foundation` (re-apuntado del apex).

## What Changes

- Se crea **`apps/sitio`**: Next.js 15 (App Router) + TypeScript + Tailwind v4, `output: "standalone"` para **Cloud Run** (a diferencia del catálogo, que es export estático — ADR-0014).
- **Ruteo por host con middleware** (ADR-0008): `middleware.ts` lee el `Host` y enruta `chirimoyo.org`→landing (`/`), `comunidad.*`→`/comunidad`, `voluntarios.*`→`/voluntarios`. Un solo build/deploy sirve los tres subdominios.
- **Hosting**: el site de Firebase **`chirimoyo`** (hoy sirve la holding estática) se **repurposa** a un **rewrite → Cloud Run `sitio`**. Así `chirimoyo.org` y `www` (ya conectados) sirven la app **sin tocar DNS**. `comunidad.*` y `voluntarios.*` se conectan como dominios custom al mismo site (A+TXT en Porkbun — paso del usuario, runbook).
- **Sistema de diseño**: consume `tokens.css` (sync), `next/font`, primitivas (`components/ui/`), `cn`, `lucide-react`. **Header/Footer propios de sitio** (los del handoff son de la guía de aves) en `components/layout/`.
- **Secciones placeholder**: `app/page.tsx` (landing), `app/comunidad/`, `app/voluntarios/` renderizando con el diseño — prueba visible del ruteo y los tokens.
- **Despliegue + re-apuntado**: build → Cloud Run; publicar el rewrite al site `chirimoyo`; `infra/holding/` queda obsoleto y se **elimina**.

### No-goals

- **No** implementa contenido real: landing definitiva, historia/misión/noticias (Fase 3), jornadas/calendario/inscripción/donaciones (Fase 4).
- **No** implementa las formas de contacto ni de inscripción (serán cliente → API en Fase 3/4).
- **No** conecta `comunidad.*`/`voluntarios.*` por sí mismo — deja el runbook; la conexión DNS es paso del usuario (consola Firebase + Porkbun).
- **No** introduce auth, `packages/`/workspaces, ni cambia el contenido del API.

## Capabilities

### New Capabilities

- `sitio-app`: la aplicación de los sitios de contenido (chirimoyo.org + comunidad + voluntarios) — su andamiaje, el ruteo multi-subdominio por host, la integración del sistema de diseño y el modelo de hosting Cloud Run + Firebase rewrites.

### Modified Capabilities

<!-- Ninguna. -->

## Impact

- **Nuevos archivos**: árbol `apps/sitio/` (config Next/TS/Tailwind, `middleware.ts`, `app/`, `components/`, `lib/`, `Dockerfile`, `firebase.json`, `.firebaserc`, `README.md`).
- **Eliminado**: `infra/holding/` (reemplazado por el rewrite a Cloud Run).
- **Nuevas dependencias** (app): `next` 15, `react`/`react-dom` 19, `tailwindcss` v4 + `@tailwindcss/postcss`, `lucide-react`, `clsx`, `tailwind-merge`.
- **Infra**: un servicio Cloud Run nuevo (`sitio`/prod) en `northamerica-south1`; el site Firebase `chirimoyo` pasa de estático a rewrite.
- **CI**: `ci-frontend.yml` (activado en #8) correrá lint/typecheck/build sobre `apps/sitio`.
- **Sin impacto** en `apps/catalogo` ni en `services/api` (las formas lo consumirán en Fase 3/4; el CORS ya las contempla).
