## Context

El catálogo es export estático (`output: export`, ADR-0014). El OG se define por `metadata`/`generateMetadata` con `openGraph.images` (URLs a archivos en `public/`); no hay `opengraph-image` ni `ImageResponse` (eso es del sitio). Hoy: `app/layout.tsx` fija `openGraph.images = ["/og-default.jpg"]` (imagen de aves), `app/[grupo]/page.tsx` tiene `generateMetadata` que solo devuelve `{ title }` (hereda el default), y `app/[grupo]/[slug]` ya pone la foto de la ficha. `sharp` ya es dependencia del catálogo (recorte de fotos del PDF).

## Goals / Non-Goals

**Goals:**
- Cada sección comparte una imagen OG acorde: fauna general, aves o herpetofauna.
- Imágenes a 1200×630, ligeras, servidas estáticas.

**Non-Goals:**
- OG dinámico; rediseño de imágenes; tocar el sitio o el detalle de ficha.

## Decisions

**D1 — Resize con `sharp` a 1200×630.** Las fuentes vienen en ~2000×1050 (misma proporción 1.9:1 que 1200×630), así que un `resize(1200, 630, { fit: "cover" })` conserva la composición sin recorte perceptible. Export JPEG calidad ~82 (peso bajo, suficiente para OG). Un pequeño script o comando puntual de `sharp` (no se añade un script npm permanente; es una conversión de assets una sola vez).

**D2 — Tres imágenes en `public/`.**
- `og-fauna.jpg` (general) ← imagen 1 (humedal/serpiente).
- `og-herpetofauna.jpg` ← imagen 2 (rana).
- `og-aves.jpg` ← renombrado de `og-default.jpg` (la actual de aves).
Se elimina `og-default.jpg` (nombre genérico engañoso); se actualizan sus referencias.

**D3 — Default raíz = fauna general.** `app/layout.tsx` → `openGraph.images = [{ url: "/og-fauna.jpg", width: 1200, height: 630, alt: "Guía de la fauna del humedal de Chirimoyo" }]`. Hereda a `/`, `/busqueda`, `/colaboradores` y cualquier página sin OG propio.

**D4 — Override por grupo (`app/[grupo]/page.tsx`).** Un mapa `OG_POR_GRUPO: Record<Grupo, { url; alt }>` (en el archivo o en `lib/`): `aves → og-aves.jpg`, `anfibios → og-herpetofauna.jpg`, `reptiles → og-herpetofauna.jpg`. `generateMetadata` añade `openGraph.images` (y `twitter.images`) con esa imagen, además del `title` actual. Así `/aves` recupera la de aves y `/anfibios`,`/reptiles` la de herpetofauna.

**D5 — `/aves/buscador` = aves.** `app/[grupo]/buscador/page.tsx` (solo aves hoy) añade `openGraph.images` = `og-aves.jpg` en su metadata. (El buscador **general** `/busqueda` se queda con el default fauna general.)

**D6 — `twitter.images` en paralelo.** Donde se fije `openGraph.images`, fijar también `twitter.images` con la misma URL (consistencia de tarjeta).

**D7 — Detalle sin cambios.** `app/[grupo]/[slug]` mantiene la foto de la ficha como OG (ya correcto).

## Risks / Trade-offs

- **`og-default.jpg` renombrado** → cualquier referencia externa al nombre viejo se rompe; el catálogo aún no se difunde ampliamente y se actualizan todas las referencias internas. Aceptado.
- **Resize cover** → si alguna fuente no fuese exactamente 1.9:1, `cover` recorta mínimamente los bordes; las fuentes ya están en esa proporción. Mitigación: verificar dimensiones reales antes de exportar.
- **Peso/calidad** → JPEG q82 a 1200×630 ronda ~150–250 KB, adecuado para OG. Ajustable.
- **Smoke test** → la nueva ruta de assets no afecta los chequeos; `og-default.jpg` deja de existir, confirmar que nada en `out/` lo referencia tras el cambio.

## Migration Plan

Conversión de assets (una vez) + edición de metadata. Build estático normal; las 3 imágenes quedan en `out/`. Rollback = revertir el commit (vuelve `og-default.jpg` como default).

## Open Questions

- **Ruta de los 2 archivos fuente** — la indica el operador al implementar; sin ella no se pueden generar `og-fauna.jpg`/`og-herpetofauna.jpg`.
