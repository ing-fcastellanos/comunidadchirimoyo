## Context

`apps/admin` ya tiene el CRUD de noticias completo (#140): `portada`/`portadaAlt` existen como campos de texto plano en el formulario de edición, persistidos vía el server action `actualizarNoticia`. El bucket público `comunidad-chirimoyo` (ADR-0021) ya sirve las imágenes que el sitio consume (`mediaUrl()`), pero **nada en el monorepo escribe a GCS desde una app en runtime** — el único precedente (`scripts/migrar-fauna.py`) es un script Python offline con credenciales de operador. Este cambio construye el primer flujo de escritura a GCS desde dentro de una app Next.

## Goals / Non-Goals

**Goals:**
- Subir una imagen de portada desde el navegador al bucket de comunidad, server-side, sin exponer credenciales al cliente.
- Asociar el resultado (ruta relativa) a los campos `portada`/`portadaAlt` ya existentes, sin cambiar el esquema de Firestore.
- Mantener el flujo dentro de los límites de simplicidad del proyecto: sin CORS-en-bucket, sin procesamiento de imágenes, sin versionado de cache.

**Non-Goals:**
- Optimización/conversión automática de imágenes (sigue siendo responsabilidad editorial, como ya documenta `content/noticias/README.md`).
- Subida de portada durante la creación de la noticia (D6: requiere el slug, que solo existe tras crear).
- Borrado en cascada del objeto GCS al borrar la noticia.
- CRUD de jornadas (no tiene campo `portada`).
- Galería de imágenes o biblioteca de medios reusable — esto es una portada por noticia, no un gestor de archivos general.

## Decisions

### D1 — Route Handler (no signed URL)
`POST /api/noticias/[slug]/portada` recibe el archivo vía `multipart/form-data`, lo valida y lo sube server-side con `@google-cloud/storage`. Se descarta signed URL porque requeriría configurar **CORS en el bucket** (una pieza de infra GCP adicional que documentar y mantener) para permitir el PUT cross-origin desde `admin.chirimoyo.org`; con un Route Handler todo el flujo queda dentro de la app, ya protegido por el gate de sesión existente (`(authed)/layout.tsx`), y no hereda el límite de 1MB que sí tienen los Server Actions (no configurado en `next.config.ts`).

### D2 — `@google-cloud/storage` como dependencia nueva
Primera dependencia de storage en el lado Node/TS del monorepo. Cliente lazy-singleton, mismo espíritu que `lib/firestore.ts`/`lib/firebase-admin.ts` (ADC, sin llave JSON, cacheado en `globalThis`).

### D3 — IAM: `roles/storage.objectAdmin` acotado al bucket
Rol nuevo para el service account runtime de Cloud Run `admin`, otorgado **a nivel de bucket** (`comunidad-chirimoyo`), no a nivel de proyecto — mismo principio de mínimo privilegio que los roles ya otorgados (`serviceAccountTokenCreator` para Auth, `datastore.user` para Firestore). Se documenta en `apps/admin/README.md` y se anota para el runbook #144.

### D4 — Validación de archivo, sin procesamiento
Content-type restringido a `image/jpeg`, `image/png`, `image/webp`; tamaño máximo 5MB. El archivo se guarda tal cual, con la extensión correspondiente a su content-type (`.jpg`/`.png`/`.webp`) — **no** se agrega `sharp` ni ninguna conversión/optimización server-side. Coherente con `content/noticias/README.md` ("optimiza las imágenes antes de subirlas") y con el precedente de fauna (optimización manual offline).

### D5 — Nombre determinístico atado al slug
`noticias/{slug}-portada.<ext>`. Una portada canónica por noticia: volver a subir reemplaza el objeto en el mismo path (mismo bucket, mismo nombre) — sin acumular huérfanos por re-subidas repetidas de la misma noticia. Si cambia la extensión entre subidas (ej. de `.jpg` a `.webp`), el objeto viejo con la extensión anterior queda huérfano (caso raro, aceptado sin mitigación especial, ver Risks).

### D6 — Widget de upload solo en edición; creación sin cambios
Confirmado con el usuario: como el nombre del objeto depende del slug (D5), y el slug solo existe tras `crearNoticia`, el widget de upload solo aparece en `/noticias/{slug}/editar`. El formulario de creación no gana ningún campo de portada — sigue el flujo ya establecido (crear → editar para agregar portada, imágenes, etc.).

### D7 — Sin borrado en cascada
`borrarNoticia` (#140) no se modifica: no borra el objeto GCS asociado. Consistente con el resto del proyecto — bajo volumen, limpieza manual si hace falta, mismo espíritu que el precedente de fauna (curaduría manual, no automatizada).

### D8 — Sin versionado/cache-busting
Reemplazar una portada sobreescribe el mismo path público; el navegador puede servir brevemente una versión cacheada antes de que expire su caché. Se acepta este riesgo cosmético (sitio de bajo tráfico) en vez de agregar un esquema de versionado (que requeriría persistir un número de versión o timestamp junto a `portada`, ampliando el esquema de Firestore sin necesidad real).

### D9 — El Route Handler solo sube; la persistencia en Firestore sigue siendo del formulario existente
El handler de upload **no escribe en Firestore**. Devuelve `{ path: "noticias/{slug}-portada.jpg" }` (o un error); el cliente actualiza el campo `portada` del formulario de edición con esa ruta, y la persistencia a Firestore ocurre como ya ocurre hoy — al enviar el formulario, vía `actualizarNoticia`. Esto mantiene una **única vía de escritura a Firestore** para el documento de la noticia (sin duplicar la lógica de actualización en dos lugares) y reusa la validación ya existente de `portadaAlt` requerido si hay `portada`.

**Trade-off aceptado:** si el usuario sube una imagen pero no hace clic en "Guardar cambios", la imagen queda en el bucket sin asociarse a la noticia (huérfana) hasta la próxima subida/guardado — igual de aceptable que el resto de los huérfanos de D7, y coherente con que el resto de los campos del formulario tampoco se persisten hasta guardar.

### D10 — UI: widget con preview, primero en Claude Design
Selector de archivo + preview de la imagen actual (si existe, resuelta con la misma lógica de `mediaUrl` que usa el sitio) + botón "Reemplazar imagen" + estado de progreso/error de subida. Pantalla nueva → pasa primero por Claude Design (mismo flujo que `/noticias`, `/jornadas`, `/login`), revisado por el usuario antes de traducirse a código.

## Risks / Trade-offs

- **[Riesgo] Cambiar el content-type entre subidas dobla el objeto en el bucket** (D5: `.jpg` viejo + `.webp` nuevo, ambos coexistiendo, el viejo huérfano) → Mitigación: aceptado sin código especial; el bucket ya tolera huérfanos por diseño (D7); si molesta, limpieza manual ocasional.
- **[Riesgo] Primera escritura a GCS desde Node — superficie nueva de fallo (permisos IAM mal propagados, bucket incorrecto)** → Mitigación: mismo patrón de verificación manual ya usado para Firestore/Auth (README documenta el rol, se prueba en producción tras el primer deploy antes de anunciar la función al equipo).
- **[Trade-off] Sin optimización automática** → el equipo editorial sigue siendo responsable de subir imágenes ya optimizadas (D4); aceptable dado el volumen bajo y para no ampliar el alcance con una dependencia de procesamiento de imágenes.
- **[Trade-off] Huérfanos en el bucket por diseño (D7)** → costo de almacenamiento casi nulo a este volumen; se prefiere simplicidad sobre limpieza automática.

## Migration Plan

No hay migración de datos (el esquema de `portada`/`portadaAlt` ya existe desde #140). Pasos de despliegue:
1. Otorgar `roles/storage.objectAdmin` sobre el bucket `comunidad-chirimoyo` al service account runtime de Cloud Run `admin` (paso de IAM, documentado en el README, anotado para el runbook #144).
2. Deploy de `apps/admin` con el Route Handler y el widget nuevos.
3. Verificación manual: subir una imagen de portada a una noticia de prueba, confirmar que el objeto aparece en el bucket con el nombre esperado, que la noticia guardada la muestra correctamente en `apps/sitio` tras publicar, y que reemplazarla sobreescribe el objeto.

Sin rollback especial: app deployable independiente (ADR-0001); revertir es re-desplegar la revisión anterior de Cloud Run `admin`. El rol IAM otorgado de más (si se revierte el código) no tiene efecto negativo por sí solo.

## Open Questions

Ninguna pendiente — todas las decisiones (D1-D10) fueron cerradas explícitamente en `/opsx:explore 142` y en la redacción de este documento.
