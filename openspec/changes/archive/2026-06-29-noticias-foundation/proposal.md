## Why

Las **notas de comunidad** (épica #20) necesitan contenido editorial real —enlaces, listas, imágenes, citas, subtítulos—, pero el repo hoy solo tiene parsers caseros que entienden `## H2` y `**negritas**` (`splitSecciones` en `apps/sitio`, `parseSecciones` en el catálogo). Extender ese parser reinventaría markdown. Hace falta (1) un **renderizador markdown** real y (2) el **esquema + data-layer** de la nota. Son la base (foundational) de la sección de noticias; las páginas (#71–#74) vienen después. Introducir la primera dependencia de markdown rompe una convención del repo → **requiere ADR** (CLAUDE.md). Cierra #69 y #70 juntos porque el renderer sin consumidor no se puede ejercitar y el loader sin renderer no parsea cuerpos.

## What Changes

- **ADR-0026** (`docs/decisions/0026-renderizador-markdown.md`): justifica adoptar **`react-markdown` + `remark-gfm`** como renderizador editorial; define el alcance (qué elementos se permiten), la postura de **sanitización segura por construcción** (contenido confiable del repo + **sin HTML crudo**: no se habilita `rehype-raw`/`dangerouslySetInnerHTML`; si algún día se permite HTML, se añade `rehype-sanitize`), y la relación con los parsers caseros (que **se conservan**). Actualiza `docs/adr/_index.md`.
- **Componente `apps/sitio/components/ui/Markdown.tsx`** (Server Component, sin `dangerouslySetInnerHTML`): renderiza markdown mapeando cada elemento a los **tokens de diseño** del proyecto (sin `@tailwindcss/typography`); enlaces externos seguros (`rel="noopener noreferrer" target="_blank"`); **imágenes con `next/image`** (`fill` dentro de un contenedor con aspect-ratio fijo — el sitio es `output: "standalone"` en Cloud Run, next/image optimiza; `images.remotePatterns` del bucket ya configurado, ADR-0021).
- **Esquema de nota** `content/noticias/<slug>.md`: frontmatter `titulo`, `slug`, `fecha` (ISO), `resumen`, `autor`, `portada` (ruta de imagen vía bucket), `portadaAlt`, `estado` (`borrador` | `publicado`), `tags` (opcional); cuerpo en markdown.
- **Loader `apps/sitio/lib/noticias.ts`**: `getAllNoticias()` (ordenadas por `fecha` desc, **excluye `borrador` en producción**) y `getNoticia(slug)`, con tipos exportados; mismo patrón que `landing.ts` (`gray-matter`, `CONTENT_ROOT`, `mediaUrl`). El cuerpo se renderiza con `Markdown.tsx`.
- **`content/noticias/README.md`** documentando el esquema y convenciones (fechas ISO, `slug` kebab-case, imágenes optimizadas en el bucket), + **una nota `.md` de ejemplo** que ejercita el renderer (enlaces, listas, imagen, cita).
- **Dependencias nuevas:** `react-markdown` y `remark-gfm` en `apps/sitio` (justificadas por ADR-0026).

## No-goals

- **No** se construyen las páginas de noticias (`/comunidad/noticias` listado #71, detalle #72, integración #73, seed #74): esto es solo la base (renderer + data-layer + ejemplo).
- **No** se migra el landing ni `/privacidad` al nuevo renderer: `splitSecciones`/`parseSecciones` **conviven** (dirigen *layout* estructurado, no markdown libre). Migrar `/privacidad` es opcional y futuro.
- **No** se habilita HTML crudo en markdown (sin `rehype-raw`); el contenido es confiable y la seguridad es por construcción.
- **No** se toca el catálogo (`apps/catalogo`); el renderer vive en `apps/sitio` (las noticias son de comunidad). Compartirlo con el catálogo sería un paso futuro (no hay lib compartida, ADR-0001).
- **No** se añade `@tailwindcss/typography`: el estilo se mapea a tokens a mano.

## Capabilities

### New Capabilities
- `markdown-editorial`: renderizador de markdown editorial para `apps/sitio` (react-markdown + remark-gfm), seguro por construcción (sin HTML crudo), mapeado a tokens de diseño, con enlaces seguros e imágenes `next/image`.
- `noticias-comunidad`: esquema de la nota de comunidad (`content/noticias/<slug>.md`) y data-layer (`lib/noticias.ts`) que la lee y tipa, ordenando por fecha y excluyendo borradores en producción.

### Modified Capabilities
<!-- ninguna: el landing/privacidad no cambian; los parsers caseros se conservan -->

## Impact

- **Sub-dominios afectados:** sitio (`apps/sitio`), foundation (ADR + índice).
- **Código (`apps/sitio`):** `components/ui/Markdown.tsx`, `lib/noticias.ts`; `package.json` (+`react-markdown`, +`remark-gfm`).
- **Contenido:** nuevo `content/noticias/` (README + nota de ejemplo). Medios en bucket (ADR-0021), no en el repo.
- **Docs:** `docs/decisions/0026-renderizador-markdown.md` (nuevo, Accepted), `docs/adr/_index.md` (entrada). Actualizar CLAUDE.md ("cero deps de markdown" deja de ser cierto) — nota menor.
- **Convención rota (con ADR):** deja de ser cierto que el repo no tiene dependencia de markdown.
