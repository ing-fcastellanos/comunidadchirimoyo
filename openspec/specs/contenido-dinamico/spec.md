# contenido-dinamico Specification

## Purpose
TBD - created by archiving change modelo-datos-firestore. Update Purpose after archive.
## Requirements
### Requirement: Colección Firestore de noticias

El sistema SHALL almacenar cada noticia como un documento en la colección `noticias`, con el **`slug` como ID del documento**. El documento SHALL contener los campos editoriales `titulo`, `resumen`, `autor`, `fecha` (ISO `YYYY-MM-DD`, fecha editorial), `portada`, `portadaAlt`, `estado` (`borrador` | `publicado`), `tags` (lista de strings) y `cuerpo` (markdown). El sistema SHALL mantener además campos de sistema `createdAt`, `updatedAt` y `publishedAt` como Timestamps, separados de la fecha editorial. La forma del documento SHALL ser la fuente de verdad que honran el seed, el sitio y el admin.

#### Scenario: Documento de noticia con slug como ID
- **WHEN** se persiste una noticia con `slug = "jornada-de-limpieza-mayo"`
- **THEN** existe el documento `noticias/jornada-de-limpieza-mayo` con los campos editoriales y de sistema definidos

#### Scenario: Estado por defecto no publicado
- **WHEN** se crea una noticia sin `estado` explícito
- **THEN** se trata como `borrador` y no se considera publicada

### Requirement: Colección Firestore de jornadas con discriminador

El sistema SHALL almacenar jornadas y eventos en **una sola colección** `jornadas`, con el `slug` como ID del documento y un campo discriminador `kind` con valor `recurrente` o `evento`. Todos los documentos SHALL compartir la base (`titulo`, `tipo`, `hora`, `lugar`, `inscripcion`, `descripcion`). Un documento con `kind = "recurrente"` SHALL incluir `recurrencia` (regla: `tipo`, `dia`, y `ordinales` cuando aplique); uno con `kind = "evento"` SHALL incluir `fecha` (ISO `YYYY-MM-DD`). El sistema SHALL almacenar **solo la regla de recurrencia**, no las fechas expandidas.

#### Scenario: Jornada recurrente guarda la regla, no las fechas
- **WHEN** se persiste una jornada recurrente "cada jueves"
- **THEN** el documento tiene `kind = "recurrente"` y su `recurrencia`, sin materializar ninguna fecha concreta

#### Scenario: Evento puntual con fecha
- **WHEN** se persiste un evento con fecha
- **THEN** el documento tiene `kind = "evento"` y su campo `fecha` en ISO

### Requirement: Acceso a Firestore server-only vía Firebase Admin SDK

El sistema SHALL acceder a las colecciones `noticias` y `jornadas` **exclusivamente desde código de servidor** usando `firebase-admin` (Node). El cliente SHALL inicializarse de forma **lazy (singleton)** mediante Application Default Credentials (ADC), sin llave JSON en el repo, resistente al hot-reload de desarrollo. El módulo de acceso MUST NOT ser importable desde componentes de cliente. El sistema NO SHALL introducir endpoints en el API Flask para estos datos.

#### Scenario: Inicialización por ADC sin llave
- **WHEN** el código de servidor obtiene el cliente Firestore
- **THEN** se inicializa vía ADC (SA runtime en Cloud Run; `gcloud` ADC o emulator en local) sin leer ninguna llave JSON versionada

#### Scenario: El API Flask no participa
- **WHEN** se inspecciona el acceso a noticias/jornadas
- **THEN** ocurre desde Node server-side vía Admin SDK, sin ninguna ruta nueva en `services/api`

### Requirement: Reglas de Firestore permanecen deny-all

El sistema SHALL mantener las reglas de seguridad de Firestore en `deny-all` para el acceso vía client SDK. El acceso legítimo a `noticias` y `jornadas` SHALL ser únicamente server-side (Admin SDK, que bypasea las reglas por diseño).

#### Scenario: Cliente sin acceso directo
- **WHEN** un client SDK intenta leer o escribir `noticias` o `jornadas`
- **THEN** la operación es denegada por las reglas

### Requirement: Índice de listado de noticias

El sistema SHALL declarar en `firestore.indexes.json` el índice compuesto necesario para listar noticias publicadas ordenadas por fecha descendente (`estado` ascendente + `fecha` descendente), enganchado al despliegue de Firebase.

#### Scenario: Listado publicado por fecha
- **WHEN** se consultan las noticias con `estado = "publicado"` ordenadas por `fecha` descendente
- **THEN** la consulta se resuelve con el índice compuesto declarado, sin error de índice faltante

### Requirement: Verificación de la capa de acceso (smoke)

El cambio SHALL incluir una verificación mínima (smoke) que escriba un documento efímero, lo lea y lo borre, para validar la conectividad y el contrato de la capa de acceso sin depender de la migración de datos.

#### Scenario: Smoke write/read/delete
- **WHEN** se ejecuta el smoke de la capa de acceso
- **THEN** escribe un documento de prueba, lo recupera con los mismos datos y lo elimina, terminando sin residuos

### Requirement: Migración determinista del contenido del repo a Firestore

El sistema SHALL proveer una operación de **seed** que puebla las colecciones `noticias` y `jornadas` a partir del contenido existente en el repo (`content/noticias/*.md` y `content/jornadas/jornadas.json`), reutilizando el mapeo de los loaders actuales. La operación SHALL ser **determinista e idempotente**: correrla más de una vez SHALL producir documentos idénticos (mismo doc ID = `slug`, mismos campos). Los campos de sistema de las noticias SHALL derivarse de la `fecha` editorial (`createdAt = updatedAt = fecha`; `publishedAt = fecha` si `estado == "publicado"`, si no `null`), sin usar marcas de tiempo del servidor. Las noticias en estado `borrador` SHALL migrarse fielmente (no se omiten). La operación SHALL poder ejecutarse contra el emulator (dev) y contra producción (migración real).

#### Scenario: Seed puebla las colecciones desde el repo
- **WHEN** se ejecuta el seed sobre una base vacía
- **THEN** cada noticia de `content/noticias/*.md` existe como `noticias/{slug}` y cada jornada/evento de `jornadas.json` existe como `jornadas/{slug}` con su discriminador `kind`

#### Scenario: Re-ejecución idéntica (idempotente)
- **WHEN** se ejecuta el seed dos veces seguidas sin cambiar el contenido del repo
- **THEN** los documentos resultantes son idénticos tras la segunda corrida (timestamps derivados de `fecha`, no del reloj)

#### Scenario: Los borradores se migran
- **WHEN** una noticia en `content/` está en `estado: borrador`
- **THEN** se escribe en Firestore con `estado = "borrador"` (no se omite)

### Requirement: Verificación de paridad tras la migración

El seed SHALL ofrecer un modo de **verificación** que compare la salida de los loaders de archivos (`getAllNoticias`, `getJornadas`) contra la de los lectores de Firestore (`getAllNoticiasDb`, `getJornadasDb`) y reporte cualquier divergencia en slugs, títulos, estado o conteos.

#### Scenario: Paridad tras el seed
- **WHEN** se ejecuta la verificación después de un seed exitoso
- **THEN** el conjunto de noticias y jornadas leído de Firestore coincide (slugs, títulos, estado, conteos) con el leído de los archivos, sin divergencias

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

### Requirement: Lectura dinámica de jornadas en el sitio

`apps/sitio` SHALL leer las jornadas desde Firestore **server-side en runtime** (vía `getJornadasDb`, cacheada por tag), no desde archivos en build, en `/voluntarios`. El **build** (`next build`) MUST NOT realizar ninguna lectura a Firestore para las jornadas. La expansión de la recurrencia a próximas ocurrencias (`proximasJornadas`) SHALL permanecer en el front y operar sobre los datos leídos de Firestore.

#### Scenario: Jornada actualizada aparece sin re-build
- **WHEN** se cambia o agrega una jornada en Firestore y se revalida
- **THEN** `/voluntarios` muestra las próximas ocurrencias actualizadas sin re-desplegar el sitio

#### Scenario: Build sin Firestore (jornadas)
- **WHEN** se construye el sitio sin credenciales de Firestore
- **THEN** el build completa sin acceder a Firestore y `/voluntarios` queda como ruta dinámica

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
