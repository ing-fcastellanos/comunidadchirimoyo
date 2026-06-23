# migracion-fauna Specification

## Purpose
TBD - created by archiving change migrar-catalogo-aves. Update Purpose after archive.
## Requirements
### Requirement: Generación idempotente de fichas desde el CSV

El script de migración SHALL leer un CSV de origen (`--csv`, por defecto el de aves) y generar, por cada fila de especie, una ficha `content/fauna/<grupo>/<slug>/index.md` conforme al esquema group-aware (#87). El `<grupo>` SHALL determinarse **por fila** desde la columna `grupo` del CSV (`Anfibio`→`anfibios`, `Reptil`→`reptiles`); cuando la columna no exista (CSV de aves), el grupo SHALL ser `aves`. El proceso SHALL ser idempotente y reejecutable: si la carpeta de una especie ya existe, el script NO SHALL sobrescribir su `index.md` salvo que se pase `--force`. Las especies cuya carpeta no existe SHALL crearse en cada corrida.

#### Scenario: Primera corrida genera todas las fichas
- **WHEN** se ejecuta el script con el CSV de herpetofauna y `content/fauna/{anfibios,reptiles}/` vacíos
- **THEN** se crea una carpeta `content/fauna/<grupo>/<slug>/` con su `index.md` por cada fila del CSV, con `<grupo>` derivado de la columna `grupo`

#### Scenario: Ruteo por grupo de una fila
- **WHEN** una fila tiene `grupo = "Reptil"` y `nombre_cientifico = "Trachemys venusta"`
- **THEN** su ficha se escribe en `content/fauna/reptiles/trachemys-venusta/index.md` con `grupo: reptiles` en el frontmatter

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

El script SHALL poblar el frontmatter y el cuerpo de cada ficha según el mapeo documentado en `content/fauna/_origen/README.md`: taxonomía y los tres ejes de estatus al frontmatter (normalizando los enums a los valores del esquema), la prosa a las secciones `##` correspondientes, y `estatus_conservacion_detallado` parseado a `conservacion.nom059` + `conservacion.iucn`. El **eje de presencia** (`estatusMigratorio`) SHALL tomarse de la columna `estatus_migratorio` cuando exista (aves) o de `presencia` cuando no (herpetofauna residente). La `categoria` SHALL ser **group-aware**: para aves se conserva el gremio ecológico del CSV; para herpetofauna SHALL remapearse de la columna del CSV a la clase taxonómica (`Sapo`/`Rana`→`Anuros`, `Salamandra`→`Salamandras`, `Lagarto`→`Lagartijas`, `Serpiente`→`Serpientes`, `Tortuga`→`Tortugas`). El script SHALL ignorar las columnas legacy redundantes (`estado_conservacion`, `grado_observacion`, `actividad`) en favor de las canónicas.

#### Scenario: Presencia residente de herpetofauna
- **WHEN** una fila de herpetofauna trae `presencia = "Residente"` y no trae `estatus_migratorio`
- **THEN** el frontmatter resultante tiene `estatusMigratorio: residente`

#### Scenario: Remap de categoría por grupo
- **WHEN** una fila de `grupo: Anfibio` trae `categoria = "Sapo"` y otra de `grupo: Reptil` trae `categoria = "Tortuga"`
- **THEN** sus fichas tienen `categoria: "Anuros"` y `categoria: "Tortugas"` respectivamente

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

El script de migración SHALL mapear los campos de búsqueda visual del CSV de origen al frontmatter validando vocabularios cerrados: `tamano` como valor único; `colores` como lista separando por `;`; y `featured` parseando el booleano (`true`/`false`). Para **aves**, SHALL mapear además `forma` y `donde` (valores únicos). Para **herpetofauna**, `forma` y `donde` SHALL **omitirse** (su vocabulario cerrado está orientado a aves; decisión group-aware de #87), migrando solo `tamano`, `colores` y `featured`. Cada valor mapeado SHALL validarse contra el vocabulario cerrado del campo; un valor desconocido SHALL reportarse como error de migración. Las columnas vacías SHALL omitirse (campos opcionales), sin invalidar la ficha.

#### Scenario: Colores multivalor
- **WHEN** la celda `colores` contiene `cafe; gris; negro`
- **THEN** la ficha resultante tiene `colores: [cafe, gris, negro]`

#### Scenario: Herpetofauna omite forma y donde
- **WHEN** se migra una fila de herpetofauna con `forma = "sapo"` y `donde` con vocabulario no-aviar
- **THEN** la ficha NO incluye `forma` ni `donde`, y sí incluye `tamano` y `colores` si están presentes

#### Scenario: Valor inválido detiene la migración
- **WHEN** una celda mapeada trae un valor fuera del vocabulario (p. ej. `tamano: enorme`)
- **THEN** el script reporta la especie y el valor y termina con error

### Requirement: Mapeo de los campos de la ficha de detalle

El script de migración SHALL mapear las columnas Tier B del CSV de origen al frontmatter: `autoridad` y `mejorHora` como texto único; `otrosNombres` (columna `otros_nombres`) separando por `;`; `envergadura` (aves) como texto único; `medidas` desde `tamano_cm` (y `peso_g` opcional) como rango `[min, max]`, con `medidas.criterio` desde la columna `talla_criterio` cuando exista (p. ej. `"LHC (hocico-cloaca)"` en herpetofauna); `habitat` separando por `;`; `temporada` desde `temporada_meses` (lista 1–12, `;`) y `temporada_notas`; y `pullQuote` desde la columna `pull_quote`. Las columnas vacías o con marcador de faltante (`[dato faltante]`) SHALL omitirse en la ficha (campos opcionales), sin invalidarla.

#### Scenario: Rango de tamaño
- **WHEN** la celda `tamano_cm` contiene `10-17`
- **THEN** la ficha tiene `medidas.tamanoCm: [10, 17]`

#### Scenario: Criterio de talla de herpetofauna
- **WHEN** la fila trae `talla_criterio = "LHC (hocico-cloaca)"`
- **THEN** la ficha tiene `medidas.criterio: "LHC (hocico-cloaca)"`

#### Scenario: Columnas Tier B vacías
- **WHEN** una fila no trae los campos Tier B
- **THEN** la ficha se genera válida, simplemente sin esos campos

### Requirement: Mapeo de los campos de audio del CSV a la ficha

El script SHALL leer las columnas `sonido_*` del CSV de origen y, cuando exista una grabación para la especie, emitir un bloque `audios:` con un objeto mapeado así: `archivo` = nombre derivado de `sonido_id` **conservando la extensión real del audio derivada de `sonido_url`** (p. ej. `.mp3`, `.m4a` o `.mpga` para grabaciones de iNaturalist; `.mp3` para xeno-canto), `credito` = `sonido_autor`, `creditoUrl` = `sonido_pagina`, `licencia` = `sonido_licencia`, `licenciaUrl` = texto legal derivado del nombre de licencia, `tipo` = `sonido_tipo` (`canto`/`llamado`) y `fuenteId` = `sonido_id`. Las columnas `sonido_calidad` y `sonido_pais` NO SHALL escribirse en la ficha. Cuando falte autor o licencia, el script SHALL emitir lo disponible sin inventar atribución. Cuando no haya grabación, NO SHALL emitir el bloque `audios:`.

#### Scenario: Extensión de audio derivada de la URL
- **WHEN** una fila trae `sonido_url` que apunta a un archivo `.m4a` de iNaturalist
- **THEN** el `archivo` del bloque `audios:` conserva la extensión `.m4a` (no se asume `.mp3`)

#### Scenario: Bloque audios emitido desde el CSV
- **WHEN** una fila del CSV trae las columnas `sonido_*` pobladas
- **THEN** la ficha generada incluye `audios:` con `archivo`, `credito`, `creditoUrl`, `licencia`, `licenciaUrl`, `tipo` y `fuenteId`

#### Scenario: Especie sin grabación
- **WHEN** una fila no trae `sonido_url`/`sonido_id`
- **THEN** la ficha se genera sin bloque `audios:`

### Requirement: Pipeline de audio a Google Cloud Storage sin transcodificar

Con `--upload`, el script SHALL descargar cada grabación desde `sonido_url` y subirla **verbatim** (byte a byte, sin pasar por ningún codec, sin recortar ni normalizar) al bucket público `catalogo-aves-chirimoyo` bajo la clave `audio/<slug>/<archivo>`, y una copia cruda al bucket raw privado. El pipeline de audio NO SHALL compartir el procesamiento de imágenes (nada de Pillow/redimensionado). Esta restricción es **obligatoria** para respetar las grabaciones con licencia CC BY-NC-ND (sin derivados), que prohíben editar el audio. Si la descarga de una especie falla, el script SHALL reportarlo de forma visible por especie y NO SHALL inventar ni dejar a medias un objeto en el bucket.

#### Scenario: Audio subido sin modificar
- **WHEN** se procesa la grabación de una especie con `--upload`
- **THEN** existe en el bucket público un objeto bajo `audio/<slug>/<archivo>` byte-idéntico al descargado, y una copia en el bucket raw privado

#### Scenario: Sin transcodificación
- **WHEN** se sube cualquier grabación (incluidas las CC BY-NC-ND)
- **THEN** el archivo no se redimensiona, transcodifica ni recorta

#### Scenario: Descarga fallida visible
- **WHEN** la URL de origen de una especie no responde
- **THEN** el script reporta el fallo de esa especie sin abortar las demás ni subir un objeto parcial

### Requirement: URL de audio compuesta por la app

El esquema de `Audio` SHALL referenciar el audio mediante un único nombre de archivo en `archivo`; la app SHALL componer la URL pública con un helper `audioUrl(slug, archivo)` que usa el prefijo `audio/` y la base `NEXT_PUBLIC_FAUNA_CDN_BASE` (mismo mecanismo de portabilidad que las fotos, ADR-0016 / ADR-0017), de modo que migrar a un CDN/dominio propio no reescriba las fichas.

#### Scenario: URL por prefijo
- **WHEN** la app necesita la URL de un audio
- **THEN** la compone como `<CDN_BASE>/audio/<slug>/<archivo>` sin que la ficha guarde una URL absoluta

### Requirement: Política de licencias para fotos sembradas desde repositorios públicos

Cuando una especie no tiene fotos propias y se siembran desde repositorios públicos (p. ej. iNaturalist), las fotos incorporadas al catálogo SHALL tener licencia **CC0**, **CC BY** o **CC BY-SA** (reutilizables incluso para uso comercial). El proceso de siembra SHALL filtrar por esas licencias y por calidad de observación (`quality_grade=research`), y SHALL capturar por cada foto: autor/atribución, nombre de licencia, URL de la licencia y URL de la foto/observación de origen, que el script de migración mapea a los campos `credito`, `licencia`, `licenciaUrl` y `creditoUrl` de cada `Foto`. El catálogo NO SHALL incorporar fotos con "Todos los derechos reservados" ni licencias **ND** (sin derivados), pues el pipeline genera variantes derivadas (WebP `web`/`thumb`).

#### Scenario: Foto con licencia libre aceptada

- **WHEN** se siembra una foto de iNaturalist con `license_code` ∈ {cc0, cc-by, cc-by-sa} y `quality_grade=research`
- **THEN** la foto se descarga al banco y se registra en el manifiesto de créditos con autor, licencia, URL de licencia y URL de la observación

#### Scenario: Foto con licencia incompatible descartada

- **WHEN** una observación solo ofrece fotos con "Todos los derechos reservados" o licencia ND
- **THEN** esas fotos NO se incorporan al catálogo y la especie queda sin sembrar (o se siembra solo con las fotos de licencia aceptada disponibles)

#### Scenario: Atribución preservada en la ficha

- **WHEN** una foto sembrada llega a la ficha final
- **THEN** su bloque `fotos[]` conserva `credito`, `licencia`, `licenciaUrl` y `creditoUrl` apuntando al autor y a la página de origen

