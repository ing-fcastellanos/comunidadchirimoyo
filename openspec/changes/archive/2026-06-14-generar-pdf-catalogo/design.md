## Context

El catálogo (`apps/catalogo`) es un export 100% estático de Next.js 15 (`output: "export"` →
`out/`). Los datos de las 64 especies viven en `content/fauna/aves/<slug>/index.md` (frontmatter
gray-matter + cuerpo Markdown con secciones `##`), leídos por `lib/content.ts` / `lib/ficha.ts`.
Las fotos de producción viven en GCS, pero existe una **copia local** del banco en
`C:\Users\Frank\Downloads\Img guia aves\Imagenes aves\<NombreCientifico>\` (carpetas por nombre
científico; archivos originales cuyo *stem* coincide con `fotos[].archivo`).

ADR-0005 fijó que el PDF se genera desde `content/`. El diseño visual ya está entregado vía
Claude Design: cinco plantillas A4 en **HTML + Tailwind + React (prototipo)** con CSS de impresión
(`@page { size: A4; margin: 0 }`, unidades `mm`), tokens idénticos a `app/tokens.css` (paleta
forest/pine/mint/paper/ink + acentos ochre/terra/teal, Cormorant Garamond + Source Sans 3) y
componentes compartidos (`Chip`, `CodeSeal`, `QR`, `PhotoPH`, `Wordmark`, `PageFoot`). Las cinco
páginas: **Portada**, **Intro + Leyenda**, **Índice por gremio**, **Ficha de especie** (una por
hoja, ×64), **Cierre**.

## Goals / Non-Goals

**Goals:**
- Un único PDF A4 imprimible con las 64 especies, **fiel al diseño entregado**.
- Generación **en build**, sin red ni credenciales: lee `content/` + copia local de imágenes.
- PDF servido como archivo estático del export y enlazado desde el catálogo web.
- QR **reales**: por ficha → `aves.chirimoyo.org/aves/<slug>`; intro/cierre → landing del sitio.
- Regeneración determinista: mismo `content/` ⇒ mismo PDF.

**Non-Goals:**
- PDF por especie, generación on-demand, o cualquier endpoint de API (ADR-0006).
- Audios o mapas incrustados (los QR cubren la versión enriquecida en línea).
- Reproducir el catálogo web en vivo (se usa una plantilla de impresión dedicada).
- Optimizar el peso del PDF al extremo (legibilidad de impresión > kilobytes).

## Decisions

### D1 — Generación en **build**, archivo estático (no runtime, no cliente, no API)

El catálogo no cambia entre deploys (cada alta de especie = build + deploy, ADR-0005), así que un
PDF "fresco" en cliente no aporta y sí añade peso/fragilidad. El PDF se genera durante el build y
se sirve como `out/catalogo-aves-chirimoyo.pdf`. El "botón de descarga" es un enlace estático.

- **Alternativa descartada — cliente (jsPDF/pdfmake):** 64 fichas + fotos = payload JS pesado,
  maquetación pobre, acentos/fuentes frágiles.
- **Alternativa descartada — API on-demand:** rompe ADR-0006 (API mínima).

### D2 — Render con **Chromium headless** sobre una plantilla de impresión dedicada

El diseño entregado *es* HTML + print-CSS pensado para imprimirse desde navegador (gradientes,
`ring`, leaders punteados, unidades `mm`, `@page`). El camino de **máxima fidelidad** es portar
esas cinco plantillas a una fuente HTML/JSX de producción, poblarla con datos reales y fotos
locales, y **imprimirla a PDF con un navegador headless** (Playwright o Puppeteer + Chromium).

- **Alternativa descartada — `@react-pdf/renderer`:** evita el navegador y es más liviano, pero
  obliga a reimplementar el diseño en su subconjunto de flexbox/pt, **sin** Tailwind ni los
  gradientes/anillos/leaders del diseño. Alto riesgo de deriva visual frente a un diseño que el
  proyecto ya curó al detalle. El costo de fidelidad supera el ahorro de la dependencia.
- **Playwright vs Puppeteer:** Playwright trae su propio Chromium gestionado (`npx playwright
  install chromium`) y una API de `page.pdf()` estable con `printBackground`. Es la opción por
  defecto. Puppeteer es equivalente; la decisión final se cierra en implementación según fricción
  de instalación en Windows. Ambas son **dependencias solo de build** (`devDependencies`).

### D3 — La plantilla de impresión se porta al repo (no se usa el prototipo CDN)

El prototipo carga Tailwind/React/Babel desde CDN (`cdn.tailwindcss.com`, UMD, babel-standalone):
inadecuado para un build reproducible y offline. Se porta a una fuente propia bajo
`apps/catalogo/` (p. ej. `print/` con las plantillas y un `print.css`/tokens compilados). Opciones
de materialización, a cerrar en implementación:

- **Plantilla HTML autocontenida** (CSS de Tailwind precompilado + tokens inline), ensamblada por
  el script con los datos ya inyectados. Independiente del build de Next. **Preferida** por su
  desacople (no necesita `next build` para generar el PDF).
- **Ruta Next oculta** (`/imprimible`) renderizada y luego impresa con headless. Reusa el data
  layer y los tokens, pero acopla la generación al servidor de Next.

En cualquier caso se reutilizan los **tokens canónicos** (`app/tokens.css`) y las fuentes del
proyecto para no duplicar la identidad visual.

### D4 — Datos: reusar el data layer del catálogo

El script lee las fichas con la misma capa que el sitio (`getAllFichas()` / `lib/content.ts`),
de modo que el PDF y la web comparten fuente de verdad. Mapeo por página:

- **Portada:** título, "Edición 2026", conteo de especies, foto insignia.
- **Intro + Leyenda:** texto fijo + leyenda derivada de los vocabularios del esquema
  (`estatusMigratorio`, `gradoOcurrencia`, `estatusDistribucion`, IUCN, NOM-059).
- **Índice:** agrupado por **gremio/`categoria`**, ordenado, con folio (número de página de la
  ficha). El folio se calcula en el mismo paso de maquetación.
- **Ficha (×64):** `nombreComun`, `nombreCientifico`+`autoridad`, `categoria`, `otrosNombres`,
  `fotos[0]` (+crédito/licencia), chips de estatus, IUCN/NOM-059, taxonomía, medidas
  (`tamanoCm`/`pesoG`/`envergadura`), `habitat`/`mejorHora`, y **extractos curados** de las
  secciones del cuerpo: Descripción · Cómo identificarla · ¿Sabías que? · Dónde y cuándo observarla.
- **Cierre:** créditos fotográficos (de `fotos[].credito`), fuentes (`fuentes[]`), licencias, CTA.

### D5 — Imágenes desde copia local, con degradado controlado

Para cada ficha se resuelve `fotos[0].archivo` → *stem* → archivo en
`Imagenes aves/<nombreCientifico>/<stem>.*`. La ruta del banco es **configurable** (env/flag),
con default a la copia local conocida. Si una imagen no se encuentra, se usa el **placeholder**
del diseño (`PhotoPH`) y se **registra un aviso** (no se rompe el build). Las fotos se
**redimensionan/recomprimen** (sharp) a un ancho de impresión razonable antes de incrustarlas,
para acotar el peso del PDF.

### D6 — QR reales generados en build

Se genera un QR por ficha apuntando a `https://aves.chirimoyo.org/aves/<slug>` y un QR de sitio
para intro y cierre apuntando al landing. El prototipo usa un QR **falso** (rejilla determinista):
se sustituye por una librería real (p. ej. `qrcode`) emitiendo SVG/PNG, manteniendo el encuadre
visual del componente `QR` del diseño. La base de URL es configurable (env) para entornos de prueba.

### D7 — Integración con el pipeline y ubicación del artefacto

- Script `apps/catalogo/scripts/build-pdf.mjs` (o `.ts`), invocable como `npm run build:pdf`.
- `npm run build` ejecuta `build:pdf` **antes** de `next build` y escribe el PDF en
  `apps/catalogo/public/catalogo-aves-chirimoyo.pdf`, de modo que `next build` lo copia a `out/`.
- El PDF es un **artefacto generado**: se ignora en git (`.gitignore`).
- Se añade un **ADR** documentando D1+D2 (generación en build con headless), extendiendo ADR-0005.

## Risks / Trade-offs

- **Peso del Chromium en build (~150 MB) y fricción de instalación en Windows** → dependencia
  solo de `devDependencies`; `playwright install chromium` documentado en el README del catálogo;
  el deploy es manual (no hay CI de deploy que lo pague repetidamente).
- **Build más lento y con un binario externo** → aceptable para un paso de build poco frecuente;
  el render headless de ~70 páginas es del orden de segundos.
- **Dependencia de la copia local de imágenes** (no está en el repo) → ruta configurable +
  degradado a placeholder con aviso; documentar el prerequisito. Riesgo de PDF "incompleto" si
  falta el banco: el aviso lo hace visible.
- **Peso del PDF con 64 fotos** → recompresión con sharp a ancho de impresión; medir y ajustar.
- **Deriva entre tokens del prototipo y `app/tokens.css`** → reusar los tokens canónicos, no
  recopiar valores a mano.
- **Reproducibilidad del render** (fuentes web, antialiasing) → empaquetar las fuentes localmente
  para no depender de Google Fonts en el momento del build.

## Open Questions

- ¿Materializar la plantilla como HTML autocontenido (D3, preferido) o como ruta Next oculta?
  Se cierra al implementar según fricción real.
- ¿Playwright o Puppeteer? Default Playwright; confirmar en implementación.
- ¿La copia local de imágenes se moverá a una ubicación versionada/compartida del repo, o
  permanece como prerequisito externo configurable? (afecta reproducibilidad en otra máquina).
