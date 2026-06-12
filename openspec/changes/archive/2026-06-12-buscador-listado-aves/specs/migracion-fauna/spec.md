## ADDED Requirements

### Requirement: Mapeo de los campos de búsqueda visual

El script de migración SHALL mapear las cinco columnas de búsqueda del CSV de origen al
frontmatter de la ficha: `forma`, `tamano` y `donde` como valores únicos; `colores` como
lista separando por `;`; y `featured` parseando el booleano (`true`/`false`). Cada valor
SHALL validarse contra el vocabulario cerrado del campo; un valor desconocido SHALL
reportarse como error de migración. Las columnas vacías SHALL omitirse en la ficha (campos
opcionales), sin invalidarla.

#### Scenario: Colores multivalor
- **WHEN** la celda `colores` contiene `Blanco; Gris`
- **THEN** la ficha resultante tiene `colores: [blanco, gris]`

#### Scenario: Booleano de destacada
- **WHEN** la celda `featured` contiene `true`
- **THEN** la ficha tiene `featured: true`

#### Scenario: Valor inválido detiene la migración
- **WHEN** una celda trae un valor fuera del vocabulario (p. ej. `forma: aguila`)
- **THEN** el script reporta la especie y el valor y termina con error
