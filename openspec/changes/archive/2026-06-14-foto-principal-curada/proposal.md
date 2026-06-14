## Why

La foto que se curó para cada ave en el PDF (vía `print/photo-selections.json`, con encuadre y selección hechos a mano) **no es** la que muestra el sitio. El sitio usa siempre `fotos[0]` (la primera del banco), que en la práctica casi nunca coincide con la curada: en el muestreo de 3 fichas, las 3 mostraban una foto distinta a la del PDF. El resultado es una miniatura y un hero de detalle con fotos sin curar, peor encuadradas, mientras el PDF luce la buena.

**Sub-dominios afectados:** `aves` (apps/catalogo), `foundation` (esquema de contenido).

## What Changes

- La **foto de portada** de cada ficha (`fotos[0]`) pasa a ser la **misma que eligió la curaduría del PDF**. Se logra **reordenando `fotos[]`** en el frontmatter para dejar la curada al frente (Opción B acordada en explore). No se introduce un campo nuevo.
- Un **script de migración one-time** (`scripts/`) lee `print/photo-selections.json`, casa por *stem* (nombre sin extensión, case-insensitive — igual que el build-pdf) y reordena `fotos[]` en `content/fauna/aves/<slug>/index.md`. Idempotente; reporta las fichas sin selección o sin coincidencia.
- El **Hero del landing** deja de hardcodear un archivo (`DSCN1632.webp`) y usa la portada curada de su especie representativa.
- Como la miniatura del buscador y el hero del detalle ya consumen `fotos[0]` / el primer elemento de la galería, **heredan la corrección sin tocar su código**.

## No-goals

- **No se replica el recorte (crop)** del PDF en el sitio. Solo se alinea la *selección* de archivo; el sitio sigue sirviendo la imagen del bucket con `object-cover`. (Acordado en explore; un crop por-foto sería otro cambio, con variantes en el bucket o `object-position`.)
- **No se cambia el bucket** ni las URLs (`fotoUrl`), ni el pipeline de subida de imágenes.
- **No se convierte `photo-selections.json` en dependencia de runtime** del sitio: queda solo como insumo del script de migración.
- No se cubre la única ficha sin selección (64/65): se deja con su orden actual (fallback natural).

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `esquema-ficha-fauna`: la primera entrada de `fotos[]` (la portada) SHALL ser la foto curada para el catálogo, consistente con la selección usada por el PDF. Se precisa la convención de "portada" para que signifique "foto principal curada".
- `landing-catalogo`: la imagen del hero SHALL ser la portada curada de una especie representativa (derivada del contenido), en vez de un archivo hardcodeado.

## Impact

- **Contenido:** reordenamiento de `fotos[]` en ~64 fichas de `content/fauna/aves/<slug>/index.md` (solo cambia el orden del arreglo; `credito`/`alt`/`licencia` viajan con su foto).
- **Código (apps/catalogo):**
  - `components/home/Hero.tsx` — quita el hardcode, deriva la portada.
  - `lib/search.ts` (`fichaToBird`) y `lib/ficha.ts` (`fotosVista`) — **sin cambios**; siguen usando `fotos[0]`/orden, que ahora apunta a la curada.
- **Scripts:** nuevo script de migración en `scripts/` (Node, lee el JSON y reescribe frontmatter).
- **Insumo:** `apps/catalogo/print/photo-selections.json` (lectura, no se modifica).
- **Despliegue:** sin cambios de infra; el siguiente `npm run deploy_prod` publica las fotos correctas. Sin cambios en API, Firestore ni bucket. Sin ADR (no rompe convención; refuerza "la primera foto es la portada").
