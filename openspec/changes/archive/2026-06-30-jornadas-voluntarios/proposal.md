## Why

`/voluntarios` ya tiene el formulario de inscripción (#22a) y un enlace al Google Calendar, pero no muestra **cuándo** son las jornadas. La comunidad tiene jornadas **recurrentes** (limpieza los jueves, pajareadas 1er/3er sábado) y eventos puntuales. Este cambio (#22b, cierra la épica #22) añade un listado de **próximas jornadas** derivado de contenido en el repo, y conecta el campo `jornada` del formulario a esas fechas. **Decisión clave:** las jornadas son **contenido** (ADR-0004), no se gestionan en el API — el API se queda **mínimo** (ADR-0006); meter CRUD de jornadas exigiría un ADR nuevo y rompería esa convención. Las jornadas recurrentes cambian rara vez, así que el contenido-en-repo (defines la regla una vez) es de bajo mantenimiento.

## What Changes

- **Nuevo contenido** `content/jornadas/jornadas.json`: `recurrentes` (reglas de recurrencia) + `eventos` (puntuales). Sembrado con: **Jornada de limpieza** (semanal, jueves 16:30); **Pajareada** (mensual-ordinal, 1er y 3er sábado, 10:00); evento puntual **"Chirimoyo Itinerante"** (2026-07-11, resto placeholder). Campos: `slug`, `titulo`, `tipo` (`limpieza|pajareada|evento`), `hora`, `lugar`, `descripcion?`, `inscripcion` (bool, default `true`), y `recurrencia` (`{ tipo: "semanal", dia }` | `{ tipo: "mensual-ordinal", dia, ordinales[] }`) **o** `fecha` (one-off).
- **Loader** `lib/jornadas.ts`: tipos + `getJornadas()` + helper que **expande la recurrencia a las próximas N ocurrencias** relativas a hoy e intercala los eventos puntuales, ordenadas por fecha/hora.
- **Sección "Próximas jornadas"** en `/voluntarios`: tarjetas con tipo, fecha (formateada es-MX), hora y lugar. La página se marca con **`revalidate` diario** para que las fechas no se congelen en build.
- **Conectar el formulario** (#22a): el campo `jornada` pasa de texto libre a un **`<select>`** de las próximas jornadas (con opción "otra / disponibilidad general"); el API #21 lo sigue recibiendo como **string**. `InscripcionForm` recibe opciones opcionales y **degrada a texto** si no hay.
- **Documentar** el esquema (recurrencia incluida) en `content/jornadas/README.md`.
- El **Google Calendar** (`enlaces.json`) se conserva como el calendario detallado; el sitio resalta las próximas.

## No-goals

- **No** se gestiona ni persiste jornadas en el **API** (ADR-0004/0006): son contenido en repo.
- **No** se construye un calendario interactivo propio (el de Google ya existe); solo el listado de próximas.
- **No** se redactan los detalles finales del evento "Chirimoyo Itinerante" (placeholder; el usuario los completa) ni se afinan textos/lugares definitivos.
- **No** se toca el backend (#21) ni el contrato del endpoint.
- **No** se añade dependencia ni v0.dev.

## Capabilities

### New Capabilities
- `jornadas-voluntarios`: jornadas de voluntariado como contenido en repo (`content/jornadas/`) con recurrencia, su loader que expande a próximas ocurrencias, y la sección "Próximas jornadas" en `/voluntarios`.

### Modified Capabilities
- `inscripcion-voluntarios-frontend`: el campo `jornada` del formulario pasa de texto libre a **selección** de las próximas jornadas (degrada a texto si no hay opciones).

## Impact

- **Sub-dominio afectado:** voluntarios (`apps/sitio`).
- **Código (`apps/sitio`):** `lib/jornadas.ts` (loader + expansión de recurrencia), `app/voluntarios/page.tsx` (sección + `revalidate` + pasar opciones al form), `components/voluntarios/InscripcionForm.tsx` (campo `jornada` como select), posible `components/voluntarios/ProximasJornadas.tsx`.
- **Contenido:** nuevo `content/jornadas/jornadas.json` (+ README).
- **Dependencias:** ninguna (cálculo de fechas con `Date`/`Intl` nativos).
- **Sin** cambios en API/esquema → **no requiere ADR** (refuerza ADR-0004/0006: jornadas = contenido).
