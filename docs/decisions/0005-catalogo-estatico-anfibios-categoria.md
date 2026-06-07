# ADR-0005 — Catálogo de fauna estático; anfibios como categoría

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

`aves.chirimoyo.org` mostrará un catálogo de aves con buscador, detalle por especie y descarga en PDF. Existe trabajo previo: catálogo inicial, características, banco de imágenes y diseños en v0.dev para buscador y detalle. Además hay ~10 anfibios/reptiles registrados, que originalmente se pensaron como sitio aparte (`anfibios.chirimoyo.org`).

Hay que decidir: (a) cómo se sirven búsqueda y detalle, y (b) si anfibios es un sitio o una categoría.

## Decisión

1. **Catálogo 100% estático.** Los datos de cada especie viven en `content/` (Markdown/JSON, ver ADR-0004). El listado, el buscador/filtros y el detalle se generan en build (SSG); la búsqueda es **en cliente** sobre un índice JSON. **No** hay endpoint de búsqueda en el API.
2. **Anfibios/reptiles son una categoría** dentro de `apps/catalogo`, no un sitio separado. El catálogo distingue grupos (Aves / Anfibios y reptiles) con un filtro. `anfibios.chirimoyo.org`, si se usa, redirige a la categoría dentro de `aves.chirimoyo.org`.
3. El **PDF del catálogo** se genera a partir de los mismos datos de `content/`.

## Alternativas consideradas

- **Búsqueda server-side vía API:** innecesaria para un catálogo de cientos de especies; el dataset cabe en cliente y la búsqueda estática es instantánea y sin costo de backend. Descartada (rompería ADR-0006).
- **`anfibios.chirimoyo.org` como app separada:** fiel al plan original, pero duplica buscador, detalle e infraestructura para ~10 especies. Descartada por costo/beneficio.

## Consecuencias

### Positivas

- Cero backend para el catálogo: rápido, barato, cacheable en CDN, resistente.
- Anfibios reutiliza todo el trabajo de aves; un solo deploy.
- El catálogo funciona aunque el API esté caído.

### Negativas

- Cada alta/cambio de especie implica build + deploy (aceptable).
- Si el dataset creciera a miles de especies con filtros complejos, la búsqueda en cliente podría requerir optimización (índice paginado, etc.).

### Neutras

- El esquema de la ficha (campos: nombre común/científico, familia, estatus residente/migratoria, temporada, fotos, etc.) se define en una issue de research de Fase 1.

## Plan de revisión

Reconsiderar la búsqueda en cliente si el catálogo supera un tamaño que degrade la carga inicial. Reconsiderar la fusión si anfibios crece a un catálogo grande con identidad propia.

## Referencias

- ADR-0004 (contenido en repo), ADR-0006 (API mínima).
- Diseños v0.dev de buscador y detalle (fuente visual; ver ADR-0011).
