## Context

`/voluntarios` es la última superficie del sitio que lee contenido de archivos en build: `getJornadas()` (de `content/jornadas/jornadas.json`) → `proximasJornadas()` expande la recurrencia → alimenta la sección "próximas jornadas" y el `select` del formulario de inscripción. Ya usa `export const revalidate = 86400` (las próximas son relativas a "hoy"). #134 dejó `getJornadasDb` (misma forma `{ recurrentes, eventos }`) y #135 sembró la colección `jornadas`. Este cambio (#137) hace la lectura dinámica, cerrando la migración de lectura del sitio (gemelo de #136).

## Goals / Non-Goals

**Goals:**
- `/voluntarios` lee jornadas de Firestore server-side en runtime; el build no toca Firestore.
- Reusar la expansión de recurrencia (`proximasJornadas`) sin cambios.
- Revalidación on-demand cubriendo jornadas (y noticias) desde un solo endpoint.
- Cerrar el "cutover" **sin borrar** nada: `content/` + loaders `fs` + seed quedan como fixtures/tooling.

**Non-Goals:**
- Borrar `content/`/loaders/seed; tocar la lógica de recurrencia; construir el admin; tocar el API Flask o las reglas `deny-all`; cambiar el esquema o el layout.

## Decisions

- **D1 — Swap mecánico + `force-dynamic`.** `getJornadas → getJornadasCached` (nuevo `lib/jornadas-cache.ts`, espejo de `noticias-cache.ts`, tag `jornadas`). Se reemplaza `revalidate = 86400` por `force-dynamic`: mismo invariante que #136 (`revalidate` pre-renderiza en build → tocaría Firestore; `force-dynamic` no). Beneficio extra: `proximasJornadas` recalcula "hoy" por request (más preciso que el cache diario). El dato va cacheado por `unstable_cache`+tag; la página re-renderiza barato.

- **D2 — Cutover = fixtures, no borrado (decisión A).** `content/noticias/`, `content/jornadas/` y los loaders `fs` (`lib/noticias.ts`, `lib/jornadas.ts`) **se conservan** como fixtures de seed/dev. Motivos: (a) `proximasJornadas` y los tipos viven en `lib/jornadas.ts`/`lib/noticias.ts` y los usa el front/los db-readers — no son borrables sin relocar; (b) el seed lee `content/` para poblar el emulator (dev) y migrar a prod (one-shot); (c) el volumen (1 nota + 3 jornadas) no justifica el riesgo de relocar tipos + extraer `proximasJornadas` + inventar un dev-seed alternativo. Los loaders `fs` **nunca llegan al bundle cliente** (solo los importa el seed, que es un script, y los tipos por `import type`). Se reetiquetan las notas de deprecación y se comenta que los loaders de contenido son "solo-seed".

- **D3 — Un endpoint, ambos tags.** `/api/revalidate` revalida `noticias` **y** `jornadas` por defecto; acepta `{ tag }` opcional en el body para targetear uno (el admin publicará noticias en #140 y jornadas en #141). Sobre-revalidar en una publicación esporádica es inocuo a bajo tráfico.

## Risks / Trade-offs

- **Build que toca Firestore por descuido** → mismo invariante que #136, **verificado**: build sin credenciales debe dejar `/voluntarios` como `ƒ (Dynamic)` y completar sin llamadas a Firestore.
- **Confusión "edito el .md y no cambia el sitio"** → mitigado por las notas de deprecación reetiquetadas (fixtures de seed/dev, no la fuente viva) y el comentario "solo-seed" en los loaders.
- **Loaders `fs` que conviven con los db-readers** → benigno (solo-seed, sin llegar al cliente); es el costo consciente de (A) frente al riesgo de un borrado con relocación.
- **`force-dynamic` en una página con formulario** → `/voluntarios` ya es interactiva (form + server action de inscripción); render dinámico no la afecta y mejora la frescura del calendario.
