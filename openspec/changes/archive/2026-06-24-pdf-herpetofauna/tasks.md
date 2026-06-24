## 1. Refactor a generador parametrizado

- [x] 1.1 En `scripts/build-pdf.mts`, definir `CatalogoConfig` (grupos, out, título/intro/leyenda, `ordenCategorias`, `categoriaTone`, `categoriaDot`, `resumenesCsv`, `coverSlug`) y extraer la lógica de `main()` a `generarCatalogo(config)`.
- [x] 1.2 Sustituir el `filter(grupo === "aves")` por `fichas.filter((f) => config.grupos.includes(f.grupo))`.
- [x] 1.3 Generalizar la organización: `guildRank`/`byGuild` → `rankCategoria(categoria, config)` y agrupación por `config.ordenCategorias`; tonos/dots desde `config`.
- [x] 1.4 Cover por config: `featured ?? config.coverSlug ?? primera-en-orden`.
- [x] 1.5 Aislar/revisar el estado global (caches de imagen/QR, SELS) para que sea seguro entre las dos corridas (clave por contenido, no por PDF).

## 2. Correcciones transversales

- [x] 2.1 QR de especie → `${SITE_BASE}/${f.grupo}/${f.slug}` con `SITE_BASE` default `https://fauna.chirimoyo.org` (corrige el dominio/paths viejos). QR de intro/cierre al landing de fauna.
- [x] 2.2 `medidas(f)`: rotular la talla con `f.medidas?.criterio` cuando exista (LHC), cayendo a «Tamaño»; `Envergadura` solo si `f.envergadura`.
- [x] 2.3 Leer los resúmenes del CSV indicado por `config.resumenesCsv` (aves vs anfibios-reptiles).

## 3. Plantillas group-aware

- [x] 3.1 Parametrizar el copy de marca (`Cover`, `IntroLegend`, `Closing`): título, intro y leyenda desde `config` (en vez de literales «aves»).
- [x] 3.2 `IndexPage`/cabeceras de sección: usar «categoría» (no «gremio») con el orden/tonos de la disciplina.
- [x] 3.3 `SpeciesSheet`: rótulo de medidas group-aware (consume el `medidas()` ya corregido); confirmar que «categoría» sustituye a «gremio» en el encabezado.

## 4. Configs + script

- [x] 4.1 Definir `ORNITOLOGIA` (aves; gremios actuales; cover psarocolius; `catalogo-aves-chirimoyo.pdf`) reproduciendo el comportamiento actual.
- [x] 4.2 Definir `HERPETOFAUNA` (anfibios+reptiles; clases por grupo; cover `incilius-valliceps`; copy propio; `catalogo-herpetofauna-chirimoyo.pdf`).
- [x] 4.3 `build:pdf` (o el `main`) corre `generarCatalogo(ORNITOLOGIA)` y `generarCatalogo(HERPETOFAUNA)`.

## 5. UI de descarga

- [x] 5.1 `components/home/CierreCTA.tsx` (hub): ofrecer ambos PDFs (ornitología + herpetología).
- [x] 5.2 Enlace contextual: `/aves` → PDF de ornitología; `/anfibios` y `/reptiles` → PDF de herpetología (en el header de `IndiceGrupo` o donde encaje).

## 6. Verificación

- [x] 6.1 `npx tsc --noEmit` y `npm run lint` verdes; el script tipa.
- [x] 6.2 `npm run build:pdf` corrido en esta máquina: genera **ambos** PDFs con **fotos reales** — ornitología (69 págs, 64 especies, 14 MB) y herpetología (16 págs, 12 especies, índice por categoría, 3.4 MB, 0 avisos). El banco de herpetofauna es **separado** (`FAUNA_BANCO_HERPS_DIR` = `C:\Users\Frank\Documents\guia aves Roldan\anfibios-reptiles\fotos`, subcarpetas por nombre científico); se cableó como banco por disciplina en la config.
- [x] 6.3 `npm run build` verde; confirmar que `out/catalogo-aves-chirimoyo.pdf` y `out/catalogo-herpetofauna-chirimoyo.pdf` se exportan.
- [x] 6.4 Preview: los enlaces de descarga apuntan al PDF correcto por contexto (hub ambos; /aves ornitología; /anfibios·/reptiles herpetología).
