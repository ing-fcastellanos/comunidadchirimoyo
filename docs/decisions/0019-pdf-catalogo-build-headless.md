# ADR-0019 — PDF del catálogo generado en build con navegador headless

- **Estado:** Accepted
- **Fecha:** 2026-06-13
- **Decisores:** @ing-fcastellanos
- **Issue:** #14 (generación del PDF del catálogo)

## Contexto

ADR-0005 fijó que el catálogo de fauna es 100% estático y que **el PDF del catálogo se
genera a partir de los mismos datos de `content/`**. El issue #14 pide un PDF único,
imprimible y descargable con todas las especies.

El diseño del documento se entregó vía Claude Design como cinco plantillas A4 en
**HTML + Tailwind + CSS de impresión** (`@page { size: A4; margin: 0 }`, unidades `mm`,
gradientes, anillos, guías punteadas), con tokens idénticos a `app/tokens.css`. Es, por
construcción, un diseño pensado para imprimirse desde un navegador.

Había que decidir: (a) **cuándo** se genera el PDF y (b) **con qué motor** se compone.

## Decisión

1. **Generación en build, como archivo estático.** Un script (`apps/catalogo/scripts/build-pdf.mts`)
   lee las fichas con el data layer del catálogo (`getAllFichas`), las maqueta y emite **un
   único PDF** en `public/catalogo-aves-chirimoyo.pdf`, que `next build` copia a `out/`. El
   "botón de descarga" del catálogo es un enlace a ese archivo. **No** hay generación on-demand
   ni endpoint de API (respeta ADR-0006). El PDF se regenera en cada build (`build` ejecuta
   `build:pdf` antes de `next build`).

2. **Render con Chromium headless (Playwright) sobre una plantilla de impresión dedicada.**
   Las cinco plantillas se portan a React (`apps/catalogo/print/templates/`), se renderizan con
   `react-dom/server`, se estilan con Tailwind v4 **precompilado offline** (`@tailwindcss/cli`
   sobre `print/print.css`, que reutiliza los tokens canónicos) y fuentes locales, y se imprimen
   a PDF con `page.pdf({ printBackground: true })`.

3. **Imágenes desde la copia local** del banco (`FAUNA_BANCO_DIR`, default a la copia conocida),
   recomprimidas con sharp e incrustadas como data-URI. Si falta una imagen, la ficha usa un
   placeholder y se registra un aviso, sin abortar el build. Los **QR son reales** (`qrcode`):
   por ficha → la página web de la especie; en intro y cierre → el landing del sitio.

## Alternativas consideradas

- **Generación en cliente (jsPDF/pdfmake):** payload JS pesado para 64 fichas con fotos,
  maquetación pobre y tipografía/acentos frágiles. Descartada.
- **Generación on-demand en el API:** rompe ADR-0006 (API mínima). Descartada.
- **`@react-pdf/renderer` (sin navegador):** evita el binario de Chromium y es más liviano, pero
  obliga a reimplementar el diseño en su subconjunto de flexbox/pt, **sin** Tailwind ni los
  gradientes/anillos/guías del diseño entregado. Alto riesgo de deriva visual frente a un diseño
  ya curado. El costo de fidelidad supera el ahorro de la dependencia. Descartada.

## Consecuencias

### Positivas

- El PDF reproduce **fiel** el diseño entregado (mismo HTML/CSS que el prototipo).
- Cero backend y cero red en runtime: el PDF es un archivo estático cacheable en CDN.
- Reutiliza el data layer y los tokens canónicos: una sola fuente de verdad.
- Build autónomo: no depende de GCS ni de credenciales (usa la copia local de imágenes).

### Negativas

- Añade dependencias **solo de build**: Playwright + Chromium (~150 MB) y `tsx`, `sharp`,
  `qrcode`, `@tailwindcss/cli`. Requiere `npx playwright install chromium` una vez.
- El build del catálogo tarda más (render de ~70 páginas, del orden de segundos).
- Depende de la **copia local de imágenes** (no versionada): si falta, el PDF sale con
  placeholders (con avisos). La ruta es configurable vía `FAUNA_BANCO_DIR`.

### Neutras

- Extiende ADR-0005 (no lo contradice): concreta el "cómo" del PDF que aquel ya anticipaba.
- Si en el futuro se quisiera generar el PDF en CI, habría que resolver el banco de imágenes
  (versionarlo o leerlo desde GCS) — fuera del alcance de #14.
