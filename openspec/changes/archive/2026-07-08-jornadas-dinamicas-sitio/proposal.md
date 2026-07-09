## Why

Es la última superficie de lectura del sitio que falta migrar (issue #137, ADR-0028). `/voluntarios` lee hoy las jornadas de `content/jornadas/` en build; con los db-readers de #134, los datos de #135 y el patrón de #136, el swap a **lectura dinámica desde Firestore** cierra la migración de lectura del sitio. Es el gemelo —más chico— de #136: una sola página, la expansión de recurrencia se queda intacta en el front.

## What Changes

- **`lib/jornadas-cache.ts`** (nuevo, espejo de `noticias-cache.ts`): `getJornadasCached` sobre `getJornadasDb` (#134), cacheada en el Data Cache de Next con tag `jornadas` (revalidable) y respaldo temporal.
- **`app/voluntarios/page.tsx`**: `getJornadas → getJornadasCached`; se reemplaza `export const revalidate = 86400` por **`force-dynamic`** (mismo invariante que #136: `next build` sin credenciales, cero llamadas a Firestore; y de paso el "hoy" de `proximasJornadas` se recalcula por request, más preciso). `proximasJornadas`/`etiquetaOcurrencia` y el `select` de inscripción **no cambian** (reciben la misma forma `{ recurrentes, eventos }`).
- **`app/api/revalidate/route.ts`**: revalida **ambos** tags (`noticias` + `jornadas`) por defecto, con un `{ tag }` opcional en el body para granularidad futura (el admin publicará noticias en #140 y jornadas en #141).
- **Cutover como reetiquetado, no borrado (decisión A):** `content/noticias/`, `content/jornadas/` y los loaders `fs` (`lib/noticias.ts`, `lib/jornadas.ts`) **se conservan como fixtures de seed/dev** (pueblan el emulator en dev y son la fuente de la migración one-shot a prod). Se actualizan las notas de deprecación (de *"se borrarán"* a *"son fixtures de seed/dev; la fuente viva es Firestore"*) y se marca con comentario que los loaders `fs` de contenido son **solo para el seed**.

## No-goals

- **No** se borra nada: `content/*`, los loaders `fs` y el seed **se quedan** como tooling de fixtures/migración (decisión A). Borrarlos costaría relocar tipos y `proximasJornadas` y quitaría el dev-seed simple, desproporcionado para 1 nota + 3 jornadas.
- **No** se toca la **lógica de recurrencia** (`proximasJornadas`, `etiquetaOcurrencia`, helpers de fecha): es pura y vive en el front sin cambios.
- **No** se construye el admin (llamará al endpoint en #141); **no** se toca el API Flask ni las reglas `deny-all` (ADR-0006/0012 preservados).
- **No** se cambia el esquema de jornadas (recurrentes/eventos, campos, reglas de recurrencia) ni el layout de `/voluntarios`.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `jornadas-voluntarios`: la **fuente de verdad** de las jornadas pasa de `content/jornadas/` (build) a **Firestore** (colección `jornadas`, leída server-side en runtime, editable desde el admin); `content/jornadas/` queda como **fixture de seed/dev**. Sigue **sin** vivir en el API Flask (ADR-0006). La página `/voluntarios` pasa a render dinámico (build sin Firestore).
- `contenido-dinamico`: se añade la **lectura dinámica de jornadas en el sitio** y se extiende la **revalidación on-demand** para cubrir también las jornadas (`/voluntarios`, tag `jornadas`).

## Impact

- **Sub-dominios afectados:** sitio + voluntarios (`/voluntarios`, endpoint de revalidación).
- **Código (`apps/sitio`):** `lib/jornadas-cache.ts` (nuevo), `app/voluntarios/page.tsx`, `app/api/revalidate/route.ts`. Componentes de voluntarios sin cambio (solo importan el tipo).
- **Docs:** notas de deprecación reetiquetadas en `content/noticias/README.md` y `content/jornadas/README.md`; comentario "solo-seed" en los loaders `fs`.
- **Ops:** el tag `jornadas` no requiere índice compuesto (se lee la colección entera y se filtra/expande en memoria). El resto de ops (índice de noticias, IAM, `REVALIDATE_SECRET`, seed a prod) ya están apuntados al runbook #144.
- **Sin** cambios en API, reglas Firestore ni convenciones → **no requiere ADR** (implementa ADR-0028).
