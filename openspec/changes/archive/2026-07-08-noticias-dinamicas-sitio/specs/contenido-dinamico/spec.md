## ADDED Requirements

### Requirement: Lectura dinámica de noticias en el sitio

`apps/sitio` SHALL leer las noticias desde Firestore **server-side en runtime** (vía los db-readers `getAllNoticiasDb`/`getNoticiaDb`), no desde archivos en build, en todas sus superficies: listado, paginación, detalle, imagen OpenGraph, teaser de `/comunidad` y `sitemap`. El **build** (`next build`) MUST NOT realizar ninguna lectura a Firestore. En producción (`NODE_ENV=production`) SHALL ocultar las noticias en estado `borrador`.

#### Scenario: Nota publicada aparece sin re-build
- **WHEN** una nota pasa a `estado: publicado` en Firestore
- **THEN** aparece en `/comunidad/noticias` tras la revalidación, sin necesidad de re-desplegar el sitio

#### Scenario: Build sin Firestore
- **WHEN** se construye el sitio en un entorno sin credenciales de Firestore (Docker/CI)
- **THEN** el build completa sin errores y sin acceder a Firestore

#### Scenario: Borradores ocultos en producción
- **WHEN** el sitio corre con `NODE_ENV=production` y una nota está en `borrador`
- **THEN** esa nota no aparece en el listado ni es accesible por su slug (404)

### Requirement: Revalidación on-demand del contenido dinámico

El sitio SHALL exponer un endpoint de revalidación (`app/api/revalidate`, POST) **protegido por un secreto** (`REVALIDATE_SECRET`, comparado server-side; nunca expuesto al cliente) que, al invocarse, revalida las superficies de noticias afectadas: el listado, las páginas de paginación, el detalle del slug indicado y el `sitemap`. Una petición sin el secreto correcto SHALL rechazarse (401/403) sin revalidar.

#### Scenario: Revalidación autorizada
- **WHEN** se hace POST a `/api/revalidate` con el secreto correcto tras publicar una nota
- **THEN** el listado, la paginación, el detalle afectado y el sitemap quedan revalidados y sirven el contenido actualizado

#### Scenario: Revalidación no autorizada
- **WHEN** se hace POST a `/api/revalidate` sin el secreto o con uno inválido
- **THEN** la respuesta es 401/403 y no se revalida nada
