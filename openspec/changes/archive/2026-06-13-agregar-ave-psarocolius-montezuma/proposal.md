## Why

El catálogo tiene 63 especies; falta la **Oropéndola de Moctezuma (*Psarocolius montezuma*)**, congénere de la *Psarocolius wagleri* ya presente (ficha `psarocolius-wagleri`). No tenemos fotos propias de la especie, pero ya existe un proceso probado para sembrar fotos con licencia libre desde repositorios públicos: la *wagleri* y otras 15 especies se incorporaron así (iNaturalist, licencias CC0/CC BY/CC BY-SA, priorizando Veracruz). Este cambio aplica ese mismo flujo a una especie más, sin tocar el esquema ni el pipeline.

Sub-dominios afectados: **aves** (una ficha de contenido nueva + objetos de media en GCS).

## What Changes

- **Fotos (repositorio público):** se agrega *Psarocolius montezuma* a la lista `ESPECIES[]` del script externo `descargar_imagenes_faltantes.py` (vive fuera del repo, junto al banco de imágenes) y se corre para bajar ~10 fotos CC a `Imagenes aves/Psarocolius montezuma/` y registrar su atribución en `creditos_imagenes.json`. Licencias aceptadas: **CC0, CC BY, CC BY-SA** (las que ya usa el script).
- **Fila CSV:** se añade una fila a `content/fauna/_origen/aves-especies.csv` con los datos curados de la especie, clonando la estructura de la fila de *wagleri* y ajustando los valores propios de Moctezuma (cabeza negra, carúncula facial, rango que no llega a Sudamérica, etc.).
- **Audio (xeno-canto):** se localiza una grabación con licencia CC y se llenan las columnas `sonido_*` de la fila (mismo flujo verbatim de ADR-0017).
- **Generación + subida:** se ejecuta `scripts/migrar-fauna.py --upload`, que genera `content/fauna/aves/psarocolius-montezuma/index.md` y sube `web/`, `thumb/` y `audio/` al bucket GCS.
- **Curación de la ficha:** se ajusta a mano el bloque `distribucion` (códigos ISO, sin afirmar más de lo respaldable) y el estatus local de ocurrencia/migratorio, siguiendo el precedente honesto de la ficha de *wagleri* (especie de tierras bajas cerca de su límite altitudinal en Orizaba, ~1230 m).
- **Verificación:** `next build` valida el núcleo de la ficha; la especie aparece en `/busqueda` y en `/aves/psarocolius-montezuma`.

### No-goals

- **No** se construye herramienta nueva ni se mueve el script de descarga al repo: se reutiliza el flujo existente tal cual.
- **No** se documenta ni generaliza el "proceso de agregar una ave" como guía/spec en el repo: queda **diferido a un change posterior** (decisión de alcance del explore).
- **No** se modifica el esquema de la ficha (`esquema-ficha-fauna`) ni el algoritmo del pipeline (`migracion-fauna`): la adición incremental ya está especificada. El único añadido a spec es **declarativo** (política de licencias de fotos sembradas), no un cambio de comportamiento del script.
- **No** se escribe una guía/how-to ni automatización reutilizable del proceso: eso queda diferido a un change posterior.
- **No** se curan otras especies ni se reprocesan las 63 existentes.
- **No** se afirma un rango o estatus local que no podamos respaldar con fuente abierta.

## Capabilities

### New Capabilities

_Ninguna._ Este es un cambio de **contenido**: agrega una instancia (una ficha de especie) usando capacidades ya existentes y especificadas.

- `migracion-fauna`: se **añade** un requisito declarativo de **política de licencias para fotos sembradas desde repositorios públicos** (CC0 / CC BY / CC BY-SA, con atribución y enlace de licencia capturados). Formaliza la práctica ya usada al incorporar *wagleri* y otras 15 especies; no altera el algoritmo del script.

La adición incremental de una especie sin pisar fichas curadas ya está cubierta por el requisito *"Generación idempotente de fichas desde el CSV"* de `migracion-fauna` (escenario "Reejecución no pisa fichas existentes"), y los campos de la ficha ya están en `esquema-ficha-fauna`: esos no cambian.

## Impact

- **Contenido:** nueva ficha `content/fauna/aves/psarocolius-montezuma/index.md` (generada y luego curada) + una fila nueva en `content/fauna/_origen/aves-especies.csv`.
- **Media (GCS):** nuevos objetos bajo `web/psarocolius-montezuma/`, `thumb/psarocolius-montezuma/` y `audio/psarocolius-montezuma/` en `gs://catalogo-aves-chirimoyo` (+ crudas en el bucket de archivo `-raw`).
- **Tooling externo (fuera del repo):** edición de `descargar_imagenes_faltantes.py` (lista `ESPECIES[]`) y regeneración de `creditos_imagenes.json` en `C:\Users\Frank\Downloads\Img guia aves\`.
- **Build/Deploy:** `apps/catalogo` re-exporta estático; la ruta `/aves/psarocolius-montezuma` y el índice de búsqueda se regeneran solos.
- **Sin cambios** en `services/api`, esquema, ni componentes del frontend.
