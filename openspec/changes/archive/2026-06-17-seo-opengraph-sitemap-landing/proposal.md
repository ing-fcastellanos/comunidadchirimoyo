## Why

`chirimoyo.org` es la puerta de entrada y el principal canal de difusión del proyecto: sus URLs se comparten en redes y WhatsApp. Hoy faltan piezas de descubribilidad — no hay `sitemap.xml`, no hay `robots.txt`, no hay Twitter cards, el landing raíz no declara metadata propia y ninguna página declara su canónico explícito. Con la fusión a dominio único por paths (ADR-0023, ya implementada en #75/#79) el SEO se simplifica a una sola estrategia de dominio, y conviene cerrarla antes del deploy a producción (#53).

## What Changes

- **Sitemap global** (`app/sitemap.ts`): un único sitemap con URLs absolutas bajo `https://chirimoyo.org` para las rutas públicas (`/`, `/comunidad`, `/voluntarios`, `/aliados`, `/galeria`, `/contacto`, `/privacidad`).
- **Robots** (`app/robots.ts`): único, permite indexar lo público y referencia el sitemap.
- **Canónicos explícitos por página** vía `alternates.canonical` (rutas relativas resueltas contra `metadataBase = chirimoyo.org`). Protegen contra contenido duplicado de los hosts vanity `comunidad.*` / `voluntarios.*` mientras estos aún no tienen su redirect 301 (ADR-0023; el 301 es trabajo del deploy #53).
- **Twitter cards** en el layout raíz (el OpenGraph base ya existe; falta el bloque `twitter:` con `card: summary_large_image`).
- **Metadata propia del landing raíz** (`app/page.tsx`): hoy hereda el default del layout; tendrá título/descripción y canónico propios.
- **JSON-LD `Organization`** (opcional) en el landing para datos estructurados básicos.
- **Validación** de que el OpenGraph renderiza correctamente al compartir (WhatsApp/Facebook).

## Capabilities

### New Capabilities
- `sitio-seo`: descubribilidad y compartibilidad de `apps/sitio` — sitemap global, robots, canónicos explícitos por página, Twitter cards y datos estructurados, bajo el modelo de dominio único de ADR-0023.

### Modified Capabilities
<!-- Ninguna. La metadata base (metadataBase, OpenGraph, favicons, manifest) ya existe en el layout y no cambia su contrato; este change añade una capacidad nueva sin alterar requisitos de sitio-app ni landing-sitio. -->

## Impact

- **Subdominios afectados:** `sitio` (incluye las secciones `/comunidad` y `/voluntarios`, ya servidas por path). No afecta `aves`, `api`, ni `foundation`.
- **Código:** nuevos `apps/sitio/app/sitemap.ts` y `apps/sitio/app/robots.ts`; edición de `apps/sitio/app/layout.tsx` (Twitter cards), `apps/sitio/app/page.tsx` (metadata propia + JSON-LD) y adición de `alternates.canonical` en las páginas con metadata.
- **Dependencias / contratos:** ninguna librería nueva (todo es metadata nativa de Next 15 App Router). No toca `apps/catalogo` (su cross-link al vanity es ajeno a este change). Los assets ya existen en `public/` (favicons, manifest, `og-default.jpg`).
- **No rompe convenciones:** no requiere ADR nuevo; se apoya en ADR-0023 (dominio único) ya Accepted.

## No-goals

- **No** configura los redirects 301 de los hosts vanity (`comunidad.*`, `voluntarios.*`) → es trabajo del deploy #53 (config de Firebase Hosting), no de este change.
- **No** introduce analítica ni seguimiento → eso vive en #24 (Fase 5) y el change `analitica-privada-cloudflare`.
- **No** modifica `metadataBase`, OpenGraph base, favicons ni manifest existentes (ya están correctos).
- **No** toca `apps/catalogo`.
- **No** genera imágenes OG dinámicas por página; se reutiliza la portada del humedal (`og-default.jpg`).
