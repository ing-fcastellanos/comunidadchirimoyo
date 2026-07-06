# Tasks — completar-sitemaps-jsonld-noticias

## 1. Sitemap del sitio incluye noticias (A)

- [x] 1.1 `apps/sitio/app/sitemap.ts` — convertir a `async`; importar `getAllNoticias` (`@/lib/noticias`) y `totalPaginas`/`NOTICIAS_POR_PAGINA` (`@/lib/noticias-paginacion`)
- [x] 1.2 Añadir `/comunidad/noticias` (listado) y `/comunidad/noticias/pagina/<n>` para n = 2..`totalPaginas(notas.length)` a las rutas del sitemap
- [x] 1.3 Añadir una entrada por cada nota `/comunidad/noticias/<slug>` con `lastModified` = `new Date(nota.fecha)`; conservar las 7 rutas estáticas actuales sin cambios

## 2. Sitemap del catálogo incluye /colaboradores (A)

- [x] 2.1 `apps/catalogo/app/sitemap.ts` — agregar `/colaboradores` a la lista `rutas` (mantener `force-static` y el resto igual)

## 3. JSON-LD NewsArticle en el detalle de nota (C)

- [x] 3.1 `apps/sitio/app/comunidad/noticias/[slug]/page.tsx` — construir en el servidor un objeto `NewsArticle` (`@context`, `@type`, `headline`, y condicionalmente `description`, `datePublished`, `author` Person, `image` absoluta vía `mediaUrl`, `publisher` Organization, `mainEntityOfPage` canónico absoluto). Omitir claves cuando el dato no exista
- [x] 3.2 Inyectarlo con `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />` al inicio del render (espejo del patrón `Organization` del landing). Sin cambios visibles ni de metadata

## 4. Verificación

- [x] 4.1 Build o dev de `apps/sitio`: `sitemap.xml` incluye `/comunidad/noticias`, al menos un `/comunidad/noticias/<slug>` (con `lastmod`) y `/comunidad/noticias/pagina/2` si hay ≥2 páginas
- [x] 4.2 Build o dev de `apps/catalogo`: `sitemap.xml` incluye `/colaboradores`
- [x] 4.3 HTML del detalle de una nota: existe un `<script type="application/ld+json">` cuyo contenido es `NewsArticle` válido (JSON parseable, `headline` = título, `mainEntityOfPage` = canónico); confirmar que una nota sin autor/portada omite esas claves y sigue siendo JSON válido
- [x] 4.4 Confirmar que no cambió nada visible del frontend ni la metadata/canónicos existentes
