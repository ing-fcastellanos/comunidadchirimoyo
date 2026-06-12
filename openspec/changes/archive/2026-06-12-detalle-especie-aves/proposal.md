## Why

El buscador (#11/#12) ya enlaza a `/<slug>`, pero esa página no existe. #13 cierra el
recorrido del catálogo con la **ficha de detalle por especie**. El handoff de Claude Design
(`docs/design/buscar-aves/project/components/`) ya define todos sus componentes (Hero +
carrusel, datos rápidos, descripción, dieta/reproducción, distribución, observación,
conservación, taxonomía), y las 63 fichas ya tienen la prosa, fotos, taxonomía y
conservación. Es el momento de armarla, completando los pocos datos que faltan.

## What Changes

- **Página de detalle en `/aves/[slug]`** (estática, SSG por especie con
  `generateStaticParams` desde `getAllFichas()`), recreando el handoff en React/Next:
  HeroFicha + carrusel/lightbox, QuickFacts, Description, DetailCards (dieta/reproducción),
  Distribution, Observation, Conservation, Taxonomy. La **Vocalización se omite** (audio → #32).
- **Carrusel con créditos**: el lightbox y el pie muestran la **atribución CC** por foto
  (`credito`/`creditoUrl`/`licencia`) — aquí aterriza la atribución que se difirió de las cards.
- **Parser de secciones**: utilidad que divide el `cuerpo` Markdown en sus secciones `##`
  (`{descripcion, dieta, reproduccion, distribucion, identificarla, observarla, sabiasQue}`)
  para alimentar cada componente.
- **OpenGraph por especie**: `generateMetadata` con `og:image` (foto `web` del bucket),
  `og:title`/`description` y `<title>` por especie para previews al compartir.
- **Especies relacionadas**: navegación a especies de la misma familia/categoría (derivado
  de `getAllFichas`, sin datos nuevos).
- **Ruta del buscador**: `fichaToBird.href` pasa de `/<slug>` a `/aves/<slug>` (el primer
  nivel queda libre para futuras páginas: buscador, colaboradores, contacto…).
- **Campos Tier B** (extensión aditiva del esquema + CSV + migración):
  - **Nuevos**: `autoridad`, `otrosNombres[]`, `envergadura`, `mejorHora`.
  - **Ya en el esquema (opcionales), ahora poblados**: `medidas` (tamaño/peso), `habitat`, `temporada`.
  - Todos **opcionales/tolerantes**: la página se construye ya y las secciones sin dato se
    omiten o muestran "Información pendiente". El CSV extendido llega después; la migración
    Tier B no se corre hasta entonces.
- **Distribución**: mapa **placeholder estilizado** genérico (igual para todas) + los textos
  de zona cuando existan. La geografía real por especie es de #27.

### No-goals

- **No** entra la **Vocalización/audio** (→ #32) ni el **mapa geográfico real** ni las zonas
  de distribución reales (→ #27).
- **No** se crean las otras páginas de primer nivel (colaboradores, contacto): solo se reserva
  el espacio moviendo el detalle bajo `/aves/`.
- **No** hay backend ni endpoint: la página es estática (ADR-0005/0014).
- **No** se habilita el grupo anfibios/reptiles (Fase 2).

## Capabilities

### New Capabilities
- `catalogo-detalle`: la ficha de detalle por especie en `/aves/[slug]` (estática): secciones
  de la ficha, carrusel/lightbox con créditos, OpenGraph por especie y especies relacionadas.

### Modified Capabilities
- `esquema-ficha-fauna`: añade los campos opcionales `autoridad`, `otrosNombres[]`,
  `envergadura`, `mejorHora` (aditivo); documenta el uso de `medidas`/`habitat`/`temporada`.
- `migracion-fauna`: el script mapea las columnas Tier B nuevas del CSV (texto y multivalor `;`).
- `catalogo-busqueda`: el enlace de la tarjeta de resultado pasa de `/<slug>` a `/aves/<slug>`.

## Impact

- **Sub-dominios:** `aves` (catálogo) y `foundation` (esquema, migración).
- **Código:** nueva ruta `app/aves/[slug]/page.tsx` + `generateStaticParams`/`generateMetadata`;
  componentes de detalle en `components/ficha/`; util de parseo de secciones en `lib/`;
  `lib/search.ts` (href); `lib/content.ts`/`fauna-schema.ts` (4 tipos nuevos);
  `scripts/migrar-fauna.py` (mapeos Tier B).
- **Contenido:** `content/fauna/_origen/aves-especies.csv` gana columnas Tier B (las llena el
  experto); las fichas se regeneran cuando lleguen; `content/README.md` y `_ejemplo.md` documentan.
- **Referencia de diseño:** `docs/design/buscar-aves/project/components/` (ya en el repo).
- **Desbloquea:** cierra #13; deja las fichas como fuente para #14 (PDF). Relación con #27
  (mapa) y #32 (audio).
