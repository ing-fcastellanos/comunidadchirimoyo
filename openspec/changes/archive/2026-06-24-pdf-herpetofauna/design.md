## Context

`scripts/build-pdf.mts` (467 líneas) genera el PDF de aves: carga `getAllFichas()`, filtra `grupo === "aves"`, ordena por gremio, arma view-models por especie, resuelve la foto desde el banco local (`BANCO_DIR`, mismo que usan `descargar-imagenes`/`migrar-fauna`), genera QR, maqueta el índice con folios y renderiza el documento (react-dom/server → Playwright). Las plantillas (`print/templates/*`) reproducen el diseño v0.dev. Casi todo es genérico salvo los aves-ismos:

```
  filter grupo==="aves"          GUILD_ORDER/GUILD_TONE/GUILD_DOT (gremios)
  cover = psarocolius            RESUMENES_CSV = aves-especies.csv
  QR = aves.chirimoyo.org/aves/  medidas: "Envergadura" (ignora medidas.criterio)
  OUT = catalogo-aves...pdf      copy "aves" en Cover/IntroLegend/Closing
```

El banco local ya tiene los originales de herpetofauna (de ahí salió #88), así que `resolvePhoto` los encuentra sin cambios. El CSV de herps (`anfibios-reptiles-especies.csv`) ya trae las columnas `resumen_*`.

## Goals / Non-Goals

**Goals:**
- Dos PDFs por disciplina (ornitología, herpetología) desde un generador parametrizado.
- Correcciones transversales: QR al dominio nuevo, medidas LHC, organización por categoría group-aware.
- Exponer ambos PDFs para descarga.

**Non-Goals:**
- Mapa en print; tocar imágenes/sharp/Playwright; cambiar esquema/datos; PDF por grupo individual; renombrar el PDF de aves.

## Decisions

### Decisión 1 — `generarCatalogo(config)` + dos configs

Se extrae la lógica del `main()` a una función `generarCatalogo(config: CatalogoConfig)` y se la llama dos veces. `CatalogoConfig` captura lo que difiere entre disciplinas:

```ts
interface CatalogoConfig {
  slug: string;                 // "ornitologia" | "herpetofauna" (para logs)
  grupos: Grupo[];              // ["aves"] | ["anfibios","reptiles"]
  out: string;                  // catalogo-aves-...pdf | catalogo-herpetofauna-...pdf
  titulo: string;               // copy de portada/intro/cierre
  intro: string; leyenda: …;
  ordenCategorias: string[];    // gremios | clases por grupo
  categoriaTone: Record<string, {bg;fg}>;  // tonos de cabecera de categoría
  categoriaDot: Record<string, string>;
  resumenesCsv: string;         // aves-especies.csv | anfibios-reptiles-especies.csv
  coverSlug?: string;           // fallback de portada
}
```

`build:pdf` corre `generarCatalogo(ORNITOLOGIA)` y `generarCatalogo(HERPETOFAUNA)`. El estado compartido hoy global (caches, SELS) se aísla por llamada o se mantiene si es seguro reutilizar entre PDFs (p. ej. `photo-selections.json` cubre ambos por slug).

### Decisión 2 — Organización por grupo → categoría (group-aware)

La organización «por gremio» se generaliza a «por categoría», y el orden de categorías lo da `config.ordenCategorias`:
- **Ornitología:** los 6 gremios actuales (sin cambio de comportamiento).
- **Herpetología:** clases en orden por grupo — `Anuros`, `Salamandras` (anfibios), luego `Lagartijas`, `Serpientes`, `Tortugas` (reptiles).

El índice y los encabezados de sección usan ese orden y los tonos de `config.categoriaTone`. La ordenación de especies pasa de `guildRank(categoria)` a `rankCategoria(categoria, config)` + nombre común.

### Decisión 3 — Medidas con criterio (LHC) group-aware

`medidas(f)` usa `f.medidas?.criterio` como rótulo de la talla cuando exista (p. ej. «LHC (hocico-cloaca)»), cayendo a «Tamaño» si no. `Envergadura` se mantiene solo si `f.envergadura` está presente (aves). Mismo arreglo que el detalle web (#92), ahora en print.

### Decisión 4 — QR al dominio y paths nuevos

El QR de especie pasa de `aves.chirimoyo.org/aves/<slug>` a **`fauna.chirimoyo.org/<grupo>/<slug>`** (deriva `<grupo>` de la ficha; corrige también el de aves, que apuntaba al dominio anterior a ADR-0024). La base sigue siendo configurable (`SITE_BASE`, default `https://fauna.chirimoyo.org`). Los QR de intro/cierre apuntan al landing de fauna.

### Decisión 5 — Cover de herpetología

Ninguna herp tiene `featured: true`. La cover de herpetología usa `featured ?? config.coverSlug ?? primera-en-orden`. Se propone `coverSlug: "incilius-valliceps"` (sapo costero: carismático, con canto) como fallback editable; el mantenedor puede marcar otra `featured`.

### Decisión 6 — Descarga de ambos PDFs

`CierreCTA` (hub) ofrece los dos PDFs (ornitología y herpetología). El landing `/aves` enlaza el de ornitología; los índices `/anfibios` y `/reptiles` enlazan el de herpetología. Enlaces a archivos estáticos del export (sin API).

## Risks / Trade-offs

- **[El PDF se construye manualmente, no en CI]** → La verificación final del PDF la corre el mantenedor con su banco local; el cambio se valida por `tsc`, estructura y el HTML intermedio. Documentado en tasks.
- **[Refactor a generador rompe el PDF de aves]** → La config de ornitología reproduce el comportamiento actual; verificación: regenerar el PDF de aves y comparar (folios, gremios, cover, QR ahora al dominio nuevo).
- **[Estado global compartido entre las 2 corridas]** (caches de imagen/QR) → Se revisa que las caches sean por-contenido (clave por archivo/URL), no por-PDF; si no, se reinician entre corridas.
- **[QR de aves cambia de dominio]** → Es una corrección (el dominio se movió en ADR-0024); los QR viejos impresos quedarían obsoletos, pero el PDF se regenera en cada deploy.

## Open Questions

- Confirmar el `coverSlug` de herpetología (propuesto `incilius-valliceps`).
- Nombre exacto del archivo de herps: `catalogo-herpetofauna-chirimoyo.pdf` (propuesto).
