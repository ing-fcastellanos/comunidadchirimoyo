## RENAMED Requirements

- FROM: `### Requirement: Paginación estática`
- TO: `### Requirement: Paginación con revalidación (ISR)`

## MODIFIED Requirements

### Requirement: Paginación con revalidación (ISR)

El listado SHALL paginarse con un tamaño de página fijo: la **primera** página en `/comunidad/noticias` y las **siguientes** en `/comunidad/noticias/pagina/[n]` (n ≥ 2). Las páginas SHALL renderizarse **dinámicamente en el servidor** leyendo Firestore en runtime, **sin** `generateStaticParams` ni enumeración en build: `next build` MUST NOT acceder a Firestore. El contenido SHALL cachearse por **revalidación** (temporal de respaldo + on-demand). Una página **fuera de rango** o con `n` no numérico SHALL responder `notFound()` (404).

#### Scenario: Segunda página
- **WHEN** hay más notas que el tamaño de página y se abre `/comunidad/noticias/pagina/2`
- **THEN** se muestran las notas correspondientes a esa página

#### Scenario: Página fuera de rango
- **WHEN** se solicita `/comunidad/noticias/pagina/<n>` con un `n` que no corresponde a ninguna página
- **THEN** la respuesta es 404

#### Scenario: El build no accede a Firestore
- **WHEN** se ejecuta `next build` sin credenciales de Firestore (como en el Docker del sitio)
- **THEN** el build completa sin errores y sin realizar ninguna lectura a Firestore (las páginas se renderizan en runtime)
