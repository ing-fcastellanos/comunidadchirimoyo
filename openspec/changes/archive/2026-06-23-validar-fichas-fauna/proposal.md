## Why

Tras migrar la herpetofauna (#88), el catálogo tiene 76 fichas (64 aves + 8 anfibios + 4 reptiles) y ninguna red de seguridad real contra el esquema. El loader `apps/catalogo/lib/content.ts` solo valida un "núcleo" parcial y **aborta al primer error**, no reporta por ficha. No valida enums, la `categoria` group-aware, `genero` (lo silencia con `?? ""`), `foto.credito`/`foto.alt`, unicidad de slug, ni rangos de `temporada.meses`. El issue #91 pide un validador que corra sobre todos los grupos, reporte faltantes/inválidos **por ficha** e integre a CI.

Sub-dominio afectado: **aves** (catálogo de fauna). Sin impacto en sitio, voluntarios ni api.

## What Changes

- Nuevo módulo **puro server-only** `apps/catalogo/lib/fauna-validate.ts` con `validarFicha(data, cuerpo, ctx) → Problema[]`, donde `Problema = { campo, mensaje, severidad: "error" | "warning" }`. Es la **fuente única** de la lógica de validación.
- `apps/catalogo/lib/content.ts` deja de tener su propia lista de checks: `getAllFichas()` reusa `validarFicha`, filtra `severidad === "error"` y lanza (back-compat: el build sigue fallando con núcleo incompleto). Se cierra el hueco de `genero` (`?? ""`).
- Nuevo script **`apps/catalogo/scripts/validar-fichas.mts`**: recorre `aves` + `anfibios` + `reptiles`, acumula problemas por ficha, imprime un reporte legible y termina con exit code ≠ 0 si hay algún `error`. Expuesto como `npm run validate:fichas` en `apps/catalogo/package.json`.
- **Checks nivel `error` (rompen CI):** núcleo + `genero`; enums (`grupo`, `estatusMigratorio`, `gradoOcurrencia`, `estatusDistribucion`, `conservacion.nom059`); `categoria` group-aware; `foto.credito`/`foto.alt` presentes y ≥1 foto; unicidad de `slug` y `slug == carpeta`; `temporada.meses` ∈ 1–12; vocabularios visuales cerrados (`forma`/`tamano`/`colores`/`donde`) cuando estén presentes; `## Descripción` presente.
- **Checks nivel `warning` (informan, no rompen):** portada (`fotos[0]`) == foto curada en `apps/catalogo/print/photo-selections.json` (match por *stem*).
- **CI:** nuevo step `npm run validate:fichas` en `.github/workflows/ci-frontend.yml`, ejecutado solo para el slot `catalogo` de la matriz (ADR-0009).

## Capabilities

### New Capabilities
_(ninguna)_

### Modified Capabilities
- `esquema-ficha-fauna`: nuevo requisito de **validación ejecutable** del esquema — un comando que recorre todos los grupos, reporta problemas por ficha con severidad, falla en CI ante errores y comparte su lógica con el loader (sin drift). El validador cubre `genero` obligatorio (cerrando el `?? ""` del loader) y, como **warning**, el cross-check "portada == foto curada" del escenario ya existente de medios.

_(No se toca `migracion-fauna`: ese spec valida la generación CSV→ficha en tiempo de migración; #91 valida el contenido ya commiteado, independiente de la migración.)_

## Impact

- **Código (aves):** nuevo `lib/fauna-validate.ts`, refactor de `lib/content.ts`, nuevo `scripts/validar-fichas.mts`, script en `package.json`.
- **CI:** un step nuevo en `ci-frontend.yml` (solo catalogo).
- **Dependencias:** ninguna nueva (no se introduce zod; módulo a mano, 0 peso al bundle cliente).
- **Datos:** los 76 fichas actuales ya pasan los checks de `error` conocidos; el validador es preventivo (evita drift futuro) más que correctivo.

## No-goals

- No verifica la **existencia de archivos** de foto/audio en el bucket GCS (es red, no esquema).
- No introduce **zod** ni ninguna dependencia de validación (decisión registrada en design.md).
- No reescribe el esquema ni cambia campos de las fichas; solo añade la capa que los valida.
- No convierte el catálogo en dinámico ni añade endpoint alguno (sigue 100% estático, ADR-0005).
