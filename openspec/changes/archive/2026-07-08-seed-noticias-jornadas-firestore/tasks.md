# Tasks — seed-noticias-jornadas-firestore (issue #135)

## 1. Runner

- [x] 1.1 Añadir `tsx` como **devDependency** de `apps/sitio` (primer script TS del sitio; patrón de los scripts `tsx` del catálogo).

## 2. Script de seed

- [x] 2.1 `apps/sitio/scripts/seed-firestore.mts` — reusa los loaders `fs` como fuente (import relativo `../lib/noticias.ts`, `../lib/jornadas.ts`) y `../lib/firestore.ts` como destino. Flags `--emulator` (dev) y `--verify`; imprime el destino (emulator/prod) antes de escribir.
- [x] 2.2 **Noticias**: listar `content/noticias/*.md` con `readdir` (ignorando `_*` y `README.md`) + `getNoticia(slug)` (incluye borradores) → `noticias/{slug}.set({...campos editoriales, cuerpo, timestamps})`. Timestamps **derivados de `fecha`**: `createdAt = updatedAt = fecha`; `publishedAt = fecha` si `publicado`, si no `null`. `portada` como ruta relativa (sin resolver).
- [x] 2.3 **Jornadas**: `getJornadas()` → `recurrentes[]` como `kind: "recurrente"` (+ `recurrencia`), `eventos[]` como `kind: "evento"` (+ `fecha`); doc ID = slug; base (`titulo`, `tipo`, `hora`, `lugar`, `inscripcion`, `descripcion`). Sin timestamps.
- [x] 2.4 Idempotencia por `set()` (doc ID = slug) con docs deterministas; script script-only (no se importa desde la app).
- [x] 2.5 Añadir el npm script `"seed:firestore": "tsx ./scripts/seed-firestore.mts"` en `apps/sitio/package.json`.

## 3. Verificación de paridad

- [x] 3.1 Modo `--verify`: comparar `getAllNoticias()`/`getJornadas()` (fs) vs `getAllNoticiasDb()`/`getJornadasDb()` (Firestore) — slugs, títulos, estado y conteos; reportar divergencias y salir ≠0 si las hay.

## 4. Deprecación (nota, sin borrar)

- [x] 4.1 Nota en `content/noticias/README.md` y `content/jornadas/README.md`: la fuente de verdad pasa a **Firestore** (ADR-0028); los archivos y loaders `fs` se eliminan en #136/#137 tras el cutover. **No** borrar nada en este cambio.

## 5. Verificación

- [x] 5.1 Correr el seed contra el **emulator** (`npm run seed:firestore -- --emulator`) sobre base vacía; confirmar que aparecen la noticia (borrador) + 2 recurrentes + 1 evento.
- [x] 5.2 Correr `--verify` contra el emulator y confirmar **paridad** (sin divergencias).
- [x] 5.3 Re-correr el seed y confirmar **idempotencia** (documentos idénticos; timestamps sin cambiar).
- [x] 5.4 `npm run typecheck` de `apps/sitio` en verde. (La corrida real contra **prod** es manual, fuera de este checklist.)
