## Context

El esquema de la ficha de fauna (`esquema-ficha-fauna`) es rico: ~14 campos obligatorios, varios enums, `categoria` group-aware (vocabulario según `grupo`), medios con crédito/alt y un puñado de vocabularios visuales cerrados. La fuente de verdad del esquema son **tipos TypeScript puros** en `apps/catalogo/lib/fauna-schema.ts`, un módulo deliberadamente *client-safe* (sin `node:fs`) porque lo importan Client Components.

Hoy la única validación vive incrustada en `apps/catalogo/lib/content.ts` (`camposNucleoFaltantes`): cubre solo presencia de núcleo + `## Descripción`, **aborta al primer error** y omite enums, `categoria` group-aware, `genero` (lo silencia con `?? ""`), `foto.credito`/`foto.alt`, unicidad de slug y rangos de meses. El issue #91 pide un validador que recorra los 3 grupos, **reporte por ficha** e integre al CI (que ya corre `npm run build` para catalogo, ADR-0009).

Los 76 fichas actuales ya están razonablemente limpios (todos tienen `genero`; enums de `estatusMigratorio` y `nom059` válidos), así que la motivación es **preventiva** (evitar drift y dar feedback a contribuciones externas en un repo público) más que correctiva.

## Goals / Non-Goals

**Goals:**
- Una **fuente única** de la lógica de validación, compartida por el loader (falla rápido en build) y un script de reporte (acumula por ficha). Sin duplicar reglas → sin drift.
- Recorrer `aves` + `anfibios` + `reptiles` y reportar problemas **por ficha** con severidad `error` | `warning`.
- Romper CI ante cualquier `error`; los `warning` solo informan.
- Cero dependencias nuevas y **cero peso al bundle del cliente**.

**Non-Goals:**
- Verificar existencia de archivos de foto/audio en el bucket GCS (red, no esquema).
- Introducir zod u otra librería de validación.
- Cambiar el esquema o el contenido de las fichas.
- Validar la prosa más allá de la presencia de `## Descripción`.

## Decisions

### Decisión 1 — Módulo puro compartido, no zod, no extender-solo-el-loader

Crear `apps/catalogo/lib/fauna-validate.ts` (server-only, pero **puro**: sin `node:fs`, recibe `data`/`cuerpo` ya parseados) que exporta:

```ts
type Severidad = "error" | "warning";
interface Problema { campo: string; mensaje: string; severidad: Severidad; }
// ctx aporta lo que un solo objeto no sabe: slug de carpeta, grupo, set de slugs vistos, selección curada
function validarFicha(data: Record<string, unknown>, cuerpo: string, ctx: ValidarCtx): Problema[];
```

- **El loader** (`content.ts`) llama `validarFicha`, filtra `severidad === "error"` y lanza si hay alguno (back-compat: el build sigue fallando con núcleo incompleto). Se elimina `camposNucleoFaltantes` y el `genero ?? ""`.
- **El script** (`scripts/validar-fichas.mts`) llama `validarFicha` por ficha, acumula **todos** los problemas (error y warning), imprime un reporte agrupado por ficha y hace `process.exit(1)` si hubo algún `error`.

**Por qué no zod:** `fauna-schema.ts` es client-safe; meter zod ahí lo enviaría al browser. Aislarlo en un módulo server-only obligaría a una segunda definición del esquema (la interface sigue en el módulo cliente), reintroduciendo drift entre tipo y validación — justo lo que queremos evitar. Para 76 fichas con datos ya limpios, una función a mano es suficiente y no agrega dependencia. **Por qué no solo extender el loader:** el loader debe abortar al primer error (es un loader de build); el issue exige *reporte por ficha*, que es responsabilidad distinta. Compartir la lógica pura concilia ambos.

### Decisión 2 — `ctx` para las reglas que trascienden una sola ficha

Unicidad de slug y `slug == carpeta` no se pueden juzgar viendo una ficha aislada. `validarFicha` recibe un `ctx` con: nombre de carpeta (`slugCarpeta`), `grupo`, y un acumulador de slugs ya vistos (para detectar colisiones); el cross-check de portada recibe la selección curada de `photo-selections.json` (o `undefined`). El **caller** (loader o script) arma ese `ctx` mientras itera — así la función pura no toca disco.

### Decisión 3 — `categoria` group-aware desde una tabla de vocabularios

Validar `categoria` contra el set permitido **según `grupo`** (`aves` → gremios; `anfibios` → Anuros/Salamandras; `reptiles` → Lagartijas/Serpientes/Tortugas). La tabla `CATEGORIAS_POR_GRUPO: Record<Grupo, string[]>` vive en `fauna-validate.ts`. Esto evita que un reptil declare `categoria: Vadeadoras` y pase.

### Decisión 4 — Severidad de cada check

- **error** (rompe CI): núcleo + `genero`; enums `grupo`/`estatusMigratorio`/`gradoOcurrencia`/`estatusDistribucion`/`conservacion.nom059`; `categoria` group-aware; `foto.credito`+`foto.alt` y ≥1 foto; unicidad de slug + `slug == carpeta`; `temporada.meses` ∈ 1–12; vocabularios visuales cerrados (`forma`/`tamano`/`colores`/`donde`) cuando estén presentes; `## Descripción` presente.
- **warning** (informa): `fotos[0]` == foto curada en `print/photo-selections.json` (match por *stem*, case-insensitive).

### Decisión 5 — CI solo en el slot `catalogo`

Añadir un step `Validar fichas` en `.github/workflows/ci-frontend.yml` con `if: matrix.app == 'catalogo' && steps.exists.outputs.go == 'true'`, corriendo `npm run validate:fichas`. El step usa el mismo `working-directory: apps/catalogo`; el script resuelve `content/` vía la misma lógica del loader (`CONTENT_ROOT`, `../../content` o `CONTENT_DIR`). No es un job aparte para no duplicar el setup de Node.

## Risks / Trade-offs

- **[Drift loader/script si alguien vuelve a meter checks en `content.ts`]** → La regla queda escrita en la spec: la lógica de validación vive **solo** en `fauna-validate.ts`; el loader únicamente la invoca y filtra por severidad.
- **[Un check demasiado estricto rompe CI por un campo legítimamente flexible]** (p. ej. `categoria` futura) → `categoria` es lista abierta en el tipo; el set por grupo se mantiene como dato editable en un solo lugar, y ampliar el vocabulario es una línea. Los vocabularios verdaderamente cerrados (forma/tamano/colores/donde) ya lo son en el tipo.
- **[Ejecutar `.mts` en CI/local]** → Se corre con el runner de TS ya disponible para el catálogo (mismo mecanismo que `scripts/build-pdf.mts`); no añade toolchain nuevo. La tarea de implementación confirma el invocador exacto (`tsx`/`node --import`) replicando el del PDF.
- **[Falsos positivos del warning de portada]** → Es solo `warning`, no rompe CI; sirve de aviso de curaduría, alineado con `migracion-fauna`.

## Open Questions

- Ninguna que bloquee. (El invocador concreto de `.mts` se hereda de `build-pdf.mts`; se confirma al implementar.)
