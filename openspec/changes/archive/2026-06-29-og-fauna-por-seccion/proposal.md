## Why

Con la reestructuración del catálogo de aves → **fauna** (ADR-0024), la imagen OpenGraph del root quedó siendo la de **aves** (`/og-default.jpg`). Como las páginas sin OG propio **heredan ese default**, al compartir `/` (hub), `/busqueda`, `/anfibios` o `/reptiles` aparece una imagen de aves que ya no representa la sección. El usuario generó **2 imágenes nuevas** (fauna general y herpetofauna) para corregirlo. Hay que redimensionarlas (vienen en resolución alta) y cablearlas por sección.

## What Changes

- **Redimensionar** las 2 imágenes provistas a **1200×630** (proporción ya equivalente) con `sharp`, y colocarlas en `apps/catalogo/public/`:
  - `og-fauna.jpg` — fauna general (imagen del humedal/serpiente).
  - `og-herpetofauna.jpg` — anfibios y reptiles (imagen de la rana).
- **Renombrar** `public/og-default.jpg` → `public/og-aves.jpg` (es la imagen de aves; el nombre genérico confundía).
- **Default raíz → fauna general:** en `app/layout.tsx`, `openGraph.images` apunta a `og-fauna.jpg`. Así `/` (hub), `/busqueda` y `/colaboradores` (y cualquier página sin OG propio) usan la imagen de fauna general.
- **Override por grupo** en `app/[grupo]/page.tsx` (`generateMetadata`): `openGraph.images` según el grupo —
  - `aves` → `og-aves.jpg`,
  - `anfibios` y `reptiles` → `og-herpetofauna.jpg`.
- **`/aves/buscador`** (`app/[grupo]/buscador/page.tsx`): OG de **aves** (`og-aves.jpg`), por ser específico de aves.
- El **detalle** `/<grupo>/<slug>` no cambia (ya usa la foto de la ficha).

## No-goals

- **No** se genera OG dinámico (estos son imágenes estáticas pre-hechas; el catálogo es export estático).
- **No** se rediseñan las imágenes ni se editan composiciones; solo se redimensionan/exportan.
- **No** se toca el OG del sitio (`apps/sitio`) ni el del detalle de ficha (ya correcto).
- **No** se cambian textos/metadata más allá de `openGraph.images` (y su `alt`).

## Capabilities

### New Capabilities
- `catalogo-og`: imagen OpenGraph del catálogo por sección — default de fauna general, override de aves y de herpetofauna en las páginas de grupo, conservando la foto de ficha en el detalle.

### Modified Capabilities
<!-- ninguna: no hay spec previa de OG del catálogo; las páginas de grupo/landing no cambian su comportamiento funcional, solo su imagen social -->

## Impact

- **Sub-dominio afectado:** aves (catálogo, `fauna.chirimoyo.org`).
- **Assets (`apps/catalogo/public/`):** + `og-fauna.jpg`, + `og-herpetofauna.jpg`, `og-default.jpg` → `og-aves.jpg` (renombrado).
- **Código (`apps/catalogo`):** `app/layout.tsx` (default), `app/[grupo]/page.tsx` (override por grupo), `app/[grupo]/buscador/page.tsx` (aves). Posible mapa `grupo → og` en `lib/`.
- **Build/deploy:** export estático normal; las imágenes se sirven desde `out/` (no bucket). `npm run smoke` debe seguir verde.
- **Sin** cambios en API, esquema, ni convenciones documentadas → **no requiere ADR**.
- **Fuente de las imágenes:** el operador provee los 2 archivos originales (ruta indicada al implementar).
