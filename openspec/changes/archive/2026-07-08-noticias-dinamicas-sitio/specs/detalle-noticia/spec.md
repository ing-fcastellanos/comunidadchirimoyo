## MODIFIED Requirements

### Requirement: Página de detalle de nota

`apps/sitio` SHALL servir `/comunidad/noticias/<slug>` como página de detalle de una nota de comunidad, **Server Component** que lee la nota de **Firestore en runtime** (`getNoticiaDb`). La página SHALL renderizarse **dinámicamente** (sin `generateStaticParams` ni `dynamicParams = false`): `next build` MUST NOT acceder a Firestore, y las rutas se sirven en el primer request y se cachean por revalidación. Un slug que no corresponde a una nota (o una nota en `borrador` en producción) SHALL responder `notFound()` (404). La página SHALL mostrar una **cabecera** (título, fecha, autor; y la portada como hero si la nota la tiene) y el **cuerpo** renderizado con el renderizador de markdown editorial (`markdown-editorial`).

#### Scenario: Detalle de una nota existente
- **WHEN** se abre `/comunidad/noticias/<slug>` de una nota disponible
- **THEN** se muestra su título, fecha y autor, y su cuerpo markdown renderizado

#### Scenario: Slug inexistente
- **WHEN** se abre `/comunidad/noticias/<slug>` que no corresponde a ninguna nota visible
- **THEN** la respuesta es 404

#### Scenario: El build no accede a Firestore
- **WHEN** se ejecuta `next build` sin credenciales de Firestore
- **THEN** el build completa sin pre-generar ninguna ruta de detalle contra Firestore

### Requirement: Imagen OpenGraph generada por nota

El segmento de detalle SHALL generar una **imagen OpenGraph dinámica** por nota (`opengraph-image`, `ImageResponse`, 1200×630), generada **en runtime al solicitarse** (no pre-generada en build), leyendo la nota de Firestore. La imagen SHALL mostrar la **identidad del proyecto** y el **título de la nota** (y su fecha), y SHALL generarse sin requerir runtime edge (funciona en el runtime Node del sitio). El metadata de la página SHALL referenciar esta imagen automáticamente.

#### Scenario: OG generado al solicitarse
- **WHEN** se solicita la imagen OpenGraph de una nota publicada
- **THEN** se genera un PNG 1200×630 con su título y la marca del proyecto, sin haber requerido acceso a Firestore durante el build

#### Scenario: og:image apunta a la imagen generada
- **WHEN** se inspeccionan las etiquetas OpenGraph/Twitter de una nota
- **THEN** `og:image`/`twitter:image` apuntan a la imagen generada del segmento
