## Context

La `DistribucionSec` ([secciones.tsx](apps/catalogo/components/ficha/secciones.tsx)) renderiza hoy `MapaEsquematico`: una silueta de Norteamérica dibujada a mano (un `path` fijo) + un punto para la laguna, con caption "geografía detallada por especie: pendiente". El handoff ([Distribution.jsx](docs/design/buscar-aves/project/components/Distribution.jsx)) pintaba zonas como **bandas latitudinales** clipadas a la silueta (norte = cría, sur = invernada) — evocador para el avetoro pero sin escalar.

El spike #27 fijó la dirección (geografía real + zonas curadas, estático, sin licencias restrictivas) y este cambio la aterriza. Restricciones: catálogo 100% estático (ADR-0005), export sin optimizador (ADR-0014), i18n-ready (ADR-0011). Dato ya existente y aprovechable: `estatusMigratorio` (residente / migratoria-invierno / migratoria-verano / transitoria) describe el rol del **sitio local**, no el rango.

## Goals / Non-Goals

**Goals:**
- Reemplazar el placeholder por un mapa de **geografía real** de las Américas (encuadre Norte+Centro+Caribe).
- Modelo de zona **escalable** (listas de códigos ISO) y **libre de licencias** (Natural Earth, dominio público).
- Render **estático**, sin geo libs en el build de Next ni JS de cliente.
- Curaduría **mínima**: `distribucion` opcional; render por defecto honesto sin ella.
- Validar con un prototipo de 2 especies (un migratorio, un residente) y evaluar GBIF con criterio de corte.

**Non-Goals:**
- Tiles / proveedores de mapas / interactividad en cliente.
- IUCN/eBird (licencia) ni GBIF como capa base.
- Curaduría de las 63 fichas ahora; granularidad sub-país (admin-1).
- Afirmar rangos finos sin fuente abierta.

## Decisions

### D1 — Formato de zona: países (ISO 3166-1 alpha-2), no bandas ni polígonos
`distribucion?: { cria?: string[]; invernada?: string[]; residente?: string[]; notas?: string }`. Cada lista son códigos ISO que se rellenan sobre los polígonos de Natural Earth admin-0.
- **Por qué:** es el estándar de las guías de campo (regiones sombreadas), escalable (solo datos), checkable y libre. Las **bandas latitudinales** no distinguen Pacífico/Golfo y rompen con residentes; los **polígonos a mano** no escalan.
- **Tradeoff aceptado:** granularidad de país sobredimensiona ("todo MX" aunque sea costero). Se acepta a cambio de escala/licencia; admin-1 queda como extensión futura aditiva.

### D2 — Mapa base precomputado a un asset commiteado
Un script generador (una vez, fuera del build de Next) lee Natural Earth admin-0 1:110m, recorta al bbox del encuadre, **proyecta equirectangular**, simplifica y emite `apps/catalogo/lib/mapa-americas.ts` = `{ outline: string, regions: Record<ISO, string> }` (paths SVG), commiteado (pocos KB).
- **Por qué:** mantiene el build de Next sin dependencias geo y el SVG por página diminuto (solo rellena por id). Equirectangular es trivial y suficiente para un mapa estilizado; un cónico (Albers) se ve mejor pero añade complejidad — se descarta por ahora.
- El crudo de Natural Earth **no** se versiona; sí el asset derivado (análogo a cómo las imágenes viven fuera del repo, ADR-0016).

### D3 — Render: geografía + marcador siempre; zonas si hay curaduría; leyenda por estatus
La `DistribucionSec` (Server Component) pinta el `outline`, superpone el marcador fijo de la laguna, y si la ficha trae `distribucion`, rellena `regions[code]` en tonos **forest (cría) / mint (invernada) / teal (residente)**. La leyenda se compone desde `estatusMigratorio`. **Sin `distribucion`**, no se inventa rango: se muestra geografía + marcador + etiqueta de estatus, anclado en México.
- **Por qué:** cubre las 63 desde el día uno con curaduría cero, y es honesto (no afirma países sin fuente).

### D4 — GBIF como capa opcional a evaluar, con criterio de corte
Se prototipa una capa de puntos GBIF (ocurrencias, snapshot en build, con atribución). **Criterio de corte:** se adopta solo si (a) la atribución/licencia del dataset es compatible y redistribuible estáticamente, (b) no añade peso/fricción desproporcionados, y (c) aporta señal sin ruido visual. Si falla, se documenta el descarte en el ADR. No bloquea el resto del cambio.

### D5 — Nuevo ADR-0018
Formaliza el enfoque (geografía real + zonas curadas por país, estático, Natural Earth) y registra el veredicto GBIF. Actualiza `docs/adr/_index.md`.

## Risks / Trade-offs

- **Granularidad de país sobredimensiona el rango** → se acota con `notas` y la prosa de `## Distribución`; admin-1 futuro si se necesita.
- **Proyección equirectangular distorsiona latitudes altas** → aceptable para un mapa estilizado con encuadre acotado; el norte de Canadá apenas aparece.
- **Asset desincronizado de Natural Earth** → el generador es idempotente y reproducible; se documenta la versión/fuente usada.
- **GBIF no concluyente** → criterio de corte explícito (D4) evita que el spike se atasque; el mapa funciona sin esa capa.
- **Curaduría mínima = mapas casi iguales para especies sin curar** → honesto por diseño; el valor crece al curar. Se acepta.

## Migration Plan

1. Generar el asset `mapa-americas.ts` (script + Natural Earth, encuadre Norte+Centro+Caribe).
2. Extender el esquema (`Distribucion` en fauna-schema.ts + tipos en content.ts) — aditivo.
3. Implementar `DistribucionSec` real (relleno por ISO + marcador + leyenda por estatus); retirar `MapaEsquematico`.
4. Curar `distribucion` en las 2 fichas del prototipo.
5. Evaluar GBIF (D4) y registrar veredicto.
6. ADR-0018 + índice. `npm run typecheck`/`build` del catálogo y `openspec validate`.

**Rollback:** `distribucion` es opcional y el render es tolerante; revertir el frontend deja las fichas válidas. El asset y el ADR no estorban si no se referencian.
