## MODIFIED Requirements

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
