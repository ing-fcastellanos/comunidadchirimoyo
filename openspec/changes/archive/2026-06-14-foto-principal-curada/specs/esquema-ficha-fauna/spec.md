## MODIFIED Requirements

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
