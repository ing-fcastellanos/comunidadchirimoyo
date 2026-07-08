## Context

#134 dejó la capa de acceso a Firestore lista (cliente Admin SDK server-only, db-readers, índices, emulator) pero las colecciones `noticias` y `jornadas` están **vacías**. El contenido vive hoy en `content/noticias/*.md` (frontmatter + markdown) y `content/jornadas/jornadas.json` (`recurrentes[]` + `eventos[]`), leído por los loaders `fs` `lib/noticias.ts` y `lib/jornadas.ts`, que las páginas **siguen usando**. Este cambio (issue #135) puebla Firestore sin cambiar aún lo que el sitio lee.

Volumen real: 1 noticia (`jornada-de-limpieza-mayo`, en estado `borrador`), 2 jornadas recurrentes y 1 evento placeholder. El objetivo es probar el pipeline, no mover datos masivos.

## Goals / Non-Goals

**Goals:**
- Poblar `noticias` y `jornadas` en Firestore fielmente desde el contenido del repo.
- Reusar el mapeo existente (loaders `fs`) para no duplicar lógica ni arriesgar drift.
- Ser determinista e idempotente, y verificable por paridad contra los loaders actuales.
- Correr contra el emulator (dev) y, una vez, contra prod (migración real, manual).

**Non-Goals:**
- Cambiar páginas o activar ISR (#136/#137); borrar `content/` o los loaders `fs` (haría fallar el sitio — es de #136/#137); escritura de producto/validación (#140/#141); tocar API Flask o reglas `deny-all`.

## Decisions

- **D1 — "Leer con los loaders viejos, escribir en Firestore".** El seed importa `getNoticia`/`getJornadas` (fuente) y `lib/firestore.ts` (destino) por **ruta relativa `.ts`** (patrón de los scripts `tsx` del catálogo). Reusar el mapeo garantiza que Firestore reciba exactamente lo que el sitio muestra hoy. *Alternativa descartada:* re-parsear los archivos en un `.mjs` → duplica el mapeo (frontmatter→campos) y abre drift.

- **D2 — `tsx` como devDependency del sitio.** El seed necesita importar los loaders TS con sus tipos; `tsx` es el runner (ya probado en el catálogo). El smoke de #134 se quedó en `.mjs` por ser trivial; el seed justifica `tsx`.

- **D3 — Timestamps de noticias derivados de `fecha`.** `createdAt = updatedAt = Timestamp(fecha)`, `publishedAt = Timestamp(fecha)` si `estado == publicado`, si no `null`. **Deterministas**: re-correr el seed produce documentos byte-idénticos (idempotencia real). Usar `serverTimestamp()` rompería eso. Jornadas no llevan timestamps (el contrato no los define).

- **D4 — Incluir borradores; listar por `readdir` + `getNoticia`.** `getAllNoticias` oculta borradores en prod; el seed debe migrar **todo**. Se listan los `.md` con `readdir` y se lee cada uno con `getNoticia(slug)` (que no filtra por estado) para incluir la nota `borrador` fielmente.

- **D5 — Idempotencia por `set()` con doc ID = slug.** Con docs deterministas (D3), `set()` sobrescribe al mismo estado. Guardarraíl documentado: **correr una vez, antes de que el admin edite**; re-correrlo después pisaría ediciones del panel.

- **D6 — Deprecación = nota, no borrado.** Se agregan notas en los README de `content/noticias` y `content/jornadas` indicando que la fuente de verdad pasa a Firestore. Los archivos y loaders `fs` se eliminan en #136/#137 tras el cutover de páginas.

- **D7 — `--verify` de paridad.** Modo que compara `getAllNoticias()`/`getJornadas()` (fs) contra `getAllNoticiasDb()`/`getJornadasDb()` (Firestore): mismos slugs, títulos, estado y conteos. Confirma que el seed y el contrato son consistentes antes del cutover.

## Risks / Trade-offs

- **Re-seed pisa ediciones del admin** (D5) → mitigación: es una operación pre-admin, documentada como one-shot; cuando el admin exista, no se vuelve a correr sobre prod.
- **Divergencia de mapeo fs vs db-reader** → el modo `--verify` (D7) lo detecta; y al reusar los loaders (D1) el riesgo ya es bajo.
- **Correr contra prod por error desde dev** → el flag `--emulator` es explícito; sin él va a prod (ADC). El seed imprime claramente el destino antes de escribir, como el smoke.
- **Orden de operaciones** → si alguien borra `content/` en este cambio, el sitio (que aún lee archivos) se rompe. El proposal/design lo marcan como no-goal explícito; el borrado es de #136/#137.
