## ADDED Requirements

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
