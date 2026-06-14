## 1. Andamiaje y dependencias

- [x] 1.1 Añadir a `apps/catalogo` las dependencias **solo de build**: navegador headless (Playwright + Chromium, por defecto) y generador de QR (`qrcode`); confirmar Playwright vs Puppeteer al primer render.
- [x] 1.2 Documentar el prerequisito de instalación de Chromium (`npx playwright install chromium`) en `apps/catalogo/README.md`.
- [x] 1.3 Crear la estructura `apps/catalogo/scripts/build-pdf.mjs` (o `.ts`) y la carpeta de plantillas de impresión (`print/`).
- [x] 1.4 Ignorar el artefacto generado en `.gitignore` (`apps/catalogo/public/catalogo-aves-chirimoyo.pdf`).

## 2. Plantillas de impresión (portar el diseño entregado)

- [x] 2.1 Portar las 5 plantillas del handoff de Claude Design (Portada, Intro+Leyenda, Índice, Ficha, Cierre) a la fuente del repo, sin CDN: Tailwind precompilado/tokens inline y fuentes empaquetadas localmente.
- [x] 2.2 Reutilizar los **tokens canónicos** (`app/tokens.css`) y las fuentes del proyecto (Cormorant Garamond + Source Sans 3); no recopiar valores a mano.
- [x] 2.3 Portar los componentes compartidos del diseño: `Chip`, `CodeSeal`, `PhotoPH`, `Wordmark`, `PageFoot`, y la ficha (`SpeciesSheet`).
- [x] 2.4 Sustituir el QR falso del prototipo por un QR **real** (SVG/PNG) manteniendo el encuadre visual del componente `QR`.
- [x] 2.5 Verificar el CSS de impresión: `@page { size: A4; margin: 0 }`, `printBackground`, salto de página por hoja.

## 3. Datos: mapear `content/` a las plantillas

- [x] 3.1 Leer las fichas con el data layer existente (`getAllFichas()` / `lib/content.ts`) y derivar los view-models por página.
- [x] 3.2 Ficha: mapear encabezado (común/científico/autoridad/`categoria`/`otrosNombres`), estatus, IUCN/NOM-059, taxonomía, medidas, hábitat/`mejorHora`.
- [x] 3.3 Ficha: extraer los **extractos curados** de las secciones del cuerpo (Descripción · Cómo identificarla · ¿Sabías que? · Dónde y cuándo observarla); omitir las ausentes sin romper la maqueta.
- [x] 3.8 Ficha: usar los **resúmenes curados** (≤350c) del CSV de origen (columnas `resumen_*`, casadas por nombre científico) con prioridad sobre el extracto del cuerpo; ajustar la maqueta para que quepan (≈peor caso 1181c combinados).
- [x] 3.4 Índice: agrupar por gremio (`categoria`), ordenar y calcular el **folio** real de cada ficha.
- [x] 3.5 Intro + Leyenda: generar la leyenda desde los vocabularios del esquema (estatus, ocurrencia, distribución, IUCN, NOM-059).
- [x] 3.6 Cierre: componer créditos (`fotos[].credito`), fuentes (`fuentes[]`) y licencias.
- [x] 3.7 Portada: título, edición, conteo de especies y foto insignia.

## 4. Imágenes desde la copia local

- [x] 4.1 Resolver `fotos[0].archivo` → *stem* → `Imagenes aves/<nombreCientifico>/<stem>.*`, con ruta del banco **configurable** (env/flag) y default a la copia local.
- [x] 4.2 Recomprimir/redimensionar (sharp) la foto a un ancho de impresión razonable antes de incrustarla.
- [x] 4.3 Degradado controlado: si falta la imagen, usar `PhotoPH` y **registrar un aviso** identificando la especie, sin abortar el build.

## 5. QR

- [x] 5.1 Generar un QR por ficha → `https://aves.chirimoyo.org/aves/<slug>`.
- [x] 5.2 Generar el QR de sitio (intro y cierre) → landing del sitio.
- [x] 5.3 Hacer la base de URL configurable (env) para entornos de prueba.

## 6. Render a PDF y pipeline

- [x] 6.1 Ensamblar las 70+ páginas (portada + intro + índice + 64 fichas + cierre) y renderizarlas con el navegador headless a un único PDF A4 (`page.pdf({ printBackground: true })`).
- [x] 6.2 Escribir el PDF en `apps/catalogo/public/catalogo-aves-chirimoyo.pdf`.
- [x] 6.3 Encadenar `build:pdf` antes de `next build` en el script `build` de `apps/catalogo/package.json`; verificar que `out/catalogo-aves-chirimoyo.pdf` queda en el export.
- [x] 6.4 Empaquetar las fuentes localmente para que el render no dependa de Google Fonts en build.

## 7. Descarga desde el catálogo web

- [x] 7.1 Añadir un enlace/botón de descarga en el catálogo (apuntando al archivo estático), sin llamar al API; respetar la identidad visual del catálogo.

## 9. Selección y encuadre de foto por especie

- [x] 9.1 Herramienta HTML (`npm run photo:tool` → `print/_photo-tool.html`) con galería de fotos por ave, miniaturas embebidas y marco de recorte con el aspecto real del catálogo (pan + zoom).
- [x] 9.2 Exportar/importar `photo-selections.json` (foto elegida + recorte normalizado 0..1 por ave).
- [x] 9.3 `build-pdf.mts`: si existe `photo-selections.json`, usar la foto elegida y aplicar el recorte a la imagen original (sharp `extract`); si no, primera foto con recorte centrado.
- [x] 9.4 Versionar `photo-selections.json` (curación) e ignorar `_photo-tool.html` (generado).

## 8. ADR y cierre

- [x] 8.1 Escribir el ADR (siguiente número en `docs/decisions/`) documentando la generación en build con navegador headless; extiende ADR-0005 (no lo contradice). Actualizar `docs/adr/_index.md`.
- [x] 8.2 Verificación end-to-end: `npm run build`, abrir el PDF, comprobar A4, las 5 secciones, una ficha por especie, folios del índice, QR escaneables, y aviso ante imagen faltante.
- [x] 8.3 Limpiar artefactos temporales (`_design-instr.json`, `_specs-instr.json`, `_tasks-instr.json`) si quedaran en el árbol de trabajo.
