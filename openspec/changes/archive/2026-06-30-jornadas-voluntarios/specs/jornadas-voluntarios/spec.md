## ADDED Requirements

### Requirement: Jornadas como contenido en repo

Las jornadas de voluntariado SHALL definirse como **contenido en el repositorio** (`content/jornadas/`), NO gestionarse ni persistirse en el API (ADR-0004, ADR-0006: el API permanece mínimo). El contenido SHALL distinguir jornadas **recurrentes** (con una regla de recurrencia) de **eventos puntuales** (con fecha). Cada jornada SHALL declarar al menos `titulo`, `tipo` (`limpieza` | `pajareada` | `evento`), `hora` y si admite `inscripcion`; PUEDE declarar `lugar` y `descripcion`. La recurrencia SHALL soportar al menos **semanal** (un día de la semana) y **mensual por ordinal** (p. ej. 1er y 3er sábado).

#### Scenario: El contenido define recurrentes y eventos
- **WHEN** se revisa `content/jornadas/`
- **THEN** existe una jornada de limpieza semanal, una pajareada por ordinal mensual y al menos un evento puntual, sin que ninguna viva en el API

#### Scenario: Editar una jornada es editar contenido
- **WHEN** se cambia una jornada (p. ej. su hora o su recurrencia) en el archivo de contenido y se reconstruye/revalida
- **THEN** el sitio refleja el cambio, sin tocar el backend

### Requirement: Expansión de recurrencia a próximas ocurrencias

El data-layer (`lib/jornadas.ts`) SHALL exponer las **próximas jornadas** expandiendo las reglas de recurrencia a sus ocurrencias reales relativas a la fecha actual, e intercalando los eventos puntuales futuros, ordenadas por fecha y hora ascendente, acotadas a una ventana/cantidad razonable. Las ocurrencias pasadas NO SHALL incluirse.

#### Scenario: Próximas ocurrencias ordenadas
- **WHEN** se solicitan las próximas jornadas en una fecha dada
- **THEN** se obtienen las siguientes fechas de las recurrentes (p. ej. los próximos jueves; el 1er/3er sábado venideros) y los eventos futuros, ordenadas y sin fechas pasadas

### Requirement: Sección "Próximas jornadas" en /voluntarios

`/voluntarios` SHALL mostrar una sección de **próximas jornadas** con una tarjeta por ocurrencia (tipo, fecha legible en español, hora y lugar). La página SHALL evitar congelar las fechas en build (p. ej. revalidación periódica), de modo que el listado avance con el tiempo. El enlace al calendario externo (Google Calendar) SHALL conservarse.

#### Scenario: Se muestran las próximas jornadas
- **WHEN** se abre `/voluntarios`
- **THEN** se muestran las próximas jornadas con su fecha y hora, además del enlace al calendario

#### Scenario: Las fechas avanzan con el tiempo
- **WHEN** pasa el tiempo y una jornada queda en el pasado
- **THEN** deja de aparecer en "próximas" sin necesidad de reconstruir manualmente (revalidación)
