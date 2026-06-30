# content/jornadas/

Jornadas de voluntariado del humedal. **Contenido en repo** (ADR-0004) — **no** se gestionan en el API (ADR-0006, que se queda mínimo). El sitio (`/voluntarios`) expande la recurrencia a las **próximas fechas** y las muestra; el loader vive en [`apps/sitio/lib/jornadas.ts`](../../apps/sitio/lib/jornadas.ts).

> Editar una jornada = editar este JSON (git/PR). Las recurrentes cambian rara vez: defines la regla una vez.

## `jornadas.json`

Dos listas:

### `recurrentes[]` — jornadas con regla de recurrencia

| Campo | Tipo | Nota |
|---|---|---|
| `slug` | string | identificador kebab-case |
| `titulo` | string | |
| `tipo` | `limpieza` \| `pajareada` \| `evento` | usado para la etiqueta/badge |
| `hora` | string | `HH:MM` 24h |
| `lugar` | string | punto de encuentro |
| `inscripcion` | bool | si admite inscripción por el formulario |
| `descripcion` | string? | opcional |
| `recurrencia` | objeto | la regla (abajo) |

**Reglas de `recurrencia`:**
- `{ "tipo": "semanal", "dia": "jueves" }` — cada semana ese día.
- `{ "tipo": "mensual-ordinal", "dia": "sabado", "ordinales": [1, 3] }` — el 1er y 3er sábado de cada mes.

`dia` en español en minúsculas: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado`, `domingo`. `ordinales`: posiciones del día en el mes (`1`=primer, `2`=segundo, …).

### `eventos[]` — jornadas puntuales

Mismos campos que `recurrentes`, pero con **`fecha`** (`YYYY-MM-DD`) en vez de `recurrencia`.

```jsonc
{ "slug": "...", "titulo": "...", "tipo": "evento",
  "fecha": "2026-07-11", "hora": "10:00", "lugar": "...", "inscripcion": true }
```

> El evento **"Chirimoyo Itinerante"** (2026-07-11) está como **placeholder**: completar hora, lugar y descripción.
