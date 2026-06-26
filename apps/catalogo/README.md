# apps/catalogo

Catálogo de fauna del humedal de Chirimoyo → **fauna.chirimoyo.org** (aves, anfibios y reptiles). `aves.chirimoyo.org` es un **vanity 301** hacia `fauna.chirimoyo.org/aves` (ADR-0024).

Next.js 15 (App Router) · TypeScript · Tailwind v4. **Catálogo 100% estático** (ADR-0005): export estático servido directo por Firebase Hosting, **sin Cloud Run ni Docker** (ADR-0014).

## Rutas

- `/` — **hub** de fauna: hero, tarjetas por grupo (conteos derivados), **especies destacadas** y acceso a la búsqueda.
- `/aves`, `/anfibios`, `/reptiles` — índice por grupo (un grupo = un path, ADR-0024).
- `/busqueda` — buscador general multi-grupo (en cliente).
- `/<grupo>/<slug>` — detalle de especie (p. ej. `/aves/psarocolius-montezuma`).

## Comandos

```bash
npm install
npm run dev            # servidor de desarrollo (:3000)
npm run build          # next build → genera out/ (estático). NO genera el PDF.
npm run build:pdf      # genera los 2 PDFs → public/catalogo-{aves,herpetofauna}-chirimoyo.pdf
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run sync:tokens    # regenera app/tokens.css desde docs/design-system/
npm run smoke          # smoke test e2e sobre out/ (rutas, enlaces, PDFs, sin API, vanity)
npm run deploy_prod    # build:pdf + build + smoke + firebase deploy (hosting:prod)
```

> **Smoke test (#95):** `npm run smoke` afirma sobre el `out/` ya construido —rutas marco
> + un detalle por grupo, enlaces internos `/<grupo>/<slug>`, PDFs íntegros (`%PDF`) y
> ausencia de fugas al API— y termina ≠ 0 si algo falla. Va dentro de `deploy_prod` tras el
> build, como puerta previa al deploy. El check del **vanity** `aves.* → 301 fauna/aves` es
> opt-in: `SMOKE_VANITY=1 npm run smoke` (verifícalo cuando el redirect esté configurado;
> por defecto hace SKIP).

Para previsualizar el export: `npx serve out`.

> **PDF y CI:** `build:pdf` **no** forma parte de `npm run build` (lo usa el CI, que no
> tiene Chromium ni el banco de imágenes). El PDF se genera en el **deploy** (`deploy_prod`),
> en una máquina con el banco local. Ver ADR-0019.

## PDF del catálogo (#14, ADR-0019)

`npm run build:pdf` genera **dos PDFs** (uno por disciplina) con todas las especies a partir de
`content/` y de la **copia local del banco de imágenes**, y los escribe en:

- `public/catalogo-aves-chirimoyo.pdf` — ornitología (aves).
- `public/catalogo-herpetofauna-chirimoyo.pdf` — herpetología (anfibios + reptiles).

Los descargan los botones "Descargar guía en PDF" del catálogo. Se componen con plantillas de
impresión en `print/templates/` (Tailwind v4 precompilado offline) y se imprimen con Chromium
headless (Playwright). Ver [ADR-0019](../../docs/decisions/0019-pdf-catalogo-build-headless.md).

**Prerequisito (una vez):** instalar el navegador de Playwright:

```bash
npx playwright install chromium
```

**Textos de la ficha.** Los cuatro bloques (Descripción · Cómo identificarla · ¿Sabías que? ·
Dónde y cuándo observarla) usan los **resúmenes curados** (columnas `resumen_*`) del CSV de
origen por disciplina (`content/fauna/_origen/aves-especies.csv` y
`anfibios-reptiles-especies.csv`), que tienen prioridad. Si una especie no tiene resumen, se
recurre a un extracto recortado del cuerpo Markdown.

Variables de entorno opcionales:

- `FAUNA_BANCO_DIR` — ruta del banco local de imágenes de **aves** (default: `…/Img guia aves/Imagenes aves`).
- `FAUNA_BANCO_HERPS_DIR` — ruta del banco local de imágenes de **herpetofauna** (default: `…/guia aves Roldan/anfibios-reptiles/fotos`).
- `SITE_BASE` — base del sitio para los QR (default `https://fauna.chirimoyo.org`).
- `PHOTO_SELECTIONS` — ruta del JSON de selección/encuadre de fotos (default `print/photo-selections.json`).
- `PDF_OUT` — ruta de salida del PDF (sobrescribe el destino por disciplina).

Si falta la imagen de una especie, su ficha usa un placeholder y se registra un aviso (el
build no se rompe).

### Selección y encuadre de foto por especie

Por defecto cada ficha usa la **primera** foto del banco. Para elegir otra y **encuadrarla** al
recuadro del catálogo:

```bash
npm run photo:tool     # genera print/_photo-tool.html
```

Abre `print/_photo-tool.html` en el navegador: recorre las aves, elige una foto de la galería,
ajusta el encuadre (arrastrar = mover, rueda/deslizador = zoom; el marco tiene el aspecto real
del catálogo) y pulsa **Exportar JSON**. Guarda el archivo como
`apps/catalogo/print/photo-selections.json`. En el siguiente `npm run build:pdf`, cada ave con
selección usa esa foto recortada (sharp aplica el recorte normalizado a la imagen original).
`photo-selections.json` **se versiona** (es curación); la herramienta `_photo-tool.html` no.

## Sistema de diseño

Los tokens viven en `app/tokens.css`, **generado** desde la fuente canónica `docs/design-system/tokens.css` con `npm run sync:tokens` (no editar a mano; ver [ADR-0013](../../docs/decisions/0013-tokens-compartidos-por-copia.md)). `app/globals.css` importa Tailwind y luego los tokens. Fuentes en `lib/fonts.ts` (next/font). Primitivas en `components/ui/`.

## Contenido

`lib/content.ts` lee `content/fauna/<grupo>/<slug>/index.md` desde la raíz del repo en build
(override con `CONTENT_DIR`), valida contra el esquema group-aware (`lib/fauna-validate.ts`,
ADR-0025) y expone las fichas a la app. La búsqueda y el detalle se resuelven 100% en cliente
sobre esos datos (sin API). Las imágenes y el audio se sirven desde GCS (ADR-0016, ADR-0017).

## Hosting

`firebase.json` publica `out/` directo (target `prod` → site **`fauna-chirimoyo`**, conectado a
`fauna.chirimoyo.org`). `aves.chirimoyo.org` es un vanity 301 hacia `fauna.chirimoyo.org/aves`
(ADR-0024; configurado fuera del repo vía URL forwarding del registrador). El smoke test
verifica el 301 con `SMOKE_VANITY=1`.
