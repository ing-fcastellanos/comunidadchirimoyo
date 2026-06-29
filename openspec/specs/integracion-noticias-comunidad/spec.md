# integracion-noticias-comunidad Specification

## Purpose
TBD - created by archiving change integrar-noticias-comunidad. Update Purpose after archive.
## Requirements
### Requirement: Últimas noticias en la portada de comunidad

La página `/comunidad` SHALL mostrar un bloque de **últimas noticias** con las **notas más recientes** (máximo 3) obtenidas de `getAllNoticias()` —ordenadas por fecha desc, sin borradores en producción— usando la tarjeta de nota existente, y un enlace **"Ver todas"** a `/comunidad/noticias`. Cuando no haya notas publicadas, el bloque NO SHALL renderizarse (sin error ni hueco). El resto de la página (historia, misión) queda fuera de alcance.

#### Scenario: Portada muestra las últimas notas
- **WHEN** hay notas publicadas y se abre `/comunidad`
- **THEN** se muestra un bloque con hasta 3 notas recientes y un enlace a `/comunidad/noticias`

#### Scenario: Sin notas, sin bloque
- **WHEN** no hay notas publicadas
- **THEN** `/comunidad` no muestra el bloque de últimas noticias (sin error)

### Requirement: Enlace a noticias en la navegación

El sitio SHALL ofrecer un enlace a `/comunidad/noticias` en la **navegación del Header** (escritorio y móvil) y en el **Footer**.

#### Scenario: Enlace en el Header
- **WHEN** se observa la navegación del sitio (escritorio o móvil)
- **THEN** existe un enlace "Noticias" que lleva a `/comunidad/noticias`

#### Scenario: Enlace en el Footer
- **WHEN** se observa el Footer del sitio
- **THEN** existe un enlace que lleva a `/comunidad/noticias`

