# content/jornadas/

> **⚠️ En migración a Firestore (Fase 6, [ADR-0028](../../docs/decisions/0028-noticias-jornadas-dinamicas-firestore.md)).** La fuente de verdad de las jornadas pasa a ser la colección `jornadas` de Firestore, editable desde el panel admin. Este `jornadas.json` ya se sembró en Firestore (issue #135) y se conserva **solo** mientras el sitio siga leyéndolo; se elimina junto con `lib/jornadas.ts` en el cutover a los db-readers (issues #136/#137). No edites aquí esperando que el cambio persista tras la migración.

Jornadas de voluntariado del humedal. Contenido originalmente en repo (ADR-0004); el sitio (`/voluntarios`) expande la recurrencia a las **próximas fechas** y las muestra. El loader histórico vive en [`apps/sitio/lib/jornadas.ts`](../../apps/sitio/lib/jornadas.ts); el lector de Firestore, en [`lib/jornadas-db.ts`](../../apps/sitio/lib/jornadas-db.ts).

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
