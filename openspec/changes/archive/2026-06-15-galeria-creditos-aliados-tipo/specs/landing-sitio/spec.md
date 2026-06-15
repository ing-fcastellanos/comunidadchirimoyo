## ADDED Requirements

### Requirement: Tipo de aliado visible en la tarjeta

La tarjeta de cada proyecto aliado SHALL mostrar su **`tipo`** (p. ej. colectivo, ONG,
académico, gobierno, negocio, medio, independiente) como una insignia legible, además del
nombre, la descripción, el logo y el enlace, tanto en el preview del landing como en la
página `/aliados`. El `tipo` SHALL derivarse de `aliados.json`; si un aliado no tiene `tipo`
válido, la tarjeta NO SHALL mostrar una insignia vacía.

#### Scenario: La tarjeta muestra el tipo
- **WHEN** se renderiza una tarjeta de aliado cuyo `tipo` es, p. ej., "negocio"
- **THEN** se muestra una insignia con la etiqueta legible del tipo

#### Scenario: Aliado sin tipo
- **WHEN** un aliado no tiene un `tipo` válido
- **THEN** la tarjeta se renderiza sin insignia de tipo, sin romperse
