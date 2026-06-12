## ADDED Requirements

### Requirement: Mapeo de los campos de la ficha de detalle

El script de migración SHALL mapear las columnas Tier B del CSV de origen al frontmatter:
`autoridad`, `envergadura` y `mejorHora` como texto único; `otrosNombres` (columna
`otros_nombres`) separando por `;`; `medidas` desde `tamano_cm` (y `peso_g` opcional) como
rango `[min, max]`; `habitat` separando por `;`; y `temporada` desde `temporada_meses`
(lista 1–12, `;`) y `temporada_notas`; y `pullQuote` desde la columna `pull_quote`. Las
columnas vacías o con marcador de faltante (`[dato faltante]`) SHALL omitirse en la ficha
(campos opcionales), sin invalidarla.

#### Scenario: Otros nombres multivalor
- **WHEN** la celda `otros_nombres` contiene `Avetoro Lentiginoso; Avetoro Americano`
- **THEN** la ficha tiene `otrosNombres: [Avetoro Lentiginoso, Avetoro Americano]`

#### Scenario: Rango de tamaño
- **WHEN** la celda `tamano_cm` contiene `59-70`
- **THEN** la ficha tiene `medidas.tamanoCm: [59, 70]`

#### Scenario: Columnas Tier B vacías
- **WHEN** una fila no trae los campos Tier B
- **THEN** la ficha se genera válida, simplemente sin esos campos
