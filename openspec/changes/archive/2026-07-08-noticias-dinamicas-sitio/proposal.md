## Why

Con los db-readers de #134 y los datos sembrados en #135, falta el paso que hace visible el cambio: que las páginas de **noticias** del sitio lean de **Firestore en runtime** en vez de los archivos en build. Hoy `/comunidad/noticias`, el detalle, la paginación, el OG y el sitemap se **pre-generan en build** desde `content/`; para que una nota publicada aparezca sin re-desplegar, deben leer Firestore server-side con revalidación (issue #136, ADR-0028).

## What Changes

- **Swap de fuente** en las 6 superficies que consumen los loaders `fs`: `getAllNoticias → getAllNoticiasDb`, `getNoticia → getNoticiaDb` (detalle, paginación, OG, listado, landing de comunidad, sitemap). Los db-readers devuelven los **mismos tipos**, así que JSX, JSON-LD `NewsArticle`, `vecinos()` y la paginación no cambian.
- **Render en runtime, build libre de Firestore.** Se quita `generateStaticParams` + `dynamicParams = false` del detalle, su OG y la paginación; el listado y el sitemap dejan de pre-generarse contra Firestore. **Invariante duro:** `next build` (el `RUN npm run build` del Dockerfile, en un stage sin credenciales GCP) SHALL hacer **cero** llamadas a Firestore. Las páginas se renderizan al primer request (Cloud Run tiene ADC) y se cachean por revalidación.
- **Revalidación on-demand:** nuevo endpoint `app/api/revalidate` (route handler POST, protegido por secreto `REVALIDATE_SECRET`) que revalida el listado, todas las páginas `pagina/[n]`, el slug tocado y el sitemap. Queda listo para que el admin lo llame al publicar (#140). Se acompaña de una revalidación temporal de respaldo.
- **Borradores ocultos en prod:** sin cambios de lógica — los db-readers ya filtran `estado` cuando `NODE_ENV=production`. (Requiere el índice compuesto de #134 desplegado.)
- **`NewsArticle` JSON-LD, OpenGraph y sitemap** se preservan; solo cambia la fuente y el momento (runtime en vez de build).

## No-goals

- **No** se borran `content/noticias/`, `lib/noticias.ts` ni el seed: `lib/noticias.ts` es el **hogar del tipo `Noticia`** (lo reusan los readers y los componentes) y la **fuente del seed** de #135, que además migra noticias *y* jornadas juntas. El borrado físico de `content/` + loaders `fs` es un **cleanup atómico tras #137**.
- **No** se tocan las **jornadas** (`/voluntarios`, `lib/jornadas.ts`) — eso es #137.
- **No** se construye el admin: el endpoint de revalidación queda expuesto y protegido, pero quien lo dispara (al publicar) se cablea en #140.
- **No** cambian el layout, el copy, el JSON-LD ni el esquema de datos; es un cambio de **fuente y modelo de render**, no de contenido.
- **No** se toca el API Flask ni las reglas `deny-all` (ADR-0006/0012 preservados).

## Capabilities

### New Capabilities
<!-- ninguna: no hay capacidad de producto nueva; se añade comportamiento a `contenido-dinamico` y se modifican las capacidades de noticias existentes. -->

### Modified Capabilities
- `listado-noticias`: la paginación deja de ser **estática** (pre-generada en build) y pasa a **render dinámico en runtime con revalidación** (sin `generateStaticParams`, sin enumeración en build).
- `detalle-noticia`: el detalle y su imagen OpenGraph dejan de **pre-generarse en build** (`generateStaticParams`/`dynamicParams=false`) y pasan a render **dinámico en runtime**; `notFound()` sigue cubriendo slugs inexistentes.
- `contenido-dinamico`: se añade el comportamiento de **lectura dinámica de noticias en el sitio** (server-side desde Firestore, build libre de Firestore) y la **revalidación on-demand** (endpoint protegido por secreto).

## Impact

- **Sub-dominios afectados:** sitio + comunidad (páginas de noticias, sitemap, nuevo route handler de revalidación).
- **Código (`apps/sitio`):** `app/comunidad/noticias/**` (listado, `[slug]`, `[slug]/opengraph-image`, `pagina/[n]`), `app/comunidad/page.tsx`, `app/sitemap.ts`, nuevo `app/api/revalidate/route.ts`. Los componentes (`ListadoNoticias`, `NoticiaCard`) no cambian (solo importan el tipo).
- **Config/secretos:** `REVALIDATE_SECRET` (server-only) en `.env.example` y en el runtime de Cloud Run.
- **Ops:** desplegar el **índice compuesto** (`estado`+`fecha`, ya en `firestore.indexes.json`) antes de que prod lea; `roles/datastore.user` al SA runtime del sitio (runbook #144). El **build de Docker no cambia** (sigue sin creds; el invariante lo garantiza).
- **Sin** cambios en API, reglas Firestore ni convenciones → **no requiere ADR** (implementa ADR-0028).
