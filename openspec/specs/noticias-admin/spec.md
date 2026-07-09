# noticias-admin Specification

## Purpose
TBD - created by archiving change crud-noticias-admin. Update Purpose after archive.
## Requirements
### Requirement: Listado de noticias en el admin

`apps/admin` SHALL ofrecer una vista (`app/(authed)/noticias`) que liste **todas** las noticias (`borrador` y `publicado`), ordenadas por `fecha` editorial descendente, sin paginación. Cada fila SHALL mostrar al menos título, fecha, estado y acciones de editar/borrar/alternar estado.

#### Scenario: Lista incluye borradores y publicadas
- **WHEN** un usuario autenticado visita `app/(authed)/noticias`
- **THEN** ve tanto las noticias en `borrador` como las `publicado`, ordenadas por `fecha` descendente

### Requirement: Creación de noticias con slug autogenerado e inmutable

El sistema SHALL permitir crear una noticia mediante un server action que valide los campos server-side y derive el `slug` (doc ID) del título mediante slugify (kebab-case, sin tildes/ñ). SHALL rechazar la creación si ya existe un documento `noticias/{slug}` con ese ID. Una vez creada, el `slug` NO SHALL ser editable desde el formulario de edición.

#### Scenario: Creación exitosa
- **WHEN** se envía un formulario de creación con título, resumen, fecha y cuerpo válidos
- **THEN** se crea `noticias/{slug}` con `estado: "borrador"` por defecto, `createdAt` y `updatedAt` fijados al momento de la escritura

#### Scenario: Slug duplicado
- **WHEN** el slug derivado del título ya existe como documento
- **THEN** la creación se rechaza con un error de validación sin escribir nada

#### Scenario: Slug no editable en edición
- **WHEN** se abre el formulario de edición de una noticia existente
- **THEN** el campo de slug se muestra pero está deshabilitado

### Requirement: Validación server-side de los campos editoriales

Toda escritura (crear/editar) SHALL validar server-side, antes de tocar Firestore: `titulo` y `resumen` no vacíos, `fecha` en formato ISO `YYYY-MM-DD` válida, `tags` como lista de strings en kebab-case, y `portadaAlt` requerido cuando `portada` tiene valor. Las escrituras con validación fallida SHALL rechazarse sin persistir cambios, retornando el detalle del error al formulario.

#### Scenario: Falta portadaAlt con portada presente
- **WHEN** se envía un formulario con `portada` pero sin `portadaAlt`
- **THEN** la escritura se rechaza y se reporta el campo faltante

#### Scenario: Fecha inválida
- **WHEN** el campo `fecha` no cumple el formato ISO `YYYY-MM-DD`
- **THEN** la escritura se rechaza con un error de validación

### Requirement: Transición de estado borrador↔publicado con publishedAt de una sola escritura

El sistema SHALL permitir alternar el campo `estado` entre `borrador` y `publicado` desde el admin. La primera vez que una noticia pasa a `estado: "publicado"`, el sistema SHALL fijar `publishedAt` (Timestamp). En transiciones posteriores (despublicar, o volver a publicar) el sistema NO SHALL modificar `publishedAt` una vez fijado.

#### Scenario: Primera publicación fija publishedAt
- **WHEN** una noticia en `borrador` (con `publishedAt` nulo) pasa a `publicado`
- **THEN** se fija `publishedAt` al momento de la transición

#### Scenario: Republicación no vuelve a fijar publishedAt
- **WHEN** una noticia con `publishedAt` ya fijado se despublica y luego se vuelve a publicar
- **THEN** `publishedAt` conserva su valor original, sin sobreescribirse

### Requirement: Borrado de noticias con confirmación

El sistema SHALL permitir borrar (hard delete) una noticia tras una confirmación explícita en la interfaz. El borrado SHALL eliminar el documento `noticias/{slug}` de Firestore.

#### Scenario: Borrado confirmado
- **WHEN** el usuario confirma el borrado de una noticia
- **THEN** el documento correspondiente deja de existir en Firestore

### Requirement: Revalidación best-effort del sitio al cambiar contenido público

Tras cualquier escritura (crear, editar, despublicar o borrar) donde la noticia **sea o haya sido** `publicado`, el sistema SHALL invocar `POST {SITIO_BASE_URL}/api/revalidate` con el encabezado `Authorization: Bearer {REVALIDATE_SECRET}` y `{ "tag": "noticias" }` en el cuerpo. Un fallo en esta llamada (red, secreto inválido, sitio no disponible) NO SHALL revertir ni bloquear la escritura ya realizada en Firestore; el sistema SHALL reportar el fallo de revalidación de forma no bloqueante en la interfaz. Escrituras que solo afectan una noticia que permanece en `borrador` NO SHALL disparar esta llamada.

#### Scenario: Publicar dispara revalidación
- **WHEN** una noticia pasa de `borrador` a `publicado`
- **THEN** el sistema invoca el endpoint de revalidación con el tag `noticias`

#### Scenario: Editar un borrador no dispara revalidación
- **WHEN** se edita una noticia que permanece en `borrador` antes y después del cambio
- **THEN** el sistema no invoca el endpoint de revalidación

#### Scenario: Fallo de revalidación no revierte la escritura
- **WHEN** la llamada a `/api/revalidate` falla (error de red o secreto inválido)
- **THEN** el cambio ya persistido en Firestore permanece, y la interfaz muestra un aviso de que la revalidación no se pudo confirmar

### Requirement: Acceso server-only vía Firebase Admin SDK, sin RBAC

Todo el acceso de escritura a la colección `noticias` desde `apps/admin` SHALL ocurrir server-side (server actions) usando el Firebase Admin SDK, tras verificar la sesión del usuario (capability `auth-admin`). El sistema NO SHALL diferenciar permisos entre usuarios autenticados del panel (sin RBAC, ADR-0029).

#### Scenario: Escritura requiere sesión válida
- **WHEN** un server action de noticias se invoca sin una sesión `__session` válida
- **THEN** la operación se rechaza (el gate de `(authed)/layout.tsx` ya impide llegar a la página sin sesión)
