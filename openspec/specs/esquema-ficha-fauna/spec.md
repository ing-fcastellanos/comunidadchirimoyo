# esquema-ficha-fauna Specification

## Purpose
TBD - created by archiving change definir-esquema-ficha-fauna. Update Purpose after archive.
## Requirements
### Requirement: Formato y ubicación de la ficha de especie

Cada especie del catálogo SHALL guardarse como un archivo Markdown con frontmatter YAML en `content/fauna/<grupo>/<slug>/index.md`, donde `<grupo>` es `aves` o `anfibios-reptiles` y `<slug>` es el identificador de la especie. El frontmatter YAML SHALL contener únicamente datos atómicos/estructurados; toda la prosa SHALL vivir en el cuerpo Markdown. NO SHALL existir un archivo monolítico con todas las especies ni un endpoint que las sirva (el catálogo es estático, ADR-0005).

#### Scenario: Una ficha por especie
- **WHEN** se añade la especie *Ardea alba*
- **THEN** existe `content/fauna/aves/ardea-alba/index.md` con frontmatter YAML y un cuerpo Markdown con las secciones narrativas

#### Scenario: La prosa vive en el cuerpo
- **WHEN** se lee una ficha
- **THEN** el texto narrativo está en el cuerpo Markdown (no en campos del frontmatter), y el frontmatter solo lleva datos estructurados

### Requirement: Secciones narrativas del cuerpo

El cuerpo Markdown SHALL organizar la prosa bajo un conjunto convenido de encabezados de nivel 2 (`##`), presentes los que apliquen y en este orden: `Descripción`, `Dieta y ecología`, `Reproducción`, `Distribución`, `Cómo identificarla`, `Dónde y cuándo observarla`, `¿Sabías que?`. La sección `Descripción` SHALL estar siempre presente. El detalle de especie (#13) renderiza estas secciones conocidas en orden.

#### Scenario: Secciones convenidas
- **WHEN** se revisa el cuerpo de una ficha
- **THEN** la prosa está bajo encabezados `##` del conjunto convenido, con `## Descripción` presente

#### Scenario: Secciones opcionales ausentes
- **WHEN** una especie no tiene datos de reproducción
- **THEN** la ficha simplemente omite la sección `## Reproducción` sin invalidarse

### Requirement: Convención de slug

El `slug` de una especie SHALL derivarse de su nombre científico (binomio) normalizado a kebab-case: minúsculas, sin diacríticos, espacios convertidos a guiones (p. ej. `Ardea alba` → `ardea-alba`). El esquema SHALL permitir declarar un `slug` explícito en el frontmatter para sobreescribir el derivado en casos de colisión o renombre taxonómico. El `slug` SHALL ser único en todo el catálogo y SHALL coincidir con el nombre de la carpeta de la ficha.

#### Scenario: Slug derivado del nombre científico
- **WHEN** una ficha tiene `nombreCientifico: Ardea alba` y no declara `slug`
- **THEN** su identificador y carpeta son `ardea-alba`

#### Scenario: Override explícito
- **WHEN** una ficha declara `slug: garza-grande` en el frontmatter
- **THEN** ese valor prevalece sobre el derivado y debe coincidir con el nombre de su carpeta

#### Scenario: Unicidad
- **WHEN** dos fichas resolverían al mismo slug
- **THEN** se considera un error de contenido y al menos una debe declarar un `slug` explícito distinto

### Requirement: Campos obligatorios de la ficha

El frontmatter de cada ficha SHALL incluir los campos obligatorios: `slug`, `grupo` (`aves` | `anfibios-reptiles`), `categoria` (gremio ecológico, p. ej. `Vadeadoras`, `Nadadoras`, `Playeras`, `Voladoras`, `Rapaces y Carroñeras`, `Terrestres`), `nombreComun`, `nombreCientifico`, `orden`, `familia`, `genero`, `estatusMigratorio` (`residente` | `migratoria-invierno` | `migratoria-verano` | `transitoria`), `gradoOcurrencia` (`comun` | `poco-comun` | `rara`), `estatusDistribucion` (`nativa` | `introducida`), `conservacion`, `fuentes` (≥1) y al menos una entrada en `fotos`. `grupo` es el filtro macro (aves vs. anfibios/reptiles); `categoria` es un gremio ecológico para sub-filtrado. La distinción anfibios/reptiles de Fase 2 se modela vía `grupo`, no vía `categoria`.

#### Scenario: Ficha mínima válida
- **WHEN** una ficha declara todos los campos obligatorios, una fuente y una foto
- **THEN** es una ficha válida según el esquema

#### Scenario: Falta un campo obligatorio
- **WHEN** una ficha omite `nombreCientifico`, `genero`, `fuentes` o no tiene ninguna foto
- **THEN** es inválida según el esquema

#### Scenario: Valor fuera del enum
- **WHEN** `estatusMigratorio` toma un valor distinto de los permitidos
- **THEN** es inválida según el esquema

### Requirement: Conservación con NOM-059 e IUCN

El campo `conservacion` SHALL ser un objeto con `nom059` obligatorio (`pr` | `a` | `p` | `e` | `ninguno`, según la NOM-059-SEMARNAT) y campos opcionales `iucn` (código IUCN, p. ej. `LC`, `VU`) y `notas`. La NOM-059 es la referencia primaria por ser el estándar legal mexicano; IUCN es complementaria.

#### Scenario: Especie sin categoría de riesgo
- **WHEN** una especie no está en la NOM-059
- **THEN** `conservacion.nom059` es `ninguno` y `iucn` puede estar presente o ausente

#### Scenario: Especie protegida
- **WHEN** una especie está sujeta a protección especial
- **THEN** `conservacion.nom059` es `pr` y puede incluir `iucn` y `notas`

### Requirement: Campos opcionales descriptivos

El esquema SHALL admitir campos opcionales: `medidas` (objeto con `tamanoCm` y/o `pesoG` como rangos `[min, max]` y `notas`), `habitat` (arreglo de etiquetas de microhábitat dentro del humedal, de un vocabulario sugerido y extensible documentado en `content/README.md`), `temporada` (objeto con `meses`: arreglo de enteros 1–12 de avistamiento, y `notas`) y `simbologia` (código compacto de guía de campo, p. ej. `R-PC-SR-N`). Las etiquetas de `habitat` y los `meses` de `temporada` PUEDEN derivarse best-effort de la prosa de observación; la prosa autoritativa vive en la sección `Dónde y cuándo observarla`. Su ausencia NO SHALL invalidar la ficha.

#### Scenario: Ficha con campos opcionales
- **WHEN** una ficha declara `medidas`, `habitat` y `temporada`
- **THEN** es válida y esos campos están disponibles para filtros y presentación

#### Scenario: Ficha sin campos opcionales
- **WHEN** una ficha omite `medidas`, `habitat` y `temporada`
- **THEN** sigue siendo válida

#### Scenario: Meses de temporada acotados
- **WHEN** `temporada.meses` contiene un valor fuera del rango 1–12
- **THEN** es inválida según el esquema

### Requirement: Medios con crédito y licencia

El campo `fotos` SHALL ser un arreglo de objetos `{ archivo, credito, alt, licencia? }`, donde `archivo` es una ruta relativa a la carpeta de la ficha, `credito` y `alt` son obligatorios, y la primera entrada es la **portada**. La portada (`fotos[0]`) SHALL ser la **foto curada del catálogo**: la misma que la curaduría seleccionó para el PDF en `apps/catalogo/print/photo-selections.json`, emparejada por *stem* (nombre de archivo sin extensión, case-insensitive). Cuando exista una selección curada para la ficha, esa foto SHALL ocupar la primera posición de `fotos[]`; si no existe selección o no casa con ninguna entrada, la portada SHALL ser la primera foto disponible (fallback). El campo opcional `audios` SHALL ser un arreglo de objetos `{ archivo, credito, descripcion?, licencia?, creditoUrl?, licenciaUrl?, tipo?, fuenteId? }`, donde `archivo` es el nombre del archivo de audio en el bucket (la app compone la URL, como con las fotos), `tipo` ∈ `{ "canto", "llamado" }` y `fuenteId` es el identificador de la grabación en la fuente (p. ej. `XC123456`). Toda foto y audio SHALL declarar `credito`; el `alt` de cada foto existe por accesibilidad y queda aislado como string traducible (i18n-ready, ADR-0011). Los metadatos de procedencia de la cosecha de audio (calidad, país) NO SHALL formar parte del esquema de la ficha; viven solo en el CSV de origen.

#### Scenario: Foto con crédito y alt
- **WHEN** una ficha declara una foto
- **THEN** la foto incluye `archivo`, `credito` y `alt`; la primera foto es la portada

#### Scenario: La portada es la foto curada
- **WHEN** una ficha tiene una selección curada en `photo-selections.json` cuyo stem casa con una entrada de `fotos[]`
- **THEN** esa entrada es la primera de `fotos[]` (la portada), de modo que el sitio muestra la misma foto que el PDF

#### Scenario: Ficha sin selección curada
- **WHEN** una ficha no tiene selección curada (o la selección no casa con ninguna `fotos[]`)
- **THEN** la portada es la primera foto disponible, sin error

#### Scenario: Audio opcional con crédito
- **WHEN** una ficha incluye un audio
- **THEN** el audio declara `archivo` y `credito`

#### Scenario: Audio con atribución enlazable y tipo
- **WHEN** una ficha incluye un audio cosechado de xeno-canto
- **THEN** el audio puede declarar `creditoUrl` (página de la grabación), `licenciaUrl`, `tipo` (`canto`/`llamado`) y `fuenteId` (`XC…`), todos opcionales

#### Scenario: Metadatos de procedencia fuera del esquema
- **WHEN** la cosecha aporta calidad (A/B) o país de la grabación
- **THEN** esos datos NO aparecen en el frontmatter de la ficha (quedan solo en el CSV)

#### Scenario: Foto sin crédito
- **WHEN** una foto omite `credito` o `alt`
- **THEN** es inválida según el esquema

### Requirement: Tipos del esquema en el loader del catálogo

`apps/catalogo/lib/content.ts` SHALL exportar los tipos TypeScript que reflejan este esquema (incluidos `genero`, `categoria` como gremio, `fuentes`, `simbologia`, `medidas`, `habitat`, `temporada`, `fotos` y `audios`), extendiendo los tipos ya presentes en el stub sin cambiar la firma de `getAllFichas` (que permanece como stub hasta #10/#11). El tipo `Audio` SHALL incluir los campos opcionales `creditoUrl`, `licenciaUrl`, `tipo` y `fuenteId` de forma aditiva (sin romper fichas existentes). El proyecto SHALL pasar `npm run typecheck` en `apps/catalogo`.

#### Scenario: Tipos completos disponibles
- **WHEN** un módulo importa `FichaEspecie` desde `lib/content.ts`
- **THEN** el tipo incluye los campos obligatorios (incl. `genero`, `fuentes`) y los opcionales (`medidas`, `habitat`, `temporada`, `simbologia`, `audios`) y `fotos` con su crédito

#### Scenario: Tipo Audio extendido y compatible
- **WHEN** una ficha declara un audio con solo `archivo` y `credito`
- **THEN** es válida según el tipo `Audio` (los campos `creditoUrl`/`licenciaUrl`/`tipo`/`fuenteId` son opcionales)

#### Scenario: Typecheck pasa
- **WHEN** se ejecuta `npm run typecheck` en `apps/catalogo`
- **THEN** termina sin errores de tipo

### Requirement: Documentación del esquema y ficha de ejemplo

El esquema SHALL documentarse en `content/README.md` (campos, enums, formato, convención de slug y vocabulario sugerido de `habitat`) y SHALL acompañarse de una ficha de ejemplo en `content/fauna/aves/_ejemplo.md` que ilustre el frontmatter completo y el cuerpo en prosa. El ejemplo SHALL validar contra el esquema documentado.

#### Scenario: README describe el esquema
- **WHEN** un colaborador abre `content/README.md`
- **THEN** encuentra la lista de campos, sus tipos/enums, el formato de archivo y la convención de slug

#### Scenario: Ejemplo válido
- **WHEN** se revisa `content/fauna/aves/_ejemplo.md`
- **THEN** su frontmatter cumple el esquema y tiene un cuerpo Markdown descriptivo

### Requirement: Campos de búsqueda visual

El esquema de la ficha SHALL incluir cinco campos **opcionales** para la búsqueda por rasgos
visuales, con vocabularios cerrados:

- `forma`: uno de `pato` · `garza` · `gallineta` · `buceador` · `playera` · `rapaz` · `pajaro`.
- `tamano`: uno de `muy-chica` · `chica` · `mediana` · `grande` · `muy-grande`.
- `colores`: lista (≥1) de `blanco` · `negro` · `cafe` · `gris` · `azul` · `verde` ·
  `amarillo` · `rojo` · `naranja` · `iridiscente`.
- `donde`: uno de `nadando` · `orilla` · `volando` · `arbol` · `suelo` · `poste`.
- `featured`: booleano (especie destacada por el autor).

Por ser opcionales, una ficha sin ellos SHALL seguir siendo válida (núcleo intacto). Los
tipos correspondientes SHALL existir en `apps/catalogo/lib/content.ts` y los campos SHALL
estar documentados en `content/README.md` y en `content/fauna/aves/_ejemplo.md`.

#### Scenario: Ficha con campos de búsqueda
- **WHEN** una ficha declara `forma`, `tamano`, `colores`, `donde` y `featured`
- **THEN** el loader los expone tipados en `FichaEspecie` y la ficha es válida

#### Scenario: Campos ausentes tolerados
- **WHEN** una ficha no declara estos campos
- **THEN** sigue siendo válida y simplemente no participa de los filtros visuales

#### Scenario: Valor fuera del vocabulario
- **WHEN** un campo trae un valor fuera de su lista cerrada
- **THEN** se reporta como inválido (no se acepta silenciosamente)

### Requirement: Campos descriptivos de la ficha de detalle

El esquema de la ficha SHALL incluir cinco campos **opcionales** de texto para la ficha de
detalle: `autoridad` (autor y año del binomio, p. ej. `Rackett, 1813`), `otrosNombres`
(string[] de nombres comunes alternos), `envergadura` (string, p. ej. `95–115 cm`),
`mejorHora` (string, p. ej. `Amanecer y atardecer`) y `pullQuote` (cita destacada de la
descripción). Junto con los ya existentes
`medidas`, `habitat` y `temporada` (opcionales desde #9), alimentan el hero, los datos
rápidos y la observación. Por ser opcionales, una ficha sin ellos SHALL seguir siendo válida.
Los tipos SHALL existir en el esquema del loader y documentarse en `content/README.md` y
`content/fauna/aves/_ejemplo.md`.

#### Scenario: Ficha con datos de detalle
- **WHEN** una ficha declara `autoridad`, `otrosNombres`, `envergadura` y `mejorHora`
- **THEN** el loader los expone tipados y la ficha de detalle los muestra

#### Scenario: Datos de detalle ausentes
- **WHEN** una ficha no declara estos campos
- **THEN** sigue siendo válida y las partes correspondientes de la ficha se omiten

### Requirement: Distribución geográfica por zonas

El esquema de la ficha SHALL incluir un campo **opcional** `distribucion` de forma aditiva, con la forma `{ cria?: string[]; invernada?: string[]; residente?: string[]; notas?: string }`, donde cada lista de zona contiene códigos **ISO 3166-1 alpha-2** (compatibles con Natural Earth admin-0) y `notas` es un string traducible (i18n-ready, ADR-0011). El campo SHALL ser opcional: las fichas que no lo declaren SHALL seguir siendo válidas. Los metadatos de zona NO SHALL incluir geometría ni coordenadas; solo códigos de región. `apps/catalogo/lib/content.ts` SHALL exportar el tipo `Distribucion` y mapear el campo; el proyecto SHALL pasar `npm run typecheck`.

#### Scenario: Ficha con distribución curada
- **WHEN** una ficha declara `distribucion` con listas de códigos ISO por zona
- **THEN** es válida y el tipo `FichaEspecie` expone `distribucion`

#### Scenario: Distribución opcional
- **WHEN** una ficha no declara `distribucion`
- **THEN** sigue siendo válida según el esquema (el campo es opcional)

#### Scenario: Solo códigos de región, sin geometría
- **WHEN** una ficha declara una zona de `distribucion`
- **THEN** la zona es una lista de códigos ISO, sin coordenadas ni polígonos embebidos

