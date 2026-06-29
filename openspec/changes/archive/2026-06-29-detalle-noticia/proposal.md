## Why

El listado de noticias ya enlaza al detalle (`/comunidad/noticias/<slug>`), pero esa página aún no existe (404). Este cambio la construye y, con ella, **completa el par listado↔detalle** de la sección de noticias (épica #20, issue #72). Aprovecha todo lo ya hecho: `getNoticia()` (#70), el renderizador `Markdown.tsx` (#69) y `formatearFecha` (#71). Aporta además un patrón **nuevo** en el repo: la **imagen OpenGraph generada dinámicamente** por nota (`ImageResponse`), para que compartir una nota muestre un card de marca con su título.

## What Changes

- **Ruta `/comunidad/noticias/[slug]`** (`app/comunidad/noticias/[slug]/page.tsx`): **espejo del patrón del catálogo** `[grupo]/[slug]` — `dynamicParams = false` + `generateStaticParams` desde `getAllNoticias()`; `notFound()` si la nota no existe. Renderiza una **cabecera** (portada como hero, título, fecha, autor) y el **cuerpo markdown** con `Markdown.tsx`.
- **`generateMetadata`**: `title`, `description` (= `resumen`), `openGraph` con `type: "article"` (+ `publishedTime`, `authors`) y `twitter` (`summary_large_image`). **Sin `images` manuales**: las aporta el archivo-convención OG.
- **OG dinámico** `app/comunidad/noticias/[slug]/opengraph-image.tsx` (`ImageResponse`, `next/og`): un PNG **1200×630** por nota, generado en **build** (`generateStaticParams` con los mismos slugs), con la **marca del proyecto + título de la nota + fecha** sobre fondo de marca. **Runtime Node** (el sitio es standalone/Cloud Run, no edge). Diseño con estilos inline/colores hex (Satori no procesa Tailwind). **Fuente por defecto** de `ImageResponse` (la serif de marca queda como pulido futuro).
- **Navegación**: enlace "Volver a noticias" y enlaces **anterior/siguiente** entre notas (vecinos por fecha, derivados de `getAllNoticias()`).

## No-goals

- **No** se integra el listado/sección en `/comunidad` ni en la navegación global (#73), ni se siembran notas reales (#74).
- **No** se usa la **portada** como imagen OG: el OG es un card **generado** (título + marca), consistente para todas las notas; la portada se usa como hero de la página.
- **No** se carga una fuente personalizada en el OG (se usa la fuente por defecto de `ImageResponse`); la serif de marca es un pulido futuro.
- **No** se introduce runtime edge ni dependencias nuevas (`next/og` viene con Next).
- **No** se reescribe el metadata raíz del sitio: el OG por-nota solo **override** en estas páginas.

## Capabilities

### New Capabilities
- `detalle-noticia`: página estática de detalle de una nota de comunidad (`/comunidad/noticias/<slug>`) con cabecera + cuerpo markdown, metadata `article`, imagen OpenGraph generada dinámicamente por nota, y navegación de regreso + anterior/siguiente.

### Modified Capabilities
<!-- ninguna: noticias-comunidad (loader) y listado-noticias no cambian sus requisitos -->

## Impact

- **Sub-dominio afectado:** comunidad (`apps/sitio`, sección `/comunidad`).
- **Código (`apps/sitio`):** `app/comunidad/noticias/[slug]/page.tsx`, `app/comunidad/noticias/[slug]/opengraph-image.tsx`; posible componente de cabecera/nav en `components/comunidad/`; helper de vecinos (anterior/siguiente) sobre `getAllNoticias()`.
- **Contenido:** ninguno nuevo (consume `content/noticias/`). En prod hoy hay 0 publicadas → 0 páginas/OG generados; el `borrador` de ejemplo renderiza en dev.
- **Dependencias:** ninguna nueva.
- **Sin** cambios en API, esquema, ni convenciones documentadas → **no requiere ADR** (el OG con `ImageResponse` es API estándar de Next).
