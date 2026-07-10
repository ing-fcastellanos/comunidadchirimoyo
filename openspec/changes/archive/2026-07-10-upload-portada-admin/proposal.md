## Why

Hoy la portada de una noticia (#140) se pega como texto plano — el equipo comunitario debe subir la imagen al bucket por su cuenta (consola de GCP, `gsutil`, etc.) y luego copiar la ruta a mano. Eso reintroduce exactamente la fricción técnica que la Fase 6 busca eliminar (ADR-0028: "publicar sin saber git/deploy"). Este cambio agrega el flujo real de subida desde el propio panel, cerrando el último hueco manual del CRUD de noticias.

## What Changes

- Nuevo Route Handler en `apps/admin` que recibe un archivo de imagen (multipart/form-data), lo valida (content-type, tamaño) y lo sube al bucket `comunidad-chirimoyo` (ADR-0021) vía `@google-cloud/storage`, server-side, tras verificar la sesión.
- El objeto se guarda en una ruta determinística atada al slug de la noticia (`noticias/{slug}-portada.<ext>`): una portada canónica por noticia, re-subir reemplaza el objeto anterior.
- El formulario de **edición** de noticias (`/noticias/{slug}/editar`) reemplaza el input de texto plano de `portada` por un widget de upload (selector de archivo + preview de la imagen actual + "Reemplazar imagen"); `portadaAlt` sigue siendo un campo de texto para accesibilidad.
- El formulario de **creación** no cambia: sigue sin campo de portada, porque el slug (parte del nombre del objeto) solo existe después de crear la noticia — flujo de dos pasos ya aceptado (crear → editar para agregar portada).
- Nuevo rol IAM (`roles/storage.objectAdmin`, acotado al bucket `comunidad-chirimoyo`) para el service account runtime de `admin`, documentado en su README junto a los roles ya anotados de Auth/Firestore.
- Diseño visual del widget de upload generado primero en Claude Design antes de traducirse a código.

## Capabilities

### New Capabilities
- `upload-portada-admin`: subida de imágenes de portada desde `apps/admin` al bucket de comunidad — validación de archivo, nombre determinístico por slug, asociación a la noticia vía los campos `portada`/`portadaAlt` ya existentes.

### Modified Capabilities
(ninguna — `noticias-admin` ya documenta el contrato de validación de `portada`/`portadaAlt` como strings, sin especificar cómo se editan; este cambio solo agrega un mecanismo de escritura para esos mismos campos, no altera ningún requisito existente.)

## Impact

- **Código nuevo:** Route Handler de upload en `apps/admin/app/api/...`, cliente GCS server-only (`apps/admin/lib/storage.ts` o similar), widget de upload (client component) para el formulario de edición.
- **Código modificado:** `apps/admin/components/noticias/NoticiaFormulario.tsx` (reemplaza el input de texto de `portada` por el widget, solo en modo editar), `apps/admin/README.md` / `.env.example` (nuevo rol IAM, posible env var de bucket).
- **Dependencias nuevas:** `@google-cloud/storage` en `apps/admin/package.json` — primera escritura a GCS desde el lado Node/TS del monorepo (el único precedente, `scripts/migrar-fauna.py`, es Python offline).
- **Sin cambios:** esquema de Firestore de noticias (`portada`/`portadaAlt` ya existen como strings, ADR-0028), `services/api` (Flask, ADR-0006 intacto), reglas de Firestore (`deny-all` preservado), CRUD de jornadas (no tiene campo `portada`, confirmado en #141), RBAC (ADR-0029, un solo rol).
- **Subdominios afectados:** admin (nuevo upload), comunidad (las imágenes subidas se sirven públicamente desde el bucket ya usado por el sitio, sin cambios de código en `apps/sitio`).
