## Why

El SEO/OG del proyecto (#25) se fue horneando feature por feature y quedó casi completo, pero con dos huecos concretos que restan descubribilidad:

1. **El sitemap de `apps/sitio` no incluye las noticias.** `app/sitemap.ts` lista 7 rutas estáticas fijas, pero omite `/comunidad/noticias`, cada `/comunidad/noticias/<slug>` y la paginación `/comunidad/noticias/pagina/<n>`. Las notas —el contenido más fresco e indexable del sitio— no se descubren por sitemap.
2. **El sitemap del catálogo omite `/colaboradores`.** La página existe y tiene metadata, pero no aparece en `apps/catalogo/app/sitemap.ts`.

Además, el detalle de nota solo emite metadata OpenGraph; **no incluye datos estructurados** (JSON-LD). El landing ya usa `Organization`; extender el patrón a las notas mejora cómo Google y las plataformas entienden y previsualizan cada artículo.

Este cambio cierra los dos huecos de sitemap (**A**) y agrega JSON-LD `NewsArticle` al detalle de nota (**C**). La accesibilidad (WCAG AA) queda **fuera**: es su propio trabajo (**B**), con su propia exploración.

## What Changes

- **Sitemap de `apps/sitio`** (`app/sitemap.ts`): pasa a `async` y deriva del contenido las rutas de noticias — `/comunidad/noticias`, cada `/comunidad/noticias/<slug>` y `/comunidad/noticias/pagina/<n>` (n = 2..totalPáginas, reusando `totalPaginas`/`NOTICIAS_POR_PAGINA`). Cada URL de nota lleva `lastModified = fecha` de la nota.
- **Sitemap del catálogo** (`apps/catalogo/app/sitemap.ts`): agrega `/colaboradores` a las rutas.
- **JSON-LD `NewsArticle`** en el detalle de nota (`app/comunidad/noticias/[slug]/page.tsx`): un `<script type="application/ld+json">` inyectado como Server Component (espejo del patrón `Organization` del landing), con `headline`, `description`, `datePublished`, `author`, `image` (URL absoluta), `publisher` (Organization) y `mainEntityOfPage` (canónico).

## No-goals

- **No** se toca la accesibilidad (WCAG AA) — es el trabajo **B**, con su propio explore/propuesta.
- **No** se agregan imágenes OG nuevas ni se cambian las existentes.
- **No** se modifican canónicos, metadata ni Twitter cards (ya presentes y correctos).
- **No** se cambia la UI de la fecha en el frontend: la fecha de publicación ya se muestra en tarjeta y detalle.
- **No** se agrega un campo de "actualización" al esquema de la nota (solo existe `fecha` = publicación; `lastModified` = esa misma fecha).
- **No** hay backend ni contenido nuevo. **Sin ADR** (implementa decisiones SEO ya aceptadas).

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `sitio-seo`: el sitemap del sitio SHALL incluir además las rutas de noticias (listado, detalle por slug y paginación); los datos estructurados SHALL incluir además `NewsArticle` en el detalle de nota.
- `catalogo-app`: el sitemap del catálogo SHALL incluir además `/colaboradores`.

## Impact

- **Apps afectadas:** `apps/sitio`, `apps/catalogo` (solo frontend estático; sin backend).
- **Código:** `apps/sitio/app/sitemap.ts` (async + noticias), `apps/catalogo/app/sitemap.ts` (+colaboradores), `apps/sitio/app/comunidad/noticias/[slug]/page.tsx` (JSON-LD NewsArticle).
- **Specs:** `sitio-seo` (sitemap + datos estructurados), `catalogo-app` (sitemap).
- **Sin ADR** (no hay decisión arquitectónica nueva).
- **Verificación:** los `sitemap.xml` listan las rutas nuevas y el HTML del detalle trae un `NewsArticle` JSON-LD válido.
