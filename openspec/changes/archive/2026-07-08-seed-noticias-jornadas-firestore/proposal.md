## Why

La capa de datos Firestore ya existe (#134, capability `contenido-dinamico`), pero las colecciones están **vacías**. Antes de que el sitio lea de Firestore (#136/#137) hay que **poblarlas** con el contenido que hoy vive en `content/`. Este cambio (issue #135) es la **migración**: portar fielmente el contenido existente a Firestore y verificar paridad, sin cambiar todavía lo que las páginas leen. El valor no es el volumen (hoy hay 1 noticia + 2 jornadas recurrentes + 1 evento) sino **probar el pipeline** de punta a punta con datos reales.

## What Changes

- **Script de seed** (`apps/sitio/scripts/seed-firestore.mts`, corrido con `tsx`) que **reusa los loaders `fs` existentes** como fuente (`getNoticia`, `getJornadas`) y escribe con el cliente de #134 (`lib/firestore.ts`): "leer con los loaders viejos, escribir en Firestore". Cero re-parseo → cero drift de mapeo.
- **Noticias**: cada `.md` (listado con `readdir`, leído con `getNoticia` que **no** filtra por estado → incluye borradores) se escribe en `noticias/{slug}`. Los **timestamps de sistema se derivan de `fecha`** (deterministas, no `serverTimestamp()`): `createdAt = updatedAt = fecha`; `publishedAt = fecha` si `estado == publicado`, si no `null`. `portada` se guarda como ruta relativa (la resuelve `mediaUrl` al leer); el `cuerpo` markdown se copia verbatim (sus imágenes ya usan URL absoluta del bucket).
- **Jornadas**: `recurrentes[]` → docs `kind: "recurrente"` (+ `recurrencia`); `eventos[]` → docs `kind: "evento"` (+ `fecha`). Doc ID = slug. Sin timestamps (el contrato no los define para jornadas).
- **Idempotencia**: `set()` por slug con docs deterministas → re-correr produce documentos idénticos. Se agrega `tsx` como devDependency del sitio (primer script TS del sitio; el smoke de #134 se quedó en `.mjs`).
- **Modo `--verify`**: compara la salida de los loaders `fs` contra los db-readers (`getAllNoticiasDb`/`getJornadasDb`) — mismos slugs, títulos, estado y conteos — para confirmar paridad.
- **Modo `--emulator`**: seed contra el Firestore emulator en dev (mismo patrón que el smoke). Contra prod (ADC) es la migración real, manual y única.
- **Nota de deprecación** en `content/noticias/README.md` y `content/jornadas/README.md`: la fuente de verdad pasa a ser Firestore (ADR-0028). **Sin borrar** los archivos ni los loaders `fs`.

## No-goals

- **No** se borran `content/noticias/`, `content/jornadas/` ni los loaders `lib/noticias.ts`/`lib/jornadas.ts`: las páginas **todavía los leen** hasta el cutover de #136/#137. Borrarlos ahora rompería el sitio. La eliminación es de #136/#137.
- **No** se adaptan páginas ni se activa ISR (#136/#137).
- **No** se introducen funciones de escritura de *producto* ni validación de admin (eso es #140/#141); el seed escribe inline vía el cliente, como script de migración.
- **No** se corre automáticamente en el build ni en CI: es una operación **manual y única** (como un deploy), primero contra el emulator para validar, luego contra prod.
- **No** se toca el API Flask ni las reglas `deny-all` (ADR-0006/0012 preservados).

## Capabilities

### New Capabilities
<!-- ninguna: no hay comportamiento de producto nuevo. El seed es una operación de migración one-shot sobre la capability `contenido-dinamico` ya existente (#134). -->

### Modified Capabilities
- `contenido-dinamico`: se añade un requisito de **migración determinista con verificación de paridad** (el seed puebla las colecciones desde el contenido del repo de forma reproducible y comprueba que los db-readers devuelven lo mismo que los loaders `fs`). Es una adición pura (nuevo requisito de tooling, como el smoke); no cambia los requisitos existentes.

## Impact

- **Sub-dominios afectados:** foundation (script de migración) y comunidad/voluntarios (su contenido queda en Firestore, aunque el sitio aún lo lee de archivos).
- **Datos:** las colecciones `noticias` y `jornadas` quedan pobladas en prod tras la corrida manual.
- **Dependencias:** `tsx` (devDependency) en `apps/sitio`.
- **Docs:** notas de deprecación en los README de `content/noticias/` y `content/jornadas/`.
- **Contenido:** cierra #74 (subsumido) — las notas reales se crearán vía el admin (#140), no como archivos.
- **Sin** cambios en API, reglas Firestore, ni comportamiento del sitio (las páginas no cambian) → **no requiere ADR** (implementa ADR-0028).
