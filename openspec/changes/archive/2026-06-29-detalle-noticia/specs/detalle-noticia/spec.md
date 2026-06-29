## ADDED Requirements

### Requirement: Página de detalle de nota

`apps/sitio` SHALL servir `/comunidad/noticias/<slug>` como página de detalle estática de una nota de comunidad, **Server Component**. Las rutas SHALL pre-generarse con `generateStaticParams` desde `getAllNoticias()` y `dynamicParams = false`; un slug que no corresponde a una nota SHALL responder `notFound()` (404). La página SHALL mostrar una **cabecera** (título, fecha, autor; y la portada como hero si la nota la tiene) y el **cuerpo** renderizado con el renderizador de markdown editorial (`markdown-editorial`).

#### Scenario: Detalle de una nota existente
- **WHEN** se abre `/comunidad/noticias/<slug>` de una nota disponible
- **THEN** se muestra su título, fecha y autor, y su cuerpo markdown renderizado

#### Scenario: Slug inexistente
- **WHEN** se abre `/comunidad/noticias/<slug>` que no corresponde a ninguna nota
- **THEN** la respuesta es 404 (no se genera ruta para él)

### Requirement: Metadata de artículo

La página SHALL exponer `generateMetadata` con `title` (título de la nota), `description` (resumen), `openGraph` con `type: "article"` (incluyendo fecha de publicación y autor cuando existan) y `twitter` (`summary_large_image`), además del canonical de la nota. La imagen OpenGraph SHALL provenir de la imagen generada por el segmento (no se fijan `images` manuales en el metadata).

#### Scenario: Metadata de artículo presente
- **WHEN** se inspecciona el `<head>` de una nota
- **THEN** incluye título, descripción (resumen), `og:type=article` y etiquetas de Twitter card, con canonical de la nota

### Requirement: Imagen OpenGraph generada por nota

El segmento de detalle SHALL generar una **imagen OpenGraph dinámica** por nota (`opengraph-image`, `ImageResponse`, 1200×630), pre-generada en build con los mismos slugs que la página. La imagen SHALL mostrar la **identidad del proyecto** y el **título de la nota** (y su fecha), y SHALL generarse sin requerir runtime edge (funciona en el runtime Node del sitio). El metadata de la página SHALL referenciar esta imagen automáticamente.

#### Scenario: OG generado al construir
- **WHEN** se ejecuta el build con notas publicadas
- **THEN** se genera un PNG OpenGraph por nota con su título y la marca del proyecto

#### Scenario: og:image apunta a la imagen generada
- **WHEN** se inspeccionan las etiquetas OpenGraph/Twitter de una nota
- **THEN** `og:image`/`twitter:image` apuntan a la imagen generada del segmento

### Requirement: Navegación del detalle

La página SHALL ofrecer un enlace de **regreso al listado** (`/comunidad/noticias`) y enlaces a las notas **anterior/siguiente** (vecinas por fecha, derivadas de `getAllNoticias()`); cada enlace de vecino SHALL omitirse cuando no exista (extremos de la lista).

#### Scenario: Regreso al listado
- **WHEN** se observa el detalle de una nota
- **THEN** hay un enlace que lleva a `/comunidad/noticias`

#### Scenario: Vecinos por fecha
- **WHEN** una nota tiene una nota más reciente y/o más antigua contigua
- **THEN** se muestran los enlaces a esas notas; en los extremos, el enlace ausente se omite
