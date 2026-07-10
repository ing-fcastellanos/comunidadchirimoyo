# upload-portada-admin Specification

## Purpose
TBD - created by archiving change upload-portada-admin. Update Purpose after archive.
## Requirements
### Requirement: Subida de portada server-side al bucket de comunidad

`apps/admin` SHALL exponer un Route Handler (`POST /api/noticias/[slug]/portada`) que reciba un archivo de imagen vía `multipart/form-data` y lo suba, server-side vía `@google-cloud/storage`, al bucket `comunidad-chirimoyo` (ADR-0021). El endpoint SHALL requerir una sesión válida (capability `auth-admin`) antes de procesar cualquier archivo. NO SHALL usarse un signed URL para que el cliente suba directo al bucket.

#### Scenario: Subida exitosa
- **WHEN** un usuario autenticado envía un archivo de imagen válido para una noticia existente
- **THEN** el archivo se sube al bucket y el endpoint responde con la ruta relativa del objeto creado

#### Scenario: Sin sesión válida
- **WHEN** se invoca el endpoint sin una cookie `__session` válida
- **THEN** la operación se rechaza sin subir ningún archivo

### Requirement: Validación del archivo antes de subir

El endpoint SHALL validar el archivo antes de subirlo: `content-type` restringido a `image/jpeg`, `image/png` o `image/webp`, y tamaño máximo de 5MB. Un archivo que no cumpla SHALL rechazarse sin subir nada al bucket. El sistema NO SHALL re-optimizar, re-codificar ni redimensionar el archivo — se guarda tal cual se recibió.

#### Scenario: Tipo de archivo no soportado
- **WHEN** se envía un archivo cuyo `content-type` no es `image/jpeg`, `image/png` ni `image/webp`
- **THEN** la subida se rechaza con un error de validación, sin escribir nada en el bucket

#### Scenario: Archivo demasiado grande
- **WHEN** se envía un archivo de más de 5MB
- **THEN** la subida se rechaza con un error de validación, sin escribir nada en el bucket

### Requirement: Nombre de objeto determinístico atado al slug

El sistema SHALL guardar la imagen en la ruta `noticias/{slug}-portada.<ext>`, donde `<ext>` corresponde al `content-type` del archivo recibido y `{slug}` es el slug de la noticia asociada. Una subida posterior para la misma noticia con el mismo `content-type` SHALL sobreescribir el objeto existente en esa misma ruta.

#### Scenario: Re-subida reemplaza el objeto anterior
- **WHEN** se sube una segunda imagen del mismo `content-type` para una noticia que ya tiene portada
- **THEN** el objeto en `noticias/{slug}-portada.<ext>` se sobreescribe con el contenido nuevo, sin crear un objeto adicional

### Requirement: Asociación a la noticia vía el formulario existente, no en el endpoint

El Route Handler de subida NO SHALL escribir en Firestore. El cliente SHALL usar la ruta devuelta por el endpoint para completar el campo `portada` del formulario de edición de la noticia; la persistencia a Firestore SHALL ocurrir exclusivamente a través del server action `actualizarNoticia` ya existente (capability `noticias-admin`), al guardar el formulario.

#### Scenario: La subida no persiste por sí sola
- **WHEN** se sube una imagen pero el formulario de edición no se guarda después
- **THEN** el campo `portada` de la noticia en Firestore no cambia hasta que el formulario se guarde explícitamente

### Requirement: Widget de upload solo en el formulario de edición

El formulario de creación de noticias NO SHALL ofrecer ningún control para subir portada. El widget de subida (selector de archivo, vista previa de la imagen actual, reemplazo) SHALL existir únicamente en el formulario de edición, ya que la ruta del objeto depende del slug de la noticia.

#### Scenario: Sin opción de portada al crear
- **WHEN** se abre el formulario de creación de una noticia
- **THEN** no existe ningún control para subir una imagen de portada

#### Scenario: Widget disponible al editar
- **WHEN** se abre el formulario de edición de una noticia existente
- **THEN** el widget de subida de portada está disponible, con vista previa de la imagen actual si existe

### Requirement: Acceso server-only, sin RBAC

Todo el acceso de escritura al bucket desde `apps/admin` SHALL ocurrir server-side (Route Handler) usando el service account runtime de Cloud Run, tras verificar la sesión del usuario. El sistema NO SHALL diferenciar permisos entre usuarios autenticados del panel (sin RBAC, ADR-0029).

#### Scenario: Verificación de sesión reutiliza el gate existente
- **WHEN** se invoca el endpoint de subida
- **THEN** la verificación de sesión usa la misma lógica (`getSession`) que protege las demás rutas autenticadas del panel
