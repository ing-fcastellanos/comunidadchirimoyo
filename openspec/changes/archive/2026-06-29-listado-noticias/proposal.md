## Why

La infra de noticias (esquema + loader `lib/noticias.ts`, renderizador markdown) ya existe (#69/#70), pero no hay ninguna **superficie** que muestre las notas. Este cambio entrega la primera: un **listado paginado** en `/comunidad/noticias` (épica #20, issue #71). Es una página-base: queda lista para llenarse cuando se siembren notas reales (#74); hoy en producción saldrá vacía (solo hay una nota en `borrador`).

## What Changes

- **Ruta `/comunidad/noticias`** (`app/comunidad/noticias/page.tsx`): primera página del listado — grilla de tarjetas de nota ordenadas por fecha desc, consumiendo `getAllNoticias()`.
- **Paginación estática** `app/comunidad/noticias/pagina/[n]/page.tsx` con `generateStaticParams` (n = 2..`ceil(total/N)`) y `dynamicParams = false`; páginas fuera de rango → `notFound()`. **N por página = constante (9)**.
- **Componente compartido `ListadoNoticias`**: grilla responsive de tarjetas (portada con `next/image` + **fallback** si la nota no tiene portada, **fecha formateada en español (UTC-safe)**, título, resumen) que enlazan a `/comunidad/noticias/<slug>` (el detalle llega en #72; enlace hacia adelante).
- **Navegación entre páginas** accesible (Anterior/Siguiente con `aria-label` y `rel="prev"/"next"`, ocultos en los extremos).
- **Estado vacío** amable cuando no hay notas publicadas (sin error).
- Todo **Server Components**, reusando `Section`/`SectionTitle`/`Badge` y los tokens; **sin v0.dev** (deriva del vocabulario visual existente).

## No-goals

- **No** se construye el **detalle** de la nota (`/comunidad/noticias/<slug>`, #72) ni su OpenGraph dinámico; las tarjetas solo enlazan hacia él.
- **No** se integra el listado en la página `/comunidad` ni en la navegación global (#73); `app/comunidad/page.tsx` no se toca.
- **No** se siembran notas reales (#74): se usa el contenido existente (la nota de ejemplo).
- **No** se introduce paginación en cliente, filtros ni búsqueda; la paginación es estática por rutas.
- **No** hay middleware por host: la ruta es el path `/comunidad/noticias` (ADR-0023; el issue menciona ADR-0008, ya superseado).

## Capabilities

### New Capabilities
- `listado-noticias`: listado paginado estático de notas de comunidad en `/comunidad/noticias` (+ `/pagina/[n]`), con tarjetas que enlazan al detalle, navegación accesible, estado vacío y manejo de páginas fuera de rango.

### Modified Capabilities
<!-- ninguna: noticias-comunidad (el loader) no cambia sus requisitos; solo se consume -->

## Impact

- **Sub-dominio afectado:** comunidad (`apps/sitio`, sección `/comunidad`).
- **Código (`apps/sitio`):** `app/comunidad/noticias/page.tsx`, `app/comunidad/noticias/pagina/[n]/page.tsx`, `components/comunidad/ListadoNoticias.tsx` (+ posible `NoticiaCard`, `PaginacionNoticias`); helper de formato de fecha y de paginado (en `lib/noticias.ts` o un util).
- **Contenido:** ninguno nuevo (consume `content/noticias/`).
- **Dependencias:** ninguna nueva (Next, `next/image`, `next/link`, `Intl` ya disponibles).
- **Sin** cambios en API, esquema, ni convenciones documentadas → **no requiere ADR**.
