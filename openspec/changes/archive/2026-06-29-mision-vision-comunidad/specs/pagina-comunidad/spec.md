## ADDED Requirements

### Requirement: Sección Misión y Visión en comunidad

`/comunidad` SHALL incluir una sección **"Misión y visión"**, ubicada entre "El caso" y "Qué hacemos", derivada de un archivo de contenido curado (`mision-vision.json`) vía su loader. La sección SHALL mostrar la **misión** y la **visión** (título + texto cada una) y, si el contenido provee **valores**, una lista de valores (título, descripción e icono). El componente SHALL tolerar la ausencia de `valores` sin romper el layout. El contenido SHALL derivarse de `content/`, no hardcodearse; PUEDE arrancar como **placeholder** hasta que la comunidad redacte el texto definitivo.

#### Scenario: La comunidad muestra misión y visión
- **WHEN** se abre `/comunidad`
- **THEN** se muestra la sección "Misión y visión" con el texto de misión y visión del contenido, entre "El caso" y "Qué hacemos"

#### Scenario: Valores opcionales
- **WHEN** el contenido de misión/visión no incluye `valores` (o está vacío)
- **THEN** la sección se renderiza con misión y visión, sin la fila de valores y sin error

#### Scenario: Contenido derivado del archivo
- **WHEN** se edita `mision-vision.json` (p. ej. se redacta el texto real) y se reconstruye
- **THEN** la sección refleja el cambio sin editar el componente
