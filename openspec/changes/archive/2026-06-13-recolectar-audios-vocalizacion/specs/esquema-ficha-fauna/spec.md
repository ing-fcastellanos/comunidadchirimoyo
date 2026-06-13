## MODIFIED Requirements

### Requirement: Medios con crédito y licencia

El campo `fotos` SHALL ser un arreglo de objetos `{ archivo, credito, alt, licencia? }`, donde `archivo` es una ruta relativa a la carpeta de la ficha, `credito` y `alt` son obligatorios, y la primera entrada es la portada. El campo opcional `audios` SHALL ser un arreglo de objetos `{ archivo, credito, descripcion?, licencia?, creditoUrl?, licenciaUrl?, tipo?, fuenteId? }`, donde `archivo` es el nombre del archivo de audio en el bucket (la app compone la URL, como con las fotos), `tipo` ∈ `{ "canto", "llamado" }` y `fuenteId` es el identificador de la grabación en la fuente (p. ej. `XC123456`). Toda foto y audio SHALL declarar `credito`; el `alt` de cada foto existe por accesibilidad y queda aislado como string traducible (i18n-ready, ADR-0011). Los metadatos de procedencia de la cosecha de audio (calidad, país) NO SHALL formar parte del esquema de la ficha; viven solo en el CSV de origen.

#### Scenario: Foto con crédito y alt
- **WHEN** una ficha declara una foto
- **THEN** la foto incluye `archivo`, `credito` y `alt`; la primera foto es la portada

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
