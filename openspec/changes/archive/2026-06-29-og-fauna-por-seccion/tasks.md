# Tasks — og-fauna-por-seccion

## 1. Imágenes (assets)

- [x] 1.1 Obtener del operador la **ruta de los 2 archivos fuente** (fauna general + herpetofauna)
- [x] 1.2 Verificar dimensiones/proporción de las fuentes (esperado ~1.9:1) antes de exportar
- [x] 1.3 Redimensionar con `sharp` a **1200×630** (`fit: "cover"`, JPEG ~q82) → `apps/catalogo/public/og-fauna.jpg` y `apps/catalogo/public/og-herpetofauna.jpg`
- [x] 1.4 Renombrar `apps/catalogo/public/og-default.jpg` → `og-aves.jpg`

## 2. Metadata por sección

- [x] 2.1 `app/layout.tsx` — `openGraph.images` (y `twitter.images` si aplica al root) → `/og-fauna.jpg` (1200×630, `alt` de fauna general)
- [x] 2.2 `lib/` o en el propio archivo: mapa `OG_POR_GRUPO: Record<Grupo, { url; alt }>` — aves → `/og-aves.jpg`; anfibios y reptiles → `/og-herpetofauna.jpg`
- [x] 2.3 `app/[grupo]/page.tsx` `generateMetadata` — añadir `openGraph.images` + `twitter.images` según `OG_POR_GRUPO[grupo]`, conservando el `title`
- [x] 2.4 `app/[grupo]/buscador/page.tsx` — `openGraph.images` + `twitter.images` = `/og-aves.jpg` (buscador de aves)
- [x] 2.5 Confirmar que `/busqueda` y `/colaboradores` heredan el default fauna general (o fijarlo explícito si no heredan)

## 3. Limpieza de referencias

- [x] 3.1 Buscar y actualizar cualquier referencia a `og-default.jpg` en el repo (código/docs) → `og-aves.jpg`

## 4. Verificación

- [x] 4.1 `npm run build` en `apps/catalogo` sin errores; las 3 imágenes (`og-fauna`, `og-herpetofauna`, `og-aves`) quedan en `out/` a 1200×630
- [x] 4.2 Inspeccionar el `<head>` de cada sección en `out/`: `/` y `/busqueda` → `og-fauna`; `/aves` y `/aves/buscador` → `og-aves`; `/anfibios` y `/reptiles` → `og-herpetofauna`; `/<grupo>/<slug>` → foto de ficha
- [x] 4.3 Confirmar que ningún artefacto de `out/` referencia `og-default.jpg`
- [x] 4.4 `npm run smoke` sigue en verde