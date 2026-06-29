# pagina-comunidad Specification

## Purpose
TBD - created by archiving change reorganizar-comunidad. Update Purpose after archive.
## Requirements
### Requirement: Composición de la página de comunidad

La página `/comunidad` SHALL ser un Server Component estático (sin API) que, además de su intro y del bloque de últimas noticias (capacidad `integracion-noticias-comunidad`), SHALL incluir, en orden: la sección **"El caso"** (la misma que el landing, derivada de `lucha.md`), **"Qué hacemos"** (actividades) y la **"Línea de tiempo de logros"**. Todo el contenido SHALL derivarse de `content/` en build (`getLucha`, `getActividades`, `getLogros`), sin hardcodearse.

#### Scenario: La comunidad muestra caso, actividades y logros
- **WHEN** se abre `/comunidad`
- **THEN** se muestran la sección "El caso", "Qué hacemos" (tarjetas de `actividades.json`) y la línea de tiempo (hitos de `logros.json`), además del intro y las últimas noticias

#### Scenario: "El caso" coincide con el del landing
- **WHEN** se compara la sección "El caso" de `/comunidad` con la del landing
- **THEN** ambas derivan de `lucha.md` (mismo contenido), de forma intencional

### Requirement: Sección "Qué hacemos" en comunidad

`/comunidad` SHALL incluir una sección con las actividades de la comunidad, una tarjeta por cada entrada de `actividades.json`, mostrando su título, descripción e icono (resuelto por nombre desde el set de `Icon`). El número y contenido de tarjetas SHALL derivarse de `actividades.json`, no hardcodearse.

#### Scenario: Tarjetas derivadas de actividades.json
- **WHEN** se agrega o quita una actividad en `actividades.json` y se reconstruye
- **THEN** la sección de `/comunidad` refleja el cambio sin editar el componente

### Requirement: Línea de tiempo de logros en comunidad

`/comunidad` SHALL incluir una sección de **línea de tiempo** que muestre los hitos de `logros.json` en orden cronológico, cada uno con su fecha (`YYYY-MM[-DD]`), título y descripción, y una foto opcional. El componente SHALL tolerar entradas marcadas como `PLACEHOLDER` y campos `foto: null` sin romper el render.

#### Scenario: Línea de tiempo tolerante a placeholders
- **WHEN** se renderiza la línea de tiempo con hitos `PLACEHOLDER` o `foto: null`
- **THEN** se renderiza sin error y sin mostrar una imagen rota

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

