# jornadas-admin Specification

## Purpose
TBD - created by archiving change crud-jornadas-admin. Update Purpose after archive.
## Requirements
### Requirement: Listado de jornadas en el admin

`apps/admin` SHALL ofrecer una vista (`app/(authed)/jornadas`) que liste **todas** las jornadas (recurrentes y eventos puntuales mezclados), sin paginación. Cada fila SHALL mostrar al menos título, tipo, un resumen en texto de la regla de recurrencia o la fecha del evento, y acciones de editar/borrar.

#### Scenario: Lista incluye recurrentes y eventos
- **WHEN** un usuario autenticado visita `app/(authed)/jornadas`
- **THEN** ve tanto las jornadas recurrentes como los eventos puntuales, cada una con su resumen de regla/fecha

### Requirement: Creación de jornadas con slug autogenerado e inmutable

El sistema SHALL permitir crear una jornada mediante un server action que valide los campos server-side y derive el `slug` (doc ID) del título mediante slugify (kebab-case, sin tildes/ñ). SHALL rechazar la creación si ya existe un documento `jornadas/{slug}` con ese ID. Una vez creada, el `slug` NO SHALL ser editable desde el formulario de edición.

#### Scenario: Creación exitosa
- **WHEN** se envía un formulario de creación con título, tipo, hora, y (según `kind`) recurrencia o fecha válidos
- **THEN** se crea `jornadas/{slug}` con los campos correspondientes

#### Scenario: Slug duplicado
- **WHEN** el slug derivado del título ya existe como documento
- **THEN** la creación se rechaza con un error de validación sin escribir nada

#### Scenario: Slug no editable en edición
- **WHEN** se abre el formulario de edición de una jornada existente
- **THEN** el campo de slug se muestra pero está deshabilitado

### Requirement: `kind` inmutable tras la creación

El discriminador `kind` (`recurrente` | `evento`) SHALL fijarse al crear la jornada y NO SHALL ser editable desde el formulario de edición.

#### Scenario: kind no editable en edición
- **WHEN** se abre el formulario de edición de una jornada existente
- **THEN** no existe ningún control que permita cambiar su `kind`

### Requirement: Formulario condicional según `kind`

El formulario de creación/edición SHALL mostrar campos distintos según `kind`: para `recurrente`, `recurrencia.tipo` (`semanal` | `mensual-ordinal`), `dia` y, cuando `mensual-ordinal`, `ordinales` (al menos uno); para `evento`, el campo `fecha` (ISO `YYYY-MM-DD`).

#### Scenario: Formulario de jornada recurrente
- **WHEN** se crea o edita una jornada con `kind = "recurrente"`
- **THEN** el formulario muestra los campos de regla de recurrencia (tipo, día, ordinales si aplica) y no muestra el campo `fecha`

#### Scenario: Formulario de evento puntual
- **WHEN** se crea o edita una jornada con `kind = "evento"`
- **THEN** el formulario muestra el campo `fecha` y no muestra los campos de regla de recurrencia

### Requirement: Validación server-side de los campos editoriales

Toda escritura (crear/editar) SHALL validar server-side, antes de tocar Firestore: `titulo` no vacío, `tipo` restringido al enum cerrado `limpieza | pajareada | evento`, `hora` no vacía, y según `kind`: para `recurrente`, `dia` válido y, si `recurrencia.tipo = "mensual-ordinal"`, al menos un ordinal seleccionado; para `evento`, `fecha` en formato ISO `YYYY-MM-DD` válida. Las escrituras con validación fallida SHALL rechazarse sin persistir cambios.

#### Scenario: Tipo fuera del enum cerrado
- **WHEN** se envía un formulario con un valor de `tipo` distinto de `limpieza`, `pajareada` o `evento`
- **THEN** la escritura se rechaza con un error de validación, evitando que un valor no soportado llegue a Firestore

#### Scenario: Falta hora
- **WHEN** el campo `hora` está vacío
- **THEN** la escritura se rechaza con un error de validación

#### Scenario: Fecha inválida en un evento
- **WHEN** una jornada `evento` tiene `fecha` en un formato distinto de ISO `YYYY-MM-DD`
- **THEN** la escritura se rechaza con un error de validación

### Requirement: Borrado de jornadas con confirmación

El sistema SHALL permitir borrar (hard delete) una jornada tras una confirmación explícita en la interfaz. El borrado SHALL eliminar el documento `jornadas/{slug}` de Firestore.

#### Scenario: Borrado confirmado
- **WHEN** el usuario confirma el borrado de una jornada
- **THEN** el documento correspondiente deja de existir en Firestore

### Requirement: Revalidación incondicional del sitio en cada escritura

Tras cualquier escritura (crear, editar o borrar) el sistema SHALL invocar `POST {SITIO_BASE_URL}/api/revalidate` con el encabezado `Authorization: Bearer {REVALIDATE_SECRET}` y `{ "tag": "jornadas" }` en el cuerpo, sin condicionar por ningún campo de estado (las jornadas no tienen concepto de borrador). Un fallo en esta llamada NO SHALL revertir ni bloquear la escritura ya realizada en Firestore; el sistema SHALL reportar el fallo de revalidación de forma no bloqueante en la interfaz.

#### Scenario: Crear dispara revalidación
- **WHEN** se crea una jornada nueva
- **THEN** el sistema invoca el endpoint de revalidación con el tag `jornadas`

#### Scenario: Fallo de revalidación no revierte la escritura
- **WHEN** la llamada a `/api/revalidate` falla (error de red o secreto inválido)
- **THEN** el cambio ya persistido en Firestore permanece, y la interfaz muestra un aviso de que la revalidación no se pudo confirmar

### Requirement: Acceso server-only vía Firebase Admin SDK, sin RBAC

Todo el acceso de escritura a la colección `jornadas` desde `apps/admin` SHALL ocurrir server-side (server actions) usando el Firebase Admin SDK, tras verificar la sesión del usuario (capability `auth-admin`). El sistema NO SHALL diferenciar permisos entre usuarios autenticados del panel (sin RBAC, ADR-0029).

#### Scenario: Escritura requiere sesión válida
- **WHEN** un server action de jornadas se invoca sin una sesión `__session` válida
- **THEN** la operación se rechaza (el gate de `(authed)/layout.tsx` ya impide llegar a la página sin sesión)
