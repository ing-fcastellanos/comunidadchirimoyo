# migracion-fauna Specification

## Purpose
TBD - created by archiving change migrar-catalogo-aves. Update Purpose after archive.
## Requirements
### Requirement: Generación idempotente de fichas desde el CSV

El script de migración SHALL leer `content/fauna/_origen/aves-especies.csv` y generar,
por cada fila de especie, una ficha `content/fauna/aves/<slug>/index.md` conforme al
esquema congelado en #9 (ver `content/fauna/aves/_ejemplo.md`). El proceso SHALL ser
idempotente y reejecutable: si la carpeta de una especie ya existe, el script NO SHALL
sobrescribir su `index.md` salvo que se pase `--force`. Las especies cuya carpeta no
existe SHALL crearse en cada corrida, permitiendo ampliar el catálogo sin tocar las
fichas ya curadas a mano.

#### Scenario: Primera corrida genera todas las fichas
- **WHEN** se ejecuta el script con `content/fauna/aves/` vacío (solo `_ejemplo.md`)
- **THEN** se crea una carpeta `content/fauna/aves/<slug>/` con su `index.md` por cada fila del CSV

#### Scenario: Reejecución no pisa fichas existentes
- **WHEN** se vuelve a ejecutar el script tras editar a mano una ficha ya generada
- **THEN** esa ficha se conserva intacta y solo se crean las especies nuevas del CSV

#### Scenario: Regeneración explícita
- **WHEN** se ejecuta el script con `--force`
- **THEN** las fichas existentes se regeneran desde el CSV, descartando cambios manuales

### Requirement: Derivación de slug y estructura de carpetas

El script SHALL derivar el `slug` del nombre científico en kebab-case (minúsculas, sin
acentos, espacios → `-`; p. ej. *Ardea alba* → `ardea-alba`) y usarlo como nombre de la
carpeta de la especie. El `slug` SHALL ser único en el catálogo; ante una colisión, el
script SHALL fallar con un mensaje que identifique las especies en conflicto en lugar de
sobrescribir silenciosamente.

#### Scenario: Slug derivado del binomio
- **WHEN** la fila tiene `nombre_cientifico = "Ardea alba"`
- **THEN** la ficha se escribe en `content/fauna/aves/ardea-alba/index.md`

#### Scenario: Colisión de slug detenida
- **WHEN** dos filas producen el mismo slug
- **THEN** el script aborta e informa ambas especies en conflicto

### Requirement: Mapeo de campos CSV a la ficha

El script SHALL poblar el frontmatter y el cuerpo de cada ficha según el mapeo documentado
en `content/fauna/_origen/README.md`: taxonomía y los tres ejes de estatus al frontmatter
(normalizando los enums a los valores del esquema), la prosa a las secciones `##`
correspondientes, y `estatus_conservacion_detallado` parseado a `conservacion.nom059` +
`conservacion.iucn`. El script SHALL ignorar las columnas legacy redundantes
(`presencia`, `estado_conservacion`, `grado_observacion`) en favor de las canónicas.

#### Scenario: Parseo de conservación
- **WHEN** la celda dice "Sin categoría de riesgo (NOM-059); Preocupación Menor (UICN)"
- **THEN** el frontmatter resultante tiene `nom059: ninguno` e `iucn: LC`

#### Scenario: Prosa a secciones convenidas
- **WHEN** la fila trae `dieta_ecologia`, `reproduccion` y `distribucion`
- **THEN** el cuerpo Markdown contiene `## Dieta y ecología`, `## Reproducción` y `## Distribución` con ese texto

### Requirement: Pipeline de imágenes a Google Cloud Storage

El script SHALL emparejar cada especie con la carpeta del banco local cuyo nombre es el
nombre científico y, para cada foto, subir al bucket `catalogo-aves-chirimoyo` tres
variantes bajo la clave `<prefijo>/<slug>/<archivo>`: la imagen **cruda** en `raw/`
(archivo estático), una **optimizada ~1600 px WebP** en `web/` (detalle) y una **miniatura
~600 px WebP** en `thumb/` (cards). El frontmatter `fotos[]` SHALL referenciar las
variantes mediante un único nombre de archivo (la app compone la URL por prefijo según
contexto); la primera foto en orden alfabético (`_01`) SHALL ser la portada. El script
SHALL deduplicar por hash de contenido y SHALL ignorar carpetas que no correspondan a una
especie del CSV.

#### Scenario: Tres variantes en el bucket
- **WHEN** se procesa una foto de una especie
- **THEN** existe en el bucket un objeto bajo `raw/<slug>/` (original), uno bajo `web/<slug>/` (WebP ~1600 px) y uno bajo `thumb/<slug>/` (WebP ~600 px), todos con el mismo nombre de archivo

#### Scenario: Portada determinista
- **WHEN** una especie tiene varias fotos `<sci>_01`, `<sci>_02`, …
- **THEN** la primera entrada de `fotos[]` (la portada) corresponde a `_01`

#### Scenario: Deduplicación por contenido
- **WHEN** dos archivos de una especie tienen contenido idéntico
- **THEN** solo se sube y referencia uno

#### Scenario: Entrada heterogénea de formatos
- **WHEN** el banco trae `.jpg`, `.jpeg` y `.png`
- **THEN** todas se optimizan a WebP en `web/` y `thumb/`, y se conserva el original en `raw/`

### Requirement: Atribución completa de fotos desde el manifiesto

El script SHALL leer el manifiesto `creditos_imagenes.json` (indexado por la ruta `archivo`
de cada foto) para poblar la atribución de cada entrada de `fotos[]`, mapeando
`atribucion`→`credito`, `licencia`→`licencia`, la URL de la observación/foto→`creditoUrl`
y `licencia_url`→`licenciaUrl`. Para cumplir la atribución enlazable que exigen CC BY y
CC BY-SA, el esquema de `Foto` SHALL extenderse de forma **aditiva y opcional** con
`creditoUrl` y `licenciaUrl` (documentado en `content/README.md` y tipado en
`apps/catalogo/lib/content.ts`), sin romper las fichas existentes. Cuando una foto no
figure en el manifiesto, el script SHALL marcar su `credito` como pendiente y NO SHALL
inventar una atribución.

#### Scenario: Atribución enlazable desde el manifiesto
- **WHEN** el manifiesto asocia una foto con autor, licencia y URLs
- **THEN** su entrada `fotos[]` lleva `credito`, `licencia`, `creditoUrl` y `licenciaUrl`

#### Scenario: Compatibilidad del esquema extendido
- **WHEN** una ficha o `_ejemplo.md` no declara `creditoUrl`/`licenciaUrl`
- **THEN** sigue siendo válida (los campos son opcionales)

#### Scenario: Foto sin crédito conocido
- **WHEN** una foto no aparece en el manifiesto
- **THEN** su `credito` queda marcado como pendiente, sin atribución inventada

### Requirement: Validación del esquema con núcleo estricto

El script SHALL validar cada ficha generada contra el esquema de #9 aplicando la regla de
estrictez "núcleo estricto / resto tolerante": SHALL fallar (con la lista de especies y
campos faltantes) si falta cualquier campo del núcleo (`slug`, `nombreComun`,
`nombreCientifico`, los ejes de estatus, `categoria`, `orden`, `familia`, `conservacion`,
`fuentes`, al menos una foto y `## Descripción`); los campos opcionales/⊙ ausentes SHALL
tolerarse para mostrarse como "Información pendiente".

#### Scenario: Núcleo incompleto detiene la migración
- **WHEN** una fila carece de un campo del núcleo
- **THEN** el script reporta la especie y el campo faltante y termina con error

#### Scenario: Opcionales ausentes se toleran
- **WHEN** una ficha no tiene `habitat` ni `temporada`
- **THEN** la ficha se considera válida y esos campos quedan vacíos

### Requirement: Mapeo de los campos de búsqueda visual

El script de migración SHALL mapear las cinco columnas de búsqueda del CSV de origen al
frontmatter de la ficha: `forma`, `tamano` y `donde` como valores únicos; `colores` como
lista separando por `;`; y `featured` parseando el booleano (`true`/`false`). Cada valor
SHALL validarse contra el vocabulario cerrado del campo; un valor desconocido SHALL
reportarse como error de migración. Las columnas vacías SHALL omitirse en la ficha (campos
opcionales), sin invalidarla.

#### Scenario: Colores multivalor
- **WHEN** la celda `colores` contiene `Blanco; Gris`
- **THEN** la ficha resultante tiene `colores: [blanco, gris]`

#### Scenario: Booleano de destacada
- **WHEN** la celda `featured` contiene `true`
- **THEN** la ficha tiene `featured: true`

#### Scenario: Valor inválido detiene la migración
- **WHEN** una celda trae un valor fuera del vocabulario (p. ej. `forma: aguila`)
- **THEN** el script reporta la especie y el valor y termina con error

