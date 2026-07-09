## ADDED Requirements

### Requirement: Lectura dinámica de jornadas en el sitio

`apps/sitio` SHALL leer las jornadas desde Firestore **server-side en runtime** (vía `getJornadasDb`, cacheada por tag), no desde archivos en build, en `/voluntarios`. El **build** (`next build`) MUST NOT realizar ninguna lectura a Firestore para las jornadas. La expansión de la recurrencia a próximas ocurrencias (`proximasJornadas`) SHALL permanecer en el front y operar sobre los datos leídos de Firestore.

#### Scenario: Jornada actualizada aparece sin re-build
- **WHEN** se cambia o agrega una jornada en Firestore y se revalida
- **THEN** `/voluntarios` muestra las próximas ocurrencias actualizadas sin re-desplegar el sitio

#### Scenario: Build sin Firestore (jornadas)
- **WHEN** se construye el sitio sin credenciales de Firestore
- **THEN** el build completa sin acceder a Firestore y `/voluntarios` queda como ruta dinámica

## MODIFIED Requirements

### Requirement: Revalidación on-demand del contenido dinámico

El sitio SHALL exponer un endpoint de revalidación (`app/api/revalidate`, POST) **protegido por un secreto** (`REVALIDATE_SECRET`, comparado server-side; nunca expuesto al cliente) que, al invocarse, revalida el contenido dinámico afectado. Por defecto SHALL revalidar **tanto noticias como jornadas** (tags `noticias` y `jornadas`, que cubren el listado y sus páginas, el detalle, el `sitemap` y `/voluntarios`); PUEDE aceptar un parámetro opcional en el cuerpo (`tag`) para revalidar solo uno. Una petición sin el secreto correcto SHALL rechazarse (401/403) sin revalidar.

#### Scenario: Revalidación autorizada
- **WHEN** se hace POST a `/api/revalidate` con el secreto correcto tras publicar contenido
- **THEN** las superficies de noticias y jornadas quedan revalidadas y sirven el contenido actualizado

#### Scenario: Revalidación de un solo tipo
- **WHEN** se hace POST con el secreto correcto y `tag` = `jornadas`
- **THEN** se revalidan solo las superficies de jornadas

#### Scenario: Revalidación no autorizada
- **WHEN** se hace POST a `/api/revalidate` sin el secreto o con uno inválido
- **THEN** la respuesta es 401/403 y no se revalida nada
