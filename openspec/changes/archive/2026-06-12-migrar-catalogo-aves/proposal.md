## Why

El esquema de la ficha de fauna quedó congelado en #9, pero `content/fauna/aves/` solo
tiene `_ejemplo.md`: no hay catálogo real. El catálogo inicial (63 especies) vive en
`content/fauna/_origen/aves-especies.csv` y un banco de imágenes local (503 fotos) sin
estructura de publicación. Sin migrar estos datos a
fichas y sin un loader real, las issues de listado (#11), buscador (#12), detalle (#13)
y PDF (#14) están bloqueadas. Necesitamos un proceso **repetible** porque el catálogo
seguirá creciendo (especies nuevas, más fotos).

## What Changes

- **Script de migración idempotente** (`scripts/migrar-fauna.*`) que lee el CSV de origen
  y genera una ficha `content/fauna/aves/<slug>/index.md` por especie, siguiendo el
  esquema de #9 y el formato de `_ejemplo.md`. Reejecutable: crea las especies nuevas y
  **no pisa** fichas existentes ya curadas a mano (salvo `--force`).
- **Pipeline de imágenes a Google Cloud Storage**: por cada especie, deduplica las fotos
  del banco local, sube las **crudas** (archivo) y genera + sube versiones **optimizadas**
  (para mostrar) a un bucket. Las fichas referencian las URLs optimizadas; la primera foto
  (orden alfabético) es la portada.
- **Manifiesto de créditos**: el script lee un archivo aparte (foto → autor → licencia)
  que provee el equipo, para poblar `credito`/`licencia` de cada `fotos[]`. Sin manifiesto,
  la foto se marca como crédito pendiente (no se inventan atribuciones).
- **Loader real** en `apps/catalogo/lib/content.ts`: `getAllFichas()` pasa de stub a
  parsear frontmatter + cuerpo Markdown de las fichas reales.
- **Validación de esquema** (núcleo estricto / resto tolerante): falla si falta el núcleo
  de #9; los campos ⊙ ausentes se toleran y se mostrarán como "Información pendiente".
- **ADR nuevo** que resuelve ADR-0003 §5 (storage de imágenes): bucket GCS con ambas
  variantes (crudas como archivo, optimizadas para servir), dado el peso de 2.1 GB.

### No-goals

- **No** se rediseña el esquema de #9: se consume tal cual (cualquier ajuste vuelve a #9).
- **No** se introduce endpoint ni backend de búsqueda: el catálogo sigue 100% estático.
- **No** se construye el listado/detalle/PDF (#11/#13/#14) ni el deploy (#15): esta issue
  solo produce datos + loader + validación.
- **No** hay curaduría editorial automática: el script deduplica pero no elige "la mejor"
  foto ni reescribe prosa; eso queda para revisión humana sobre las fichas generadas.
- La corrida real con subida al bucket es parte de `/opsx:apply`, no de esta propuesta.

## Capabilities

### New Capabilities
- `migracion-fauna`: proceso reproducible que transforma el CSV de origen + el banco de
  imágenes local en fichas `content/fauna/aves/<slug>/index.md` válidas y en objetos de
  GCS (crudas + optimizadas), con manifiesto de créditos, deduplicación e idempotencia.

### Modified Capabilities
- `catalogo-app`: la requirement "Acceso a contenido en build" deja de admitir un stub;
  `getAllFichas()` SHALL parsear las fichas reales (frontmatter YAML + secciones `##`) y
  validar el núcleo del esquema, fallando el build ante fichas con núcleo incompleto.

## Impact

- **Sub-dominios:** `aves` (catálogo) y `foundation` (esquema de contenido, ADR, scripts).
- **Código:** nuevo `scripts/migrar-fauna.*`; `apps/catalogo/lib/content.ts` (stub → real);
  posible utilidad de validación reutilizable por el build.
- **Contenido:** `content/fauna/aves/<slug>/index.md` (×63) generadas; `content/fauna/_origen/`
  permanece como origen, no como fuente de verdad final.
- **Infra:** bucket GCS `catalogo-aves-chirimoyo` (prefijos `web/` público de lectura y
  `raw/` como archivo). Requiere **ADR** (rompe el aplazamiento de ADR-0003 §5).
- **Dependencias:** `Pillow` (optimización) y `google-cloud-storage` para el script Python.
  Sin nuevas dependencias de runtime en las apps.
- **Desbloquea:** #11 (listado), #12 (buscador), #13 (detalle), #14 (PDF).
