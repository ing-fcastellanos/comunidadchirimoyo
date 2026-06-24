## Why

El PDF del catálogo (ADR-0019, Playwright en build) solo incluye **aves** (`filter(grupo === "aves")`). Con la herpetofauna ya migrada (#88) y curada (#92/#93), falta llevarla al PDF (#94, parte de #17). La exploración descartó el bloqueador temido: el **banco local de imágenes es compartido** (`descargar-imagenes` y `migrar-fauna` usan la misma carpeta), así que los originales de las 12 herps ya están en disco — el trabajo es de **contenido/organización**, no de plumbing.

Decisión de la exploración: **dos PDFs por disciplina** —**ornitología** (aves) y **herpetología** (anfibios + reptiles)— en vez de un solo PDF mixto, porque los gremios aviares y las clases de herpetofauna no conviven bien en una sola taxonomía de índice.

Sub-dominio afectado: **aves** (catálogo de fauna). Sin impacto en sitio, voluntarios ni api.

## What Changes

- **Refactor de `scripts/build-pdf.mts`** a un generador parametrizado `generarCatalogo(config)`; `npm run build:pdf` genera **ambos** PDFs.
- **Config ORNITOLOGÍA** (la actual, parametrizada): aves, organización por gremio, cover flagship (psarocolius), `catalogo-aves-chirimoyo.pdf`.
- **Config HERPETOLOGÍA** (nueva): anfibios + reptiles (12 especies), organización por **grupo → categoría** (Anfibios: Anuros·Salamandras / Reptiles: Lagartijas·Serpientes·Tortugas), cover de herp emblemática, copy propio (título, intro, leyenda), `catalogo-herpetofauna-chirimoyo.pdf`.
- **Correcciones compartidas (ambos PDFs):**
  - **QR** → `fauna.chirimoyo.org/<grupo>/<slug>` (hoy apunta al dominio viejo `aves.chirimoyo.org/aves/`; corrige también el de aves, ADR-0024).
  - **Medidas LHC:** usar `medidas.criterio` como rótulo de la talla cuando exista (hoy `medidas()` lo ignora); en herpetofauna muestra «LHC (hocico-cloaca)» en vez de «Tamaño/Envergadura».
  - **Tonos/orden de categoría y CSV de resúmenes** se reciben por config (el CSV de herps ya tiene las columnas `resumen_*`).
  - **Copy de marca** (Cover/IntroLegend/Closing) parametrizado por config.
- **UI de descarga:** exponer **ambos** PDFs — el hub ofrece los dos; `/aves` enlaza el de ornitología; `/anfibios` y `/reptiles` enlazan el de herpetología.

## Capabilities

### New Capabilities
_(ninguna)_

### Modified Capabilities
- `catalogo-pdf`: el catálogo deja de ser **un PDF de aves** y pasa a **dos PDFs por disciplina** (ornitología y herpetología). Se ajustan los requisitos de generación (un PDF → dos), índice (por gremio → por categoría dentro de la disciplina), contenido de ficha (medidas con criterio LHC), QR (dominio/paths de fauna.chirimoyo.org) y descarga (ambos PDFs expuestos).

## Impact

- **Código (aves):** `scripts/build-pdf.mts` (refactor a generador + 2 configs), plantillas `print/templates/*` (título/leyenda/medidas parametrizados), `components/home/CierreCTA.tsx` y los índices/landings para enlazar el PDF correcto.
- **Datos/esquema:** ninguno — fichas, CSV de origen y banco de imágenes ya existen.
- **Dependencias:** ninguna (sharp/Playwright/qrcode ya están).
- **Build:** `build:pdf` produce 2 PDFs; el flujo manual de deploy no cambia de forma.

## No-goals

- **No** se añade mapa de distribución al print (el PDF nunca tuvo; el QR lleva a la ficha web con su mapa residente, #93).
- **No** se toca el plumbing de imágenes (banco local compartido), `sharp` ni Playwright.
- **No** se cambia el **esquema** ni los **datos** de las fichas.
- **No** se genera un PDF por grupo individual (anfibios/reptiles van juntos en herpetología).
- **No** se renombra el PDF de aves (se mantiene `catalogo-aves-chirimoyo.pdf` para no romper enlaces; el branding «ornitología» va en el copy interno).
