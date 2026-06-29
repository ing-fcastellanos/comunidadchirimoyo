## Context

`apps/sitio` corre en Cloud Run (`output: "standalone"`, ADR-0015) → las páginas con `generateStaticParams` se **pre-renderizan en build** (SSG) y se sirven estáticas. `/comunidad` existe pero es un placeholder de scaffold. No hay middleware: las secciones son paths bajo un dominio (ADR-0023); `comunidad.*` es solo vanity 301. Ya existe `lib/noticias.ts` (#70): `getAllNoticias()` devuelve `NoticiaMeta[]` ordenado por fecha desc, con borradores excluidos en producción y `portada` resuelta a URL del bucket. Hay primitivos `Section`/`SectionTitle`/`Badge` y los tokens; `next/image` + `remotePatterns` del bucket ya configurados.

## Goals / Non-Goals

**Goals:**
- Listado paginado estático en `/comunidad/noticias`, responsive y accesible, alimentado por `getAllNoticias()`.
- Estructura lista para crecer (paginación por rutas) y para enlazar al detalle (#72).

**Non-Goals:**
- Detalle de nota (#72); integración en `/comunidad` y nav (#73); seed real (#74); filtros/búsqueda; paginación en cliente.

## Decisions

**D1 — Rutas: página 1 en base, resto en `/pagina/[n]`.**
- `app/comunidad/noticias/page.tsx` → página **1** (slice `[0, N)`).
- `app/comunidad/noticias/pagina/[n]/page.tsx` → páginas **2..N**; `generateStaticParams` devuelve `n = 2..ceil(total/N)`; `dynamicParams = false` → cualquier otro `n` da 404. `n = 1` PUEDE redirigir o 404 (canónica es la base); se elige **404** para `n<=1` por simplicidad (la canónica es `/comunidad/noticias`).
- Ambas rutas resuelven su slice y renderizan el mismo componente `ListadoNoticias`.

**D2 — Tamaño de página constante.** `NOTICIAS_POR_PAGINA = 9` (grilla 3×3 en desktop). Constante en un módulo compartido (`lib/noticias.ts` o un util de listado). Cambiarlo solo recalcula `generateStaticParams`.

**D3 — Componente `ListadoNoticias`.** Server Component que recibe `{ notas: NoticiaMeta[], pagina: number, totalPaginas: number }`: encabezado (kicker + título "Noticias"), grilla de `NoticiaCard`, y `PaginacionNoticias`. Si `notas` global es 0 → renderiza el **estado vacío** en vez de la grilla.

**D4 — `NoticiaCard`.** portada con `next/image` (contenedor `aspect-[16/9]`, `object-cover`); **fallback** cuando `portada` es null (bloque con `mint-wash` + ícono `Newspaper`, sin romper el layout). Debajo: fecha (formateada), título (serif), resumen (clamp ~3 líneas). Toda la tarjeta es un enlace (`next/link`) a `/comunidad/noticias/<slug>`.

**D5 — Fecha en español, UTC-safe.** Helper `formatearFecha(iso)`: parsea `YYYY-MM-DD` y formatea con `Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" })`. El `timeZone: "UTC"` evita el corrimiento de un día al renderizar en distintas zonas. Devuelve el ISO crudo si el parseo falla.

**D6 — Paginación accesible.** `PaginacionNoticias({ pagina, totalPaginas })`: `<nav aria-label="Paginación de noticias">` con enlace **Anterior** (`rel="prev"`, a `/comunidad/noticias` si va a la 1, o `/pagina/n-1`) y **Siguiente** (`rel="next"`, a `/pagina/n+1`). Cada extremo se **omite** cuando no aplica (en la 1 no hay Anterior; en la última no hay Siguiente). Indicador "Página X de Y". Si `totalPaginas <= 1`, no se renderiza la nav.

**D7 — Estado vacío.** Cuando `getAllNoticias()` está vacío (caso real en prod hoy): tarjeta/bloque con copy amable ("Aún no publicamos noticias; vuelve pronto") usando los primitivos, **sin** error ni 404. La página 1 siempre existe.

**D8 — Enlace hacia adelante al detalle.** Las tarjetas enlazan a `/comunidad/noticias/<slug>` aunque el detalle (#72) aún no exista (404 temporal). #71→#72 son secuenciales y preceden al seed real (#74), así que no hay enlaces rotos visibles para el público antes de publicar.

**D9 — Sin v0.dev.** Grilla de tarjetas + paginación se derivan del vocabulario visual existente (cards tipo `paper-card`, `Section`, `Badge`).

## Risks / Trace-offs

- **Listado vacío en prod hoy** → es intencional (página-base antes del contenido). El estado vacío lo comunica; en dev se ve la nota de ejemplo. Riesgo: parecer "inacabado" si se publica el sitio antes de sembrar notas — mitigación: #73/#74 cierran la épica antes de difundir `/comunidad`.
- **`generateStaticParams` depende del conteo en build** → al añadir notas hay que reconstruir/redeploy (consistente con contenido-en-repo, ADR-0004). Aceptado.
- **Enlace al detalle inexistente (#72)** → 404 temporal; se resuelve al mergear #72. Aceptado por secuencia.
- **Imagen de portada faltante** → fallback evita huecos; las notas sin portada se ven consistentes.

## Migration Plan

Sin migración: solo se añaden rutas y componentes que consumen contenido existente. Deploy normal del sitio (SSG en build). Rollback = revertir el commit (no hay datos productivos; `/comunidad/noticias` deja de existir).

## Open Questions

- Ninguna que bloquee. `n=1` → 404 (canónica en la base) y `N=9` quedan fijados; ajustables sin romper contenido.
