## ADDED Requirements

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
