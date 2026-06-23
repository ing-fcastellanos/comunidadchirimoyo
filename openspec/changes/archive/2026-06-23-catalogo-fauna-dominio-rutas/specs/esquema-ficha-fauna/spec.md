## MODIFIED Requirements

### Requirement: Formato y ubicación de la ficha de especie

Cada especie del catálogo SHALL guardarse como un archivo Markdown con frontmatter YAML en `content/fauna/<grupo>/<slug>/index.md`, donde `<grupo>` es `aves`, `anfibios` o `reptiles` y `<slug>` es el identificador de la especie. El frontmatter YAML SHALL contener únicamente datos atómicos/estructurados; toda la prosa SHALL vivir en el cuerpo Markdown. NO SHALL existir un archivo monolítico con todas las especies ni un endpoint que las sirva (el catálogo es estático, ADR-0005).

#### Scenario: Una ficha por especie
- **WHEN** se añade la especie *Ardea alba*
- **THEN** existe `content/fauna/aves/ardea-alba/index.md` con frontmatter YAML y un cuerpo Markdown con las secciones narrativas

#### Scenario: La prosa vive en el cuerpo
- **WHEN** se lee una ficha
- **THEN** el texto narrativo está en el cuerpo Markdown (no en campos del frontmatter), y el frontmatter solo lleva datos estructurados

### Requirement: Campos obligatorios de la ficha

El frontmatter de cada ficha SHALL incluir los campos obligatorios: `slug`, `grupo` (`aves` | `anfibios` | `reptiles`), `categoria` (gremio ecológico, p. ej. `Vadeadoras`, `Nadadoras`, `Playeras`, `Voladoras`, `Rapaces y Carroñeras`, `Terrestres`), `nombreComun`, `nombreCientifico`, `orden`, `familia`, `genero`, `estatusMigratorio` (`residente` | `migratoria-invierno` | `migratoria-verano` | `transitoria`), `gradoOcurrencia` (`comun` | `poco-comun` | `rara`), `estatusDistribucion` (`nativa` | `introducida`), `conservacion`, `fuentes` (≥1) y al menos una entrada en `fotos`. `grupo` es el filtro macro y la sección de IA por path: **anfibios y reptiles son grupos separados** (un grupo = un path), no un único `anfibios-reptiles`. `categoria` es un gremio ecológico para sub-filtrado. La generalización de los campos por grupo (presencia residente, criterio de talla, sonido, etc.) es trabajo posterior (#88); aquí solo cambia el enum de `grupo`.

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

### Requirement: Tipos del esquema en el loader del catálogo

`apps/catalogo/lib/content.ts` (y el módulo puro `lib/fauna-schema.ts`) SHALL exportar los tipos TypeScript que reflejan este esquema (incluidos `genero`, `categoria` como gremio, `fuentes`, `simbologia`, `medidas`, `habitat`, `temporada`, `fotos` y `audios`). El tipo `Grupo` SHALL ser `"aves" | "anfibios" | "reptiles"` y el descubrimiento de carpetas del loader (`GRUPOS`) SHALL recorrer esos tres grupos, tolerando los grupos cuya carpeta aún no exista (sin romper el build). El tipo `Audio` SHALL incluir los campos opcionales `creditoUrl`, `licenciaUrl`, `tipo` y `fuenteId` de forma aditiva. El proyecto SHALL pasar `npm run typecheck` en `apps/catalogo`.

#### Scenario: Tipo Grupo con tres grupos
- **WHEN** un módulo importa `Grupo` desde `lib/fauna-schema.ts`
- **THEN** el tipo admite `"aves"`, `"anfibios"` y `"reptiles"` (no `"anfibios-reptiles"`)

#### Scenario: Loader tolera grupos sin contenido
- **WHEN** se ejecuta `getAllFichas()` con `content/fauna/aves/` presente pero sin carpetas de `anfibios`/`reptiles`
- **THEN** devuelve las fichas de aves sin error, ignorando los grupos sin carpeta

#### Scenario: Typecheck pasa
- **WHEN** se ejecuta `npm run typecheck` en `apps/catalogo`
- **THEN** termina sin errores de tipo
