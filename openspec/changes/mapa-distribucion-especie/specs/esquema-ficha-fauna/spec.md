## ADDED Requirements

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
