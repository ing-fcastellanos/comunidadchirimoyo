# esquema-ficha-fauna Specification

## Purpose
TBD - created by archiving change definir-esquema-ficha-fauna. Update Purpose after archive.
## Requirements
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

El frontmatter de cada ficha SHALL incluir los campos obligatorios: `slug`, `grupo` (`aves` | `anfibios` | `reptiles`), `categoria` (sub-filtro cuyo vocabulario depende del grupo), `nombreComun`, `nombreCientifico`, `orden`, `familia`, `genero`, `estatusMigratorio` (`residente` | `migratoria-invierno` | `migratoria-verano` | `transitoria`), `gradoOcurrencia` (`comun` | `poco-comun` | `rara`), `estatusDistribucion` (`nativa` | `introducida`), `conservacion`, `fuentes` (≥1) y al menos una entrada en `fotos`. `grupo` es el filtro macro y modela la separación taxonómica (aves vs. anfibios vs. reptiles, ADR-0024). `categoria` es el sub-filtro y su vocabulario es **group-aware**: para `aves` es el gremio ecológico (`Vadeadoras`, `Nadadoras`, `Playeras`, `Voladoras`, `Rapaces y Carroñeras`, `Terrestres`); para `anfibios` es la clase (`Anuros`, `Salamandras`); para `reptiles` es la clase (`Lagartijas`, `Serpientes`, `Tortugas`). `estatusMigratorio` es el **eje de presencia** y para la herpetofauna toma el valor `residente` (no se renombra el campo).

#### Scenario: Ficha mínima válida
- **WHEN** una ficha declara todos los campos obligatorios, una fuente y una foto
- **THEN** es una ficha válida según el esquema

#### Scenario: Grupo separa anfibios de reptiles
- **WHEN** una ficha declara `grupo: reptiles`
- **THEN** es válida y se ubica en `content/fauna/reptiles/<slug>/`, distinta de `grupo: anfibios`

#### Scenario: Falta un campo obligatorio
- **WHEN** una ficha omite `nombreCientifico`, `genero`, `fuentes` o no tiene ninguna foto
- **THEN** es inválida según el esquema

#### Scenario: Valor de grupo fuera del enum
- **WHEN** `grupo` toma un valor distinto de `aves` | `anfibios` | `reptiles` (p. ej. el antiguo `anfibios-reptiles`)
- **THEN** es inválida según el esquema

#### Scenario: Categoría según el grupo
- **WHEN** una ficha de `grupo: reptiles` declara `categoria: Tortugas` y una de `grupo: aves` declara `categoria: Vadeadoras`
- **THEN** ambas son válidas, y el sub-filtro presenta el vocabulario de categoría correspondiente a cada grupo

### Requirement: Conservación con NOM-059 e IUCN

El campo `conservacion` SHALL ser un objeto con `nom059` obligatorio (`pr` | `a` | `p` | `e` | `ninguno`, según la NOM-059-SEMARNAT) y campos opcionales `iucn` (código IUCN, p. ej. `LC`, `VU`) y `notas`. La NOM-059 es la referencia primaria por ser el estándar legal mexicano; IUCN es complementaria.

#### Scenario: Especie sin categoría de riesgo
- **WHEN** una especie no está en la NOM-059
- **THEN** `conservacion.nom059` es `ninguno` y `iucn` puede estar presente o ausente

#### Scenario: Especie protegida
- **WHEN** una especie está sujeta a protección especial
- **THEN** `conservacion.nom059` es `pr` y puede incluir `iucn` y `notas`

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

### Requirement: Validación ejecutable del esquema en todos los grupos

El proyecto SHALL proveer un comando de validación (`npm run validate:fichas` en `apps/catalogo`) que recorra **todos** los grupos del catálogo (`aves`, `anfibios`, `reptiles`) y, por cada ficha, **acumule y reporte** sus problemas en vez de abortar al primero. Cada problema SHALL tener una severidad `error` o `warning`. El comando SHALL imprimir un reporte agrupado por ficha (grupo/slug → campo → mensaje) y SHALL terminar con código de salida ≠ 0 si existe al menos un problema de severidad `error`; los `warning` SHALL informarse sin alterar el código de salida.

La lógica de validación SHALL vivir en un **único módulo puro server-only** (`apps/catalogo/lib/fauna-validate.ts`, sin `node:fs`/`node:path`), expuesto como `validarFicha(data, cuerpo, ctx): Problema[]`. Tanto el loader del catálogo (`apps/catalogo/lib/content.ts`) como el script de validación SHALL reusar esa misma función — el loader filtrando los problemas de severidad `error` y lanzando en build (back-compat), el script acumulando todos. NO SHALL existir una segunda lista de reglas de validación duplicada en el loader.

#### Scenario: Validación recorre los tres grupos
- **WHEN** se ejecuta `npm run validate:fichas`
- **THEN** se validan las fichas de `content/fauna/{aves,anfibios,reptiles}/` y se reporta un resumen por ficha

#### Scenario: Acumula problemas por ficha en vez de abortar
- **WHEN** una ficha tiene dos campos inválidos
- **THEN** el reporte lista ambos problemas para esa ficha (no se detiene en el primero)

#### Scenario: Errores rompen el comando
- **WHEN** al menos una ficha tiene un problema de severidad `error`
- **THEN** el comando termina con código de salida ≠ 0

#### Scenario: Solo warnings no rompen el comando
- **WHEN** las fichas únicamente tienen problemas de severidad `warning`
- **THEN** el comando reporta los warnings y termina con código de salida 0

#### Scenario: Una sola fuente de la lógica de validación
- **WHEN** se inspeccionan el loader y el script de validación
- **THEN** ambos invocan `validarFicha` de `lib/fauna-validate.ts` y no replican las reglas de validación

### Requirement: Cobertura de checks del validador

El validador SHALL clasificar como **`error`** (rompen CI) los siguientes incumplimientos:

- **Núcleo y `genero`:** ausencia de cualquier campo obligatorio del esquema (`slug`, `grupo`, `categoria`, `nombreComun`, `nombreCientifico`, `orden`, `familia`, `genero`, `estatusMigratorio`, `gradoOcurrencia`, `estatusDistribucion`, `conservacion.nom059`, `fuentes` con ≥1, `fotos` con ≥1) o ausencia de la sección `## Descripción`. En particular, `genero` SHALL validarse como obligatorio (sin sustituirse silenciosamente por cadena vacía).
- **Enums:** valor fuera de rango en `grupo` (`aves`|`anfibios`|`reptiles`), `estatusMigratorio`, `gradoOcurrencia`, `estatusDistribucion` y `conservacion.nom059`.
- **`categoria` group-aware:** `categoria` que no pertenezca al vocabulario del `grupo` de la ficha (aves → gremios ecológicos; anfibios → `Anuros`|`Salamandras`; reptiles → `Lagartijas`|`Serpientes`|`Tortugas`).
- **Medios:** alguna entrada de `fotos` sin `credito` o sin `alt`.
- **Slug:** `slug` duplicado en todo el catálogo, o `slug` que no coincide con el nombre de su carpeta.
- **Rangos y vocabularios cerrados:** `temporada.meses` con algún valor fuera de 1–12; o un valor fuera de su lista cerrada en `forma`, `tamano`, `colores` o `donde` cuando el campo esté presente.

El validador SHALL clasificar como **`warning`** (informan, no rompen CI): que la portada (`fotos[0]`) no coincida con la foto curada de la ficha en `apps/catalogo/print/photo-selections.json` cuando exista una selección curada (emparejada por *stem*, sin extensión, case-insensitive).

#### Scenario: Categoría ajena al grupo es error
- **WHEN** una ficha de `grupo: reptiles` declara `categoria: Vadeadoras`
- **THEN** el validador reporta un `error` de categoría para esa ficha

#### Scenario: genero ausente es error
- **WHEN** una ficha omite `genero`
- **THEN** el validador reporta un `error` (no se sustituye por cadena vacía)

#### Scenario: Foto sin crédito o alt es error
- **WHEN** una entrada de `fotos` carece de `credito` o de `alt`
- **THEN** el validador reporta un `error` de medios para esa ficha

#### Scenario: Slug duplicado o desalineado es error
- **WHEN** dos fichas resuelven al mismo `slug`, o el `slug` no coincide con el nombre de la carpeta
- **THEN** el validador reporta un `error` de slug

#### Scenario: Mes fuera de rango es error
- **WHEN** `temporada.meses` contiene un valor fuera de 1–12
- **THEN** el validador reporta un `error`

#### Scenario: Vocabulario visual fuera de lista es error
- **WHEN** una ficha declara `colores` con un valor fuera de la lista cerrada
- **THEN** el validador reporta un `error`

#### Scenario: Portada no curada es solo warning
- **WHEN** existe selección curada para la ficha en `photo-selections.json` y `fotos[0]` no casa con ella por *stem*
- **THEN** el validador reporta un `warning` (no rompe CI)

### Requirement: Integración del validador al CI y al deploy

El workflow `.github/workflows/ci-frontend.yml` SHALL ejecutar `npm run validate:fichas` como parte de los checks, restringido al slot `catalogo` de la matriz (no SHALL correr para `sitio`) y solo cuando la app exista en disco. Un problema de severidad `error` en cualquier ficha SHALL hacer fallar el check (ADR-0009: CI de checks, deploy manual). Además, el script `deploy_prod` de `apps/catalogo` SHALL ejecutar `npm run validate:fichas` antes de construir y desplegar, de modo que un deploy manual con fichas inválidas se aborte antes de publicar.

#### Scenario: CI valida las fichas en el slot catalogo
- **WHEN** corre CI Frontend para `apps/catalogo`
- **THEN** se ejecuta `npm run validate:fichas` y el job falla si alguna ficha tiene un `error`

#### Scenario: CI no valida fichas en el slot sitio
- **WHEN** corre CI Frontend para `apps/sitio`
- **THEN** no se ejecuta el validador de fichas

#### Scenario: deploy_prod aborta con fichas inválidas
- **WHEN** se ejecuta `npm run deploy_prod` y alguna ficha tiene un problema de severidad `error`
- **THEN** el validador termina con código ≠ 0 y la cadena de deploy se detiene antes de construir/publicar

