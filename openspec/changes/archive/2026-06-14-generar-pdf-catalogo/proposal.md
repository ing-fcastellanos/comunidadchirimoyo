## Why

El catálogo de aves vive solo en la web (`aves.chirimoyo.org`). Falta una versión
descargable e imprimible —una guía de campo en PDF— que sirva sin conexión, se imparta
en jornadas comunitarias y funcione como material de difusión para la defensa del humedal.
ADR-0005 ya fijó que ese PDF se genera a partir de los mismos datos de `content/`. El issue
[#14](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/14) (Fase 1 — Aves, P1)
es la pieza que cierra esa promesa.

**Sub-dominios afectados:** aves (catálogo). Sin impacto en sitio, comunidad, voluntarios ni api.

## What Changes

- **Generación del PDF en build (no en runtime, no en cliente, no en API).** Un script Node
  bajo `apps/catalogo/` lee las 64 fichas de `content/fauna/aves/`, las maqueta con la
  identidad del proyecto y emite **un único PDF** con todas las especies, escrito a
  `apps/catalogo/public/` para servirse como archivo estático del export (`out/`).
- **Plantillas A4 del documento**, fieles al diseño entregado vía Claude Design (5 tipos de
  página): portada a sangre, introducción + leyenda del sistema de insignias, índice por
  gremio, ficha de especie (una por hoja, ×64) y cierre con créditos/fuentes/licencias.
- **Fotos desde la copia local** del banco de imágenes (`Imagenes aves/<nombreCientifico>/`),
  resolviendo cada `fotos[0].archivo` por nombre de archivo. El build no depende de red ni de
  credenciales de GCS.
- **Códigos QR reales** generados en build: por ficha → la página web de esa especie
  (`aves.chirimoyo.org/aves/<slug>`); en intro y cierre → el landing del sitio.
- **Botón/enlace de descarga** en el catálogo web que apunta al PDF estático.
- **Regeneración del PDF como paso del build** del catálogo, de modo que cualquier cambio en
  `content/` se refleja en el siguiente `npm run build`.

### No-goals

- **No** se genera un PDF por especie (solo el catálogo completo en un archivo).
- **No** se generan PDFs on-demand ni se añade ningún endpoint al API (respeta ADR-0006).
- **No** se incrustan audios ni mini-mapas de distribución en el PDF (los QR llevan a la web).
- **No** se captura la web en vivo: el PDF se compone desde una plantilla de impresión
  dedicada (diseño propio), no fotografiando `aves.chirimoyo.org`.

## Capabilities

### New Capabilities
- `catalogo-pdf`: generación en build de un PDF único e imprimible (A4) con las 64 especies del
  catálogo, a partir de `content/` y de la copia local de imágenes, servido como archivo estático
  y enlazado desde el catálogo web.

### Modified Capabilities
<!-- Ninguna. El catálogo web (catalogo-app, catalogo-detalle) solo gana un enlace de descarga,
     sin cambios en sus requisitos de comportamiento existentes. -->

## Impact

- **Nuevo:** script de build del PDF en `apps/catalogo/` (p. ej. `scripts/build-pdf.mjs`) y sus
  plantillas/componentes de maquetación.
- **Dependencias nuevas (solo build)** en `apps/catalogo`: un navegador headless para
  renderizar la plantilla de impresión a PDF (Playwright/Puppeteer + Chromium) y un generador
  de QR. No afectan el runtime del sitio estático. Ver `design.md` para la elección y su justificación.
- **`package.json` de catálogo:** el script `build` invoca la generación del PDF antes/después
  de `next build`.
- **`apps/catalogo/public/`:** nuevo artefacto `catalogo-aves-chirimoyo.pdf` (no versionado;
  generado en build).
- **Copia local de imágenes:** el build espera el banco local; en su ausencia debe degradar de
  forma controlada (placeholder o aviso), no romper el build sin explicación.
- **ADR:** se añade un ADR que documenta la decisión de generación en build con la librería
  elegida (extiende ADR-0005, no lo contradice).
