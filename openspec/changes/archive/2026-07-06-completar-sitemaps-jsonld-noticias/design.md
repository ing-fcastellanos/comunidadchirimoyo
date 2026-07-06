## Context

`apps/sitio/app/sitemap.ts` es síncrono y devuelve una lista fija de 7 rutas (`RUTAS`), sin las noticias. Las notas viven en `content/` y se leen con `getAllNoticias()` (`lib/noticias.ts`); la paginación se calcula con `totalPaginas(n)` sobre `NOTICIAS_POR_PAGINA = 9` (`lib/noticias-paginacion.ts`), y la página 1 vive en `/comunidad/noticias`, las 2..N en `/comunidad/noticias/pagina/<n>`. El catálogo (`apps/catalogo/app/sitemap.ts`) ya es `async` y deriva rutas del contenido, pero su lista `rutas` no incluye `/colaboradores`.

El detalle de nota (`app/comunidad/noticias/[slug]/page.tsx`) es un Server Component estático que ya emite `generateMetadata` (OpenGraph `article`, canónico, Twitter) pero **no** datos estructurados. El landing (`app/page.tsx`) ya inyecta JSON-LD `Organization` con `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />` — patrón a replicar. Las URLs absolutas de imagen se resuelven con `mediaUrl()` (mismo helper que usa el landing para el OG).

## Goals / Non-Goals

**Goals:**
- Que las noticias (listado, detalle, paginación) sean descubribles por el sitemap del sitio.
- Que `/colaboradores` aparezca en el sitemap del catálogo.
- Que cada detalle de nota emita `NewsArticle` JSON-LD válido, sin costo en cliente.

**Non-Goals:**
- Accesibilidad (WCAG AA) — trabajo B aparte.
- Nuevas imágenes OG, cambios de canónico/metadata, campo de "actualización" en el esquema, cambios de UI de la fecha, backend, contenido nuevo, ADR.

## Decisions

**D1 — `sitemap.ts` del sitio pasa a `async` y deriva las noticias del contenido.** Se reusa la misma fuente de verdad que las páginas (`getAllNoticias`, `totalPaginas`, `NOTICIAS_POR_PAGINA`) para que el sitemap no se desincronice del ruteo real. Rutas de noticias añadidas: `/comunidad/noticias` (listado, pág. 1), `/comunidad/noticias/<slug>` por cada nota, y `/comunidad/noticias/pagina/<n>` para `n = 2..totalPaginas(notas.length)`. Las 7 rutas estáticas actuales se conservan tal cual. Espeja el enfoque ya usado en el sitemap del catálogo.

**D2 — `lastModified` solo en las URLs de nota, tomado de `fecha`.** Cada nota tiene `fecha` (publicación); es el único timestamp disponible, así que `lastModified = new Date(nota.fecha)`. Las rutas estáticas y las de listado/paginación **no** llevan `lastModified` (no tienen una fecha natural única y meterla sería arbitrario). No se introduce un campo de "actualización" nuevo.

**D3 — `/colaboradores` se agrega a la lista `rutas` del sitemap del catálogo.** Cambio mínimo: una entrada más en el array existente. La página es pública y tiene metadata, así que corresponde indexarla.

**D4 — JSON-LD `NewsArticle` inyectado en el Server Component del detalle, espejo del landing.** Se construye el objeto en el servidor y se emite con `<script type="application/ld+json">`. Tipo `NewsArticle` (contenido noticioso comunitario, más específico que `Article`). Campos:
- `headline` = `nota.titulo`; `description` = `nota.resumen`.
- `datePublished` = `nota.fecha` (ISO) cuando existe.
- `author` = `{ "@type": "Person", name: nota.autor }` cuando existe; si no, se omite.
- `image` = URL absoluta de `nota.portada` vía `mediaUrl()` cuando existe.
- `publisher` = `{ "@type": "Organization", name: "Comunidad Chirimoyo", logo: ... }` (coherente con el `Organization` del landing).
- `mainEntityOfPage` = URL canónica absoluta `https://chirimoyo.org/comunidad/noticias/<slug>`.
Los campos opcionales se incluyen **solo si el dato existe** (no emitir claves con `undefined`/vacías). Sin costo en cliente (se serializa en build/SSR).

**D5 — Alcance: dos apps, tres archivos, cero contenido.** `sitio/sitemap.ts`, `catalogo/sitemap.ts`, `sitio/.../[slug]/page.tsx`. Nada más.

## Risks / Trade-offs

- **`lastModified` = fecha de publicación** (no de última edición real): si una nota se corrige, el sitemap no lo refleja. Aceptable — no hay campo de edición y el valor SEO de `lastModified` aquí es marginal. Se documenta la limitación en la decisión.
- **`NewsArticle` con campos faltantes** (nota sin autor o sin portada): se omiten esas claves; el JSON-LD sigue siendo válido (headline + datePublished bastan). Mitigado por construir el objeto condicionalmente.
- **Desincronización sitemap ↔ ruteo**: evitado al derivar de las mismas funciones (`getAllNoticias`, `totalPaginas`) que usan las páginas.
- **URLs absolutas de imagen**: si `mediaUrl()` no antepusiera el origen, el `image` del JSON-LD quedaría relativo. Se verifica que resuelva absoluto (igual que el OG del landing).

## Migration Plan

Sin migración de datos. Al mergear y hacer build, `sitemap.xml` incluye las rutas nuevas y el detalle de nota emite el JSON-LD. Rollback = revertir el commit (sitemap vuelve a las rutas previas; el `<script>` desaparece). No afecta rutas, contenido ni contrato de ningún endpoint.

## Open Questions

- **`lastModified` para el listado/paginación** — se deja sin `lastModified` por ahora; si más adelante se quiere, podría tomar la fecha de la nota más reciente de cada página. Fuera de alcance.
