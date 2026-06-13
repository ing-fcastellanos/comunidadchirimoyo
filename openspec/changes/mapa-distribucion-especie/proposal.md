## Why

La ficha de detalle muestra hoy un **mapa esquemático placeholder** (silueta de Norteamérica dibujada a mano + un punto), con el caption "geografía detallada por especie: pendiente". El handoff de diseño prototipó zonas como **bandas latitudinales** (mitad norte = cría, mitad sur = invernada), que no escalan a cientos de especies ni distinguen, p. ej., una especie del Pacífico de una del Golfo. El spike #27 cerró la dirección: **geografía real + zonas curadas por especie**, render estático, libre de licencias restrictivas. Toca aterrizarlo: definir el formato de zona, generar el mapa base y renderizar el mapa real por especie.

Sub-dominios afectados: **aves** (esquema, ficha de detalle) y **foundation** (nuevo ADR de mapa + asset de geografía).

## What Changes

- **Esquema de ficha:** se añade el campo **opcional y aditivo** `distribucion?: { cria?, invernada?, residente?, notas? }`, donde cada zona es una lista de códigos **ISO 3166-1 alpha-2** (Natural Earth admin-0). No es breaking: las fichas sin `distribucion` siguen válidas.
- **Mapa base precomputado:** un script genera, **una sola vez**, un asset commiteado (`apps/catalogo/lib/mapa-americas.ts`) a partir de **Natural Earth admin-0 1:110m** (dominio público): recorta al encuadre **Norte + Centroamérica + Caribe (+ norte de Sudamérica)**, proyecta (equirectangular) y simplifica a `{ outline, regions: { <ISO>: path } }`. El build de Next **no** incorpora librerías geo.
- **Render real (estático):** la `DistribucionSec` renderiza geografía real + marcador fijo de la laguna **siempre**; pinta `regions[code]` en tonos cría/invernada/residente cuando hay curaduría; la leyenda se deriva de `estatusMigratorio`. Sin curaduría, ancla en México sin inventar un rango multipaís. Reemplaza el placeholder `MapaEsquematico`.
- **Prototipo de validación:** se cura `distribucion` para 2 especies — `botaurus-lentiginosus` (migratoria-invierno, dos zonas) y `aramides-albiventris` (residente, una zona).
- **Evaluación GBIF:** se prueba una capa **opcional** de puntos de ocurrencia GBIF con atribución, con **criterio de corte** explícito (si mete ruido visual o fricción de atribución/peso, se descarta y se documenta). No es la base del mapa.
- **ADR nuevo:** formaliza el enfoque (geografía real + zonas curadas por país, estático, Natural Earth).

### No-goals

- **No** se introducen tiles, proveedores de mapas ni JS de cliente para el mapa (fiel a ADR-0005/0014).
- **No** se usa IUCN/eBird (licencia restringida) ni GBIF **como base** (solo capa opcional a evaluar).
- **No** se cura `distribucion` para las 63 especies ahora: curaduría mínima (2 del prototipo); el resto cae al render por defecto (geografía + marcador + leyenda por estatus).
- **No** granularidad sub-país (admin-1 / estados) en esta iteración; queda como extensión futura.
- **No** se afirman rangos finos que no podamos respaldar con fuente abierta.

## Capabilities

### New Capabilities

- `mapa-distribucion`: generación del asset de mapa base (Natural Earth → asset commiteado), el modelo de render del mapa de distribución por especie (relleno de regiones por ISO, marcador local, leyenda derivada de `estatusMigratorio`, fallback sin curaduría) y la evaluación de la capa opcional GBIF con criterio de corte.

### Modified Capabilities

- `esquema-ficha-fauna`: se añade el campo opcional `distribucion` (zonas como listas de códigos ISO) al esquema de la ficha y a los tipos del loader.

## Impact

- **Código:** `apps/catalogo/lib/fauna-schema.ts` (interface `Distribucion` + campo), `apps/catalogo/lib/content.ts` (lectura), `apps/catalogo/lib/mapa-americas.ts` (asset generado), `apps/catalogo/components/ficha/secciones.tsx` (`DistribucionSec` real, retira `MapaEsquematico`).
- **Tooling:** nuevo script generador del mapa base (Natural Earth → asset); dependencia de datos Natural Earth (no se versiona el crudo, solo el asset derivado).
- **Contenido:** bloque `distribucion:` en 2 fichas del prototipo (`botaurus-lentiginosus`, `aramides-albiventris`).
- **Docs:** nuevo `docs/decisions/00NN-mapa-distribucion-geografia-real.md` + índice; recomendación del spike escrita en el proposal/design.
- **Issue:** cierra #27 (spike: valida el enfoque, deja prototipo + recomendación + esquema).
