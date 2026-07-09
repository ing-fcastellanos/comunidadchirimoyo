# Tasks — jornadas-dinamicas-sitio (issue #137)

## 1. Lectura dinámica

- [x] 1.1 `apps/sitio/lib/jornadas-cache.ts` (nuevo, espejo de `noticias-cache.ts`) — `getJornadasCached` sobre `getJornadasDb`, `unstable_cache` con tag `jornadas` (`JORNADAS_TAG`) + respaldo temporal.
- [x] 1.2 `apps/sitio/app/voluntarios/page.tsx` — `getJornadas → getJornadasCached`; **reemplazar** `export const revalidate = 86400` por `export const dynamic = "force-dynamic"`. `proximasJornadas`/`etiquetaOcurrencia` y el `select` de inscripción sin cambios.

## 2. Revalidación (ambos tags)

- [x] 2.1 `apps/sitio/app/api/revalidate/route.ts` — revalidar `noticias` **y** `jornadas` por defecto; aceptar `{ tag }` opcional en el body para targetear uno. Mantener la protección por `REVALIDATE_SECRET`.

## 3. Cutover = fixtures (sin borrar)

- [x] 3.1 Reetiquetar las notas de deprecación en `content/noticias/README.md` y `content/jornadas/README.md`: de *"se eliminan en el cutover"* a *"son fixtures de seed/dev; la fuente viva es Firestore (editable desde el admin)"*. **No** borrar archivos.
- [x] 3.2 Comentario "solo-seed" en `lib/noticias.ts` y `lib/jornadas.ts`: los loaders `fs` (`getAllNoticias`/`getNoticia`/`getJornadas`) quedan como data-layer del seed, no del sitio (que usa los `*-cache`/`*-db`). La lógica pura (`proximasJornadas`, helpers) y los tipos permanecen.

## 4. Verificación

- [x] 4.1 **Invariante:** `npm run build` **sin** Firestore alcanzable → completa y `/voluntarios` queda `ƒ (Dynamic)` (cero llamadas a Firestore en build).
- [x] 4.2 Con el emulator sembrado: `/voluntarios` muestra las próximas jornadas (recurrentes expandidas + evento) leídas de Firestore; el `select` de inscripción trae las ocurrencias.
- [x] 4.3 Revalidación: POST a `/api/revalidate` con el secreto revalida ambos tags; con `{ tag: "jornadas" }` solo jornadas; sin secreto → 401.
- [x] 4.4 `npm run typecheck` en verde.
