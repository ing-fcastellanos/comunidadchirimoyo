## Context

El catálogo (`apps/catalogo/app/[grupo]/[slug]/page.tsx`) ya establece el patrón de detalle estático: `dynamicParams = false`, `generateStaticParams`, `generateMetadata` con `openGraph: { type: "article", images }` + `twitter`, y `notFound()` si falta. El sitio corre en Cloud Run (`output: "standalone"`, ADR-0015) → las páginas y las imágenes OG con `generateStaticParams` se pre-generan en build (SSG). El loader `getNoticia(slug)` (#70) devuelve la nota con su cuerpo markdown; `Markdown.tsx` (#69) lo renderiza; `formatearFecha` (#71) formatea la fecha. El metadata raíz del sitio fija `metadataBase` (`chirimoyo.org`) y un OG por defecto `/og-default.jpg`. No hay aún ningún `opengraph-image` en el sitio: el OG dinámico es patrón nuevo.

## Goals / Non-Goals

**Goals:**
- Página de detalle estable por slug, con cabecera + cuerpo markdown y metadata `article`.
- Imagen OG generada por nota (título + marca), pre-generada en build.
- Navegación de regreso + anterior/siguiente.

**Non-Goals:**
- Integración en `/comunidad`/nav (#73); seed real (#74); portada como OG; fuente de marca en el OG; runtime edge.

## Decisions

**D1 — Página espejo del catálogo `[slug]`.** `app/comunidad/noticias/[slug]/page.tsx`: `export const dynamicParams = false`; `generateStaticParams` = `getAllNoticias().map(n => ({ slug: n.slug }))`; en el componente, `const nota = await getNoticia(slug); if (!nota) notFound();`. Cabecera + `<Markdown>{nota.cuerpo}</Markdown>` + navegación. Reusa `Section`, `Markdown`, `formatearFecha`, tokens.

**D2 — `generateMetadata`.** `title: nota.titulo`; `description: nota.resumen`; `openGraph: { title, description, type: "article", publishedTime: nota.fecha, authors: nota.autor ? [nota.autor] : undefined }`; `twitter: { card: "summary_large_image", title, description }`. **No** se pasan `images`: el archivo `opengraph-image.tsx` los inyecta automáticamente (convención de Next). `alternates.canonical: /comunidad/noticias/<slug>`.

**D3 — OG dinámico `opengraph-image.tsx`.** Exporta `size = { width: 1200, height: 630 }`, `contentType = "image/png"`, `generateStaticParams` (mismos slugs que la página) y una función `default` async que carga la nota (`getNoticia`) y devuelve `new ImageResponse(<jsx>, { ...size })`. **Runtime Node** (no `export const runtime = "edge"`; Cloud Run es Node y `ImageResponse` funciona en Node en Next 15). Si la nota no existe, devuelve un card genérico de marca (no rompe el build).

**D4 — Diseño del card OG (inline, sin Tailwind).** Satori solo entiende un subconjunto de CSS inline; **no** hay clases Tailwind ni CSS vars. El card usa los **valores hex** de los tokens de marca (forest/mint/paper) en `style={{...}}`: fondo de marca, una franja/lockup con el nombre "Comunidad Chirimoyo" + "Noticias", el **título de la nota** grande (truncado a ~2 líneas), y la **fecha** formateada. **Fuente por defecto** de `ImageResponse` (sin cargar Cormorant); el contenido y los colores cargan la identidad.

**D5 — Cabecera de la página.** Si la nota tiene `portada`, hero con `next/image` (`aspect` ancho, `object-cover`) + `portadaAlt`; encima/debajo, kicker "Noticias", título (serif), línea de meta (fecha + autor). Sin portada, cabecera de texto. Reusa el lenguaje visual del sitio.

**D6 — Anterior/siguiente.** Helper `vecinos(notas, slug)` sobre `getAllNoticias()` (orden desc): devuelve `{ anterior, siguiente }` donde **siguiente** es la nota más nueva contigua y **anterior** la más antigua contigua (o null en los extremos). Se renderizan como dos enlaces al pie con su título; se omite el que no exista. "Volver a noticias" siempre presente (a `/comunidad/noticias`).

**D7 — SSG y 0 publicadas.** `generateStaticParams` corre en build (producción → solo publicadas). Hoy 0 publicadas → 0 páginas de detalle y 0 OG; cualquier `[slug]` → 404 (`dynamicParams=false`). En dev, el `borrador` de ejemplo se incluye y la página/OG se renderizan para previsualizar. `getNoticia` no filtra por estado, pero como solo se generan los slugs publicados (y `dynamicParams=false`), un borrador no es accesible en prod.

**D8 — Sin v0.dev.** Cabecera + cuerpo derivan de primitivos + `Markdown`; el card OG es JSX inline pequeño.

## Risks / Trade-offs

- **`ImageResponse` en runtime Node** → debe funcionar sin `edge`; si una versión de Next lo requiriera en edge, se revisa. En Next 15 funciona en Node. Verificación: el build genera los PNG sin error.
- **Fuente por defecto** → el OG no usa la serif de marca; aceptado para v1 (evita el fetch de fuente y su fragilidad). Pulido futuro: cargar Cormorant.
- **Título largo en el OG** → se trunca (line-clamp/altura fija) para no desbordar el card.
- **Enlaces del listado al detalle** → dejan de dar 404 al mergear; hasta entonces 404 temporal (consistente con la secuencia #71→#72).
- **Borrador visible en dev** → intencional para previsualizar; en prod no se genera.

## Migration Plan

Sin migración: solo se añaden rutas/archivos que consumen contenido existente. Deploy normal del sitio (SSG en build genera páginas + OG). Rollback = revertir el commit (las rutas dejan de existir; sin datos productivos).

## Open Questions

- Ninguna que bloquee. La fuente de marca en el OG y el uso de portada-como-OG quedan como posibles pulidos futuros, no requieren decisión ahora.
