## RENAMED Requirements

- FROM: `### Requirement: Jornadas como contenido en repo`
- TO: `### Requirement: Jornadas dinámicas en Firestore`

## MODIFIED Requirements

### Requirement: Jornadas dinámicas en Firestore

Las jornadas de voluntariado SHALL tener su **fuente de verdad en Firestore** (colección `jornadas`, ver `contenido-dinamico`), leída **server-side en runtime** por el sitio y editable desde el panel admin. NO SHALL gestionarse ni persistirse en el **API Flask** (ADR-0006: el API permanece mínimo; el acceso es vía Admin SDK server-side). `content/jornadas/` SHALL conservarse **solo como fixture de seed/dev** (poblar el emulator y la migración one-shot a producción), no como la fuente viva. El modelo SHALL distinguir jornadas **recurrentes** (con una regla de recurrencia) de **eventos puntuales** (con fecha). Cada jornada SHALL declarar al menos `titulo`, `tipo` (`limpieza` | `pajareada` | `evento`), `hora` y si admite `inscripcion`; PUEDE declarar `lugar` y `descripcion`. La recurrencia SHALL soportar al menos **semanal** (un día de la semana) y **mensual por ordinal** (p. ej. 1er y 3er sábado).

#### Scenario: Firestore define recurrentes y eventos
- **WHEN** se consulta la colección `jornadas`
- **THEN** existen jornadas recurrentes (con `recurrencia`) y eventos puntuales (con `fecha`), distinguidos por `kind`, sin que ninguna viva en el API Flask

#### Scenario: Editar una jornada es editar Firestore
- **WHEN** se cambia una jornada (p. ej. su hora o su recurrencia) desde el admin y se revalida
- **THEN** el sitio refleja el cambio sin re-desplegar y sin tocar el backend Flask

### Requirement: Sección "Próximas jornadas" en /voluntarios

`/voluntarios` SHALL mostrar una sección de **próximas jornadas** con una tarjeta por ocurrencia (tipo, fecha legible en español, hora y lugar), leyendo las jornadas de Firestore en **runtime**. La página SHALL renderizarse **dinámicamente** (sin congelar las fechas ni pre-generarse en build): `next build` MUST NOT acceder a Firestore, y el listado avanza con el tiempo (las ocurrencias se recalculan relativas a la fecha actual). El enlace al calendario externo (Google Calendar) SHALL conservarse.

#### Scenario: Se muestran las próximas jornadas
- **WHEN** se abre `/voluntarios`
- **THEN** se muestran las próximas jornadas con su fecha y hora, además del enlace al calendario

#### Scenario: Las fechas avanzan con el tiempo
- **WHEN** pasa el tiempo y una jornada queda en el pasado
- **THEN** deja de aparecer en "próximas" sin necesidad de reconstruir manualmente

#### Scenario: El build no accede a Firestore
- **WHEN** se ejecuta `next build` sin credenciales de Firestore
- **THEN** el build completa sin errores y `/voluntarios` se sirve dinámicamente en runtime
