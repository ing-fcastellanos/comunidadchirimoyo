## 1. Decisión de infraestructura (ADR + bucket)

- [x] 1.1 Escribir `docs/decisions/0016-storage-imagenes-fauna-gcs.md` (resuelve ADR-0003 §5: bucket público `catalogo-aves-chirimoyo` para `web/`+`thumb/` + bucket privado coldline `catalogo-aves-chirimoyo-raw` para `raw/`; servido por URL pública del bucket, sin LB/CDN/dominio por costo) y actualizar el índice en `docs/adr/_index.md`
- [x] 1.2 Crear el bucket privado `catalogo-aves-chirimoyo-raw` (coldline, public-access-prevention), mover las crudas ahí (`<slug>/<archivo>`) y hacer público el principal (`allUsers`→`objectViewer`); verificado: web/thumb 200, raw/ público 404, archivo privado 403
- [x] 1.3 Definir `NEXT_PUBLIC_FAUNA_CDN_BASE` (default `https://storage.googleapis.com/catalogo-aves-chirimoyo`) y documentar la convención de claves `web|thumb/<slug>/<archivo>` (público) y `raw/<slug>/<archivo>` (archivo privado)

## 2. Esquema y utilidades compartidas

- [x] 2.1 Implementar la función de slug (kebab-case: minúsculas, sin acentos, espacios→`-`) usada por el script y verificable contra `Ardea alba → ardea-alba`
- [x] 2.2 Extender el tipo `Foto` con `creditoUrl?` y `licenciaUrl?` (aditivo/opcional) en `apps/catalogo/lib/content.ts` y documentarlo en `content/README.md` (extensión compatible de #9)
- [x] 2.3 Documentar el contrato del manifiesto `creditos_imagenes.json` (índice por `(nombre_cientifico, basename)`; campos `atribucion`/`autor`/`licencia`/`licencia_url`/`observacion_url`/`foto_pagina`) en `content/fauna/_origen/README.md`

## 3. Script de migración — fichas

- [x] 3.1 Crear `scripts/migrar-fauna.py` con CLI (por defecto no sube ni pisa; `--upload`, `--force`, `--img-out`, `--limit`, rutas configurables) y encabezado que explica la idempotencia
- [x] 3.2 Leer el CSV (UTF-8) y mapear columnas→ficha según `content/fauna/_origen/README.md`, ignorando las columnas legacy
- [x] 3.3 Parsear `estatus_conservacion_detallado` → `conservacion.nom059` + `conservacion.iucn` (tabla del README)
- [x] 3.4 Emitir `content/fauna/aves/<slug>/index.md` con template controlado que reproduce el orden/estilo de `_ejemplo.md` (frontmatter atómico + secciones `##`)
- [x] 3.5 Idempotencia de fichas: saltar si la carpeta ya existe; regenerar solo con `--force`; detectar colisiones de slug y abortar con mensaje

## 4. Script de migración — imágenes a GCS

- [x] 4.1 Emparejar cada especie con la carpeta del banco (nombre científico) e ignorar carpetas que no sean especies; reportar especies sin carpeta y carpetas sin especie
- [x] 4.2 Deduplicar fotos por hash de contenido (`.jpg`/`.jpeg`/`.png`)
- [x] 4.3 Optimizar con Pillow a dos variantes WebP (web ~1600 px ~82 % · thumb ~600 px ~75 %, sin EXIF) y subir original a `raw/<slug>/`, web a `web/<slug>/` y miniatura a `thumb/<slug>/` en `catalogo-aves-chirimoyo` (implementado y verificado local; la subida real es 7.2)
- [x] 4.4 Idempotencia de subidas: subir solo si el objeto no existe; `--force` re-sube
- [x] 4.5 Poblar `fotos[]` por ficha (archivo = nombre en `web/` `.webp`, portada = primera alfabética) mapeando del manifiesto `atribucion`→`credito`, `licencia`, `foto_pagina`/`observacion_url`→`creditoUrl`, `licencia_url`→`licenciaUrl`; "pendiente" solo si no hay entrada

## 5. Validación del esquema

- [x] 5.1 Implementar validación núcleo-estricto/resto-tolerante en el script: abortar listando especie + campo faltante del núcleo de #9
- [x] 5.2 Auto-verificación: re-parsear el frontmatter de cada ficha emitida antes de escribirla

## 6. Loader real del catálogo

- [x] 6.1 Implementar `getAllFichas()` en `apps/catalogo/lib/content.ts`: descubrir `content/fauna/<grupo>/<slug>/index.md`, parsear frontmatter (gray-matter) + cuerpo, excluir carpetas con prefijo `_`
- [x] 6.2 Validar el núcleo en build y fallar (identificando ficha + campo) ante núcleo incompleto; tolerar opcionales ausentes
- [x] 6.3 Añadir un helper `fotoUrl(slug, archivo, variante: "web" | "thumb")` en `lib/content.ts` que componga `${NEXT_PUBLIC_FAUNA_CDN_BASE}/<variante>/<slug>/<archivo>` (consumible por #11/#13)
- [x] 6.4 Verificar que `npm run typecheck` y `npm run build` pasan en `apps/catalogo` con las fichas reales

## 7. Verificación en seco

- [x] 7.1 Correr el script contra el CSV (63) y revisar fichas generadas vs `_ejemplo.md` (atribución del manifiesto incluida); 63/63 fichas válidas, 503 fotos referenciadas
- [x] 7.2 Corrida real con subida al bucket ejecutada por el usuario (`--upload`): 503 objetos en `raw/`, `web/` y `thumb/`. Falta solo la reorganización de buckets/IAM de 1.2.
