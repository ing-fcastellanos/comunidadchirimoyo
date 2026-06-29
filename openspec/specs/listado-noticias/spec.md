# listado-noticias Specification

## Purpose
TBD - created by archiving change listado-noticias. Update Purpose after archive.
## Requirements
### Requirement: Listado de noticias en `/comunidad/noticias`

`apps/sitio` SHALL servir `/comunidad/noticias` como un listado de notas de comunidad, **Server Component**, que consume `getAllNoticias()` y muestra las notas en una grilla de tarjetas **ordenadas por fecha descendente**. La ruta SHALL ser un path directo (sin middleware por host; ADR-0023). Las imágenes SHALL usar `next/image`.

#### Scenario: Listado muestra las notas
- **WHEN** existen notas publicadas y se abre `/comunidad/noticias`
- **THEN** se muestran sus tarjetas ordenadas de la más reciente a la más antigua

#### Scenario: Cada tarjeta enlaza al detalle
- **WHEN** se observa una tarjeta de nota
- **THEN** enlaza a `/comunidad/noticias/<slug>` y muestra fecha, título y resumen (y portada si la nota la tiene)

### Requirement: Paginación estática

El listado SHALL paginarse con un tamaño de página fijo: la **primera** página en `/comunidad/noticias` y las **siguientes** en `/comunidad/noticias/pagina/[n]` (n ≥ 2). Las páginas SHALL pre-generarse con `generateStaticParams` para `n` de 2 hasta el total de páginas, con `dynamicParams = false`. Una página **fuera de rango** SHALL responder `notFound()` (404).

#### Scenario: Segunda página
- **WHEN** hay más notas que el tamaño de página y se abre `/comunidad/noticias/pagina/2`
- **THEN** se muestran las notas correspondientes a esa página

#### Scenario: Página fuera de rango
- **WHEN** se solicita `/comunidad/noticias/pagina/<n>` con un `n` que no corresponde a ninguna página
- **THEN** la respuesta es 404 (no se genera ruta para él)

### Requirement: Navegación entre páginas accesible

Cuando haya más de una página, el listado SHALL ofrecer navegación **Anterior/Siguiente** dentro de un `nav` etiquetado (`aria-label`), con `rel="prev"`/`rel="next"`, e indicación de la página actual. El control **Anterior** SHALL omitirse en la primera página y **Siguiente** en la última. Con una sola página, la navegación SHALL omitirse.

#### Scenario: Controles en una página intermedia
- **WHEN** se está en una página que no es la primera ni la última
- **THEN** se muestran Anterior y Siguiente, cada uno enlazando a la página contigua

#### Scenario: Extremos sin control sobrante
- **WHEN** se está en la primera página
- **THEN** no se muestra el control Anterior

### Requirement: Estado vacío y fecha legible

Cuando no haya notas publicadas, `/comunidad/noticias` SHALL mostrar un **estado vacío** amable (sin error ni 404). Las fechas SHALL presentarse en español y de forma **estable respecto de la zona horaria** (sin corrimiento de día).

#### Scenario: Sin notas publicadas
- **WHEN** `getAllNoticias()` no devuelve notas (p. ej. todas en borrador en producción)
- **THEN** `/comunidad/noticias` se renderiza con un mensaje de estado vacío, no un error

#### Scenario: Fecha estable
- **WHEN** se muestra la fecha de una nota (`YYYY-MM-DD`)
- **THEN** se presenta en español sin desplazarse un día por la zona horaria del entorno de render

