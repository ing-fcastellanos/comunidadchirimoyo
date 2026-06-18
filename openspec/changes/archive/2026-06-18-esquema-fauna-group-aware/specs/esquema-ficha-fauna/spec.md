## MODIFIED Requirements

### Requirement: Formato y ubicación de la ficha de especie

Cada especie del catálogo SHALL guardarse como un archivo Markdown con frontmatter YAML en `content/fauna/<grupo>/<slug>/index.md`, donde `<grupo>` es `aves`, `anfibios` o `reptiles` (un grupo taxonómico por carpeta, ADR-0024) y `<slug>` es el identificador de la especie. El frontmatter YAML SHALL contener únicamente datos atómicos/estructurados; toda la prosa SHALL vivir en el cuerpo Markdown. NO SHALL existir un archivo monolítico con todas las especies ni un endpoint que las sirva (el catálogo es estático, ADR-0005).

#### Scenario: Una ficha por especie
- **WHEN** se añade la especie *Ardea alba*
- **THEN** existe `content/fauna/aves/ardea-alba/index.md` con frontmatter YAML y un cuerpo Markdown con las secciones narrativas

#### Scenario: La prosa vive en el cuerpo
- **WHEN** se lee una ficha
- **THEN** el texto narrativo está en el cuerpo Markdown (no en campos del frontmatter), y el frontmatter solo lleva datos estructurados

#### Scenario: Grupos separados de herpetofauna
- **WHEN** se añaden la rana *Lithobates berlandieri* y la tortuga *Trachemys venusta*
- **THEN** existen `content/fauna/anfibios/lithobates-berlandieri/index.md` y `content/fauna/reptiles/trachemys-venusta/index.md`, en grupos (carpetas) separados

### Requirement: Campos obligatorios de la ficha

El frontmatter de cada ficha SHALL incluir los campos obligatorios: `slug`, `grupo` (`aves` | `anfibios` | `reptiles`), `categoria` (sub-filtro cuyo vocabulario depende del grupo), `nombreComun`, `nombreCientifico`, `orden`, `familia`, `genero`, `estatusMigratorio` (`residente` | `migratoria-invierno` | `migratoria-verano` | `transitoria`), `gradoOcurrencia` (`comun` | `poco-comun` | `rara`), `estatusDistribucion` (`nativa` | `introducida`), `conservacion`, `fuentes` (≥1) y al menos una entrada en `fotos`. `grupo` es el filtro macro y modela la separación taxonómica (aves vs. anfibios vs. reptiles, ADR-0024). `categoria` es el sub-filtro y su vocabulario es **group-aware**: para `aves` es el gremio ecológico (`Vadeadoras`, `Nadadoras`, `Playeras`, `Voladoras`, `Rapaces y Carroñeras`, `Terrestres`); para `anfibios` es la clase (`Anuros`, `Salamandras`); para `reptiles` es la clase (`Lagartijas`, `Serpientes`, `Tortugas`). `estatusMigratorio` es el **eje de presencia** y para la herpetofauna toma el valor `residente` (no se renombra el campo).

#### Scenario: Ficha mínima válida
- **WHEN** una ficha declara todos los campos obligatorios, una fuente y una foto
- **THEN** es una ficha válida según el esquema

#### Scenario: Falta un campo obligatorio
- **WHEN** una ficha omite `nombreCientifico`, `genero`, `fuentes` o no tiene ninguna foto
- **THEN** es inválida según el esquema

#### Scenario: Valor fuera del enum
- **WHEN** `estatusMigratorio` toma un valor distinto de los permitidos
- **THEN** es inválida según el esquema

#### Scenario: Categoría según el grupo
- **WHEN** una ficha de `grupo: reptiles` declara `categoria: Tortugas` y una de `grupo: aves` declara `categoria: Vadeadoras`
- **THEN** ambas son válidas, y el sub-filtro presenta el vocabulario de categoría correspondiente a cada grupo

### Requirement: Campos opcionales descriptivos

El esquema SHALL admitir campos opcionales: `medidas` (objeto con `tamanoCm` y/o `pesoG` como rangos `[min, max]`, un `criterio` opcional que nombra la métrica de talla —p. ej. `"LHC (hocico-cloaca)"` para herpetofauna— y `notas`), `habitat` (arreglo de etiquetas de microhábitat dentro del humedal, de un vocabulario sugerido y extensible documentado en `content/README.md`), `temporada` (objeto con `meses`: arreglo de enteros 1–12 de avistamiento, y `notas`) y `simbologia` (código compacto de guía de campo, p. ej. `R-PC-SR-N`). Las etiquetas de `habitat` y los `meses` de `temporada` PUEDEN derivarse best-effort de la prosa de observación; la prosa autoritativa vive en la sección `Dónde y cuándo observarla`. Su ausencia NO SHALL invalidar la ficha.

#### Scenario: Ficha con campos opcionales
- **WHEN** una ficha declara `medidas`, `habitat` y `temporada`
- **THEN** es válida y esos campos están disponibles para filtros y presentación

#### Scenario: Medidas con criterio de talla
- **WHEN** una ficha de herpetofauna declara `medidas.criterio: "LHC (hocico-cloaca)"` con su rango `tamanoCm`
- **THEN** es válida y la ficha de detalle rotula la talla con ese criterio en vez de "envergadura"

#### Scenario: Ficha sin campos opcionales
- **WHEN** una ficha omite `medidas`, `habitat` y `temporada`
- **THEN** sigue siendo válida

#### Scenario: Meses de temporada acotados
- **WHEN** `temporada.meses` contiene un valor fuera del rango 1–12
- **THEN** es inválida según el esquema

### Requirement: Tipos del esquema en el loader del catálogo

`apps/catalogo/lib/content.ts` (reexportando desde `lib/fauna-schema.ts`) SHALL exportar los tipos TypeScript que reflejan este esquema (incluidos `genero`, `categoria`, `fuentes`, `simbologia`, `medidas`, `habitat`, `temporada`, `fotos` y `audios`). El tipo `Grupo` SHALL ser `"aves" | "anfibios" | "reptiles"` y el loader SHALL recorrer esos tres grupos (`GRUPOS`), tolerando los que aún no existan en disco. El tipo `Medidas` SHALL incluir el campo opcional `criterio?: string` de forma aditiva. El tipo `Audio` SHALL incluir los campos opcionales `creditoUrl`, `licenciaUrl`, `tipo` y `fuenteId`. Los cambios SHALL ser aditivos/no destructivos para las fichas de aves existentes, y el proyecto SHALL pasar `npm run typecheck` en `apps/catalogo`.

#### Scenario: Tipos completos disponibles
- **WHEN** un módulo importa `FichaEspecie` desde `lib/content.ts`
- **THEN** el tipo incluye los campos obligatorios (incl. `genero`, `fuentes`) y los opcionales (`medidas` con `criterio`, `habitat`, `temporada`, `simbologia`, `audios`) y `fotos` con su crédito

#### Scenario: Grupo con tres valores
- **WHEN** se inspecciona el tipo `Grupo` y la constante `GRUPOS` del loader
- **THEN** son `"aves" | "anfibios" | "reptiles"` y el loader lee `content/fauna/{aves,anfibios,reptiles}/`

#### Scenario: Typecheck pasa
- **WHEN** se ejecuta `npm run typecheck` en `apps/catalogo`
- **THEN** termina sin errores de tipo
