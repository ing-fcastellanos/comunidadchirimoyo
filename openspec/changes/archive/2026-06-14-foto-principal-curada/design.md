## Context

El catálogo es estático: cada ave es un Markdown con `fotos: [{ archivo, credito, alt, licencia? }]`. El sitio compone la URL con `fotoUrl(slug, archivo, variante)` y, para elegir *qué* foto mostrar, usa siempre la primera del arreglo:

- `lib/search.ts` (`fichaToBird`) → miniatura, `fotos[0]`, variante `thumb`.
- `lib/ficha.ts` (`fotosVista`) → galería del detalle, en orden; el primer elemento es el hero, variante `web`.
- `components/home/Hero.tsx` → hero del landing, archivo **hardcodeado**.

En paralelo, el PDF (`scripts/build-pdf.mts`) tiene su propia curaduría en `print/photo-selections.json`: por slug, un `{ archivo, crop }` elegido a mano. El `archivo` del JSON viene del banco local (p. ej. `DSCN3085.JPG`); los `fotos[].archivo` de la ficha apuntan al bucket en `.webp` (p. ej. `DSCN3085.webp`). El build-pdf ya las casa **por stem** (nombre sin extensión, en minúsculas) en `chosenFoto()`.

Hoy las dos curadurías están desincronizadas: el PDF muestra la foto buena, el sitio muestra `fotos[0]`.

## Goals / Non-Goals

**Goals:**
- Que la miniatura del buscador y el hero del detalle muestren la **misma foto** que el PDF.
- Que el hero del landing use la portada curada (sin hardcode).
- Lograrlo con el menor blast-radius posible y de forma durable (el contenido manda).

**Non-Goals:**
- Replicar el **crop** del PDF en el sitio (solo selección de archivo).
- Cambiar el bucket, `fotoUrl`, o el pipeline de subida de imágenes.
- Convertir `photo-selections.json` en dependencia de runtime del sitio.
- Cubrir la única ficha sin selección (64/65): se deja con su orden actual.

## Decisions

### D1 — Hornear la selección en el contenido reordenando `fotos[]` (Opción B1)

La portada curada se deja como **primer elemento** de `fotos[]` en el frontmatter. Como los tres consumidores ya usan `fotos[0]`/el orden del arreglo, **no se toca su lógica de selección** (salvo el hardcode del Hero).

- *Alternativa A (sitio lee el JSON en build):* menos migración, pero acopla el data-layer del sitio a un archivo de `print/` y deja la curaduría fuera del contenido. Descartada en explore.
- *Alternativa B2 (campo `fotoPrincipal`):* explícito pero exige cambio de schema + leer el campo en `search.ts` y `ficha.ts` + fallback en dos lados. Más superficie por poco beneficio. Descartada.

Reordenar conserva la alineación `archivo`↔`credito`↔`alt` (viajan en el mismo objeto) y respeta la convención ya existente del esquema ("la primera foto es la portada"): solo se precisa que esa portada sea la curada.

### D2 — Migración por script idempotente, emparejando por stem

Un script Node de un solo uso en `scripts/`:
1. Lee `apps/catalogo/print/photo-selections.json`.
2. Por cada slug con entrada, calcula el stem del `archivo` (sin extensión, `toLowerCase()`).
3. Abre `content/fauna/aves/<slug>/index.md`, parsea el frontmatter, busca en `fotos[]` la entrada cuyo stem coincide.
4. Si la encuentra y **no** es ya la primera, la mueve al frente; reescribe el archivo.
5. Reporta: reordenadas, ya-correctas, slug sin selección, slug cuya selección no casa con ninguna `fotos[]`.

Idempotente: correrlo dos veces no cambia nada la segunda vez. El emparejamiento por stem replica exactamente la regla del build-pdf (`path.parse(x).name.toLowerCase()`), así que la elección del sitio y la del PDF quedan garantizadamente alineadas.

**Preservación del frontmatter:** el script debe reescribir el YAML sin alterar otros campos, comentarios de orden ni el cuerpo Markdown. Se reordena solo el arreglo `fotos`. (Se valida con `git diff`: el único cambio por ficha es el orden de `fotos`.)

### D3 — Hero del landing derivado del contenido

`Hero.tsx` deja de hardcodear `("botaurus-lentiginosus", "DSCN1632.webp")`. Toma la especie representativa (botaurus-lentiginosus, la actual) y usa su portada (`fotos[0]`) ya curada, vía el data-layer server-side. Así el hero hereda cualquier recuración futura sin volver a editar el componente.

## Risks / Trade-offs

- **Selección que no casa con ninguna `fotos[]`** (el banco tenía un archivo que no se subió al bucket con ese stem) → el script **no reordena** esa ficha y la **reporta**; se revisa a mano. No rompe el build.
- **Reescritura de YAML corrompe el frontmatter** → usar un parser/serializador de YAML confiable y revisar el `git diff` ficha por ficha antes de commitear; el diff esperado es solo el reorden de `fotos`.
- **La ficha sin selección (1/65)** → se queda con `fotos[0]` actual; aceptado como no-goal. Se reporta para decidir luego.
- **Desincronización futura** (si se recura el PDF y no se re-corre el script) → mitigado porque el script es idempotente y barato; se puede re-correr en cualquier momento. (Unificar a una sola fuente de verdad PDF+sitio queda como mejora futura, fuera de alcance.)
- **Verificación visual** → tras la migración, `npm run build` + preview de `/busqueda` y un detalle, comparando contra las páginas del PDF.

## Migration Plan

1. Correr el script de migración en local.
2. Revisar el reporte (reordenadas / sin coincidencia / sin selección) y el `git diff`.
3. Ajustar `Hero.tsx`.
4. `npm run typecheck` + `npm run build` + preview (miniaturas + un detalle).
5. Commit + PR. El deploy normal (`npm run deploy_prod`) publica las fotos correctas.

**Rollback:** es un cambio de contenido + un componente; revertir el commit restaura el orden previo. Sin estado, sin migración de datos externa.
