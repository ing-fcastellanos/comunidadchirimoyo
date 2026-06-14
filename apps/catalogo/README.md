# apps/catalogo

Catálogo de fauna del humedal de Chirimoyo → **aves.chirimoyo.org** (aves + anfibios/reptiles como categoría).

Next.js 15 (App Router) · TypeScript · Tailwind v4. **Catálogo 100% estático** (ADR-0005): export estático servido directo por Firebase Hosting, **sin Cloud Run ni Docker** (ADR-0014).

## Comandos

```bash
npm install
npm run dev            # servidor de desarrollo (:3000)
npm run build          # next build → genera out/ (estático). NO genera el PDF.
npm run build:pdf      # genera el PDF del catálogo → public/catalogo-aves-chirimoyo.pdf
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run sync:tokens    # regenera app/tokens.css desde docs/design-system/
npm run deploy_prod    # build:pdf + build + firebase deploy (hosting:prod)
```

Para previsualizar el export: `npx serve out`.

> **PDF y CI:** `build:pdf` **no** forma parte de `npm run build` (lo usa el CI, que no
> tiene Chromium ni el banco de imágenes). El PDF se genera en el **deploy** (`deploy_prod`),
> en una máquina con el banco local. Ver ADR-0019.

## PDF del catálogo (#14, ADR-0019)

`npm run build:pdf` genera **un único PDF** con todas las especies a partir de `content/` y
de la **copia local del banco de imágenes**, y lo escribe en
`public/catalogo-aves-chirimoyo.pdf` (lo descarga el botón "Descargar guía en PDF" del
catálogo). Se compone con plantillas de impresión en `print/templates/` (Tailwind v4
precompilado offline) y se imprime con Chromium headless (Playwright). Ver
[ADR-0019](../../docs/decisions/0019-pdf-catalogo-build-headless.md).

**Prerequisito (una vez):** instalar el navegador de Playwright:

```bash
npx playwright install chromium
```

**Textos de la ficha.** Los cuatro bloques (Descripción · Cómo identificarla · ¿Sabías que? ·
Dónde y cuándo observarla) usan los **resúmenes curados** (≤350c) del CSV de origen
(`content/fauna/_origen/aves-especies.csv`, columnas `resumen_*`), que tienen prioridad. Si una
especie no tiene resumen, se recurre a un extracto recortado del cuerpo Markdown.

Variables de entorno opcionales:

- `FAUNA_BANCO_DIR` — ruta del banco local de imágenes (default: `…/Img guia aves/Imagenes aves`).
- `SITE_AVES_BASE` — base del sitio para los QR (default `https://aves.chirimoyo.org`).
- `PHOTO_SELECTIONS` — ruta del JSON de selección/encuadre de fotos (default `print/photo-selections.json`).
- `RESUMENES_CSV` — ruta del CSV con los resúmenes (default `content/fauna/_origen/aves-especies.csv`).
- `PDF_OUT` — ruta de salida del PDF.

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

`lib/content.ts` lee `content/fauna/` desde la raíz del repo en build (override con `CONTENT_DIR`). Hoy es un stub tipado; el parseo real llega en #10/#11 según el esquema de #9.

## Hosting

`firebase.json` publica `out/` directo (target `prod`). El site `aves-chirimoyo` en `.firebaserc` es provisional — se fija al conectar el dominio `aves.chirimoyo.org` (#3). Deploy a producción en #15.

## Pendiente (otros issues)

Listado (#11) · buscador/filtros (#12) · detalle por especie (#13) · PDF (#14) · migrar datos+imágenes (#10) · deploy (#15).
