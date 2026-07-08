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
