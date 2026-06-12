## Why

El catálogo tiene 63 fichas migradas (#10) y un loader real, pero `aves.chirimoyo.org`
todavía muestra una home placeholder. El equipo entregó un **handoff de diseño de Claude
Design** (`docs/design/buscar-aves/`) que define la pantalla central de la Fase 1: una
**búsqueda + resultados** integrada. Es una sola pantalla que cubre dos issues —
**#11 (listado/resultados)** y **#12 (buscador)** — porque el panel de búsqueda y el grid
de resultados viven juntos y comparten el mismo filtrado en cliente. Además, el experto ya
clasificó las 63 especies con los 5 rasgos visuales que la búsqueda para principiantes
necesita, así que el diseño es 100% implementable.

## What Changes

- **Pantalla de búsqueda + resultados** en `apps/catalogo`, recreando el handoff
  (`docs/design/buscar-aves/`) en React/Next sobre el sistema de diseño existente:
  - Panel en acordeón de **2 secciones**: *Búsqueda detallada* (texto+autocomplete, forma,
    tamaño, color, dónde, + filtros avanzados de categoría/orden/familia/presencia/
    conservación) y *Selecciones rápidas* (tarjetas que aplican varios filtros).
  - **Resultados** en grid o lista (`BirdCard`), barra sticky con conteo + orden + vista,
    *pills* de filtros activos removibles, y **estado vacío**.
  - **Filtrado 100% en cliente** sobre los datos embebidos en build (ADR-0005). Sin API.
- **5 campos de búsqueda visual** (`forma`, `tamano`, `colores[]`, `donde`, `featured`)
  añadidos al esquema (aditivo), al CSV de origen (ya llenos por el experto) y a las 63
  fichas vía el script de migración.
- **Diccionario de UI** (id→etiqueta/icono/color para forma/tamaño/color/dónde/categoría/
  presencia/observación + selecciones rápidas), portado del handoff a un módulo TS en la app.
- La **home** del catálogo deja de ser placeholder y sirve esta pantalla.

### No-goals

- **No** se introduce backend ni endpoint de búsqueda: sigue 100% estática y en cliente
  (ADR-0005). El filtrado es sobre datos del build.
- **No** se construye la **página de detalle** de especie (#13): la card solo enlaza a
  `/<slug>`; esa ruta la implementa #13.
- **No** entra el **PDF** (#14) ni el **deploy** a producción (#15).
- **No** se habilita el grupo **anfibios/reptiles** (Fase 2, #17); solo aves.
- **No** se rediseña el esquema #9: los 5 campos son una extensión aditiva y opcional.

## Capabilities

### New Capabilities
- `catalogo-busqueda`: la pantalla integrada de búsqueda y resultados del catálogo
  (estática, filtrado en cliente): panel de 2 secciones, resultados grid/lista con `BirdCard`,
  orden, vista, filtros activos y estado vacío; es la página índice del catálogo.

### Modified Capabilities
- `esquema-ficha-fauna`: añade 5 campos opcionales de búsqueda visual (`forma`, `tamano`,
  `colores[]`, `donde`, `featured`) al frontmatter y a los tipos del loader.
- `migracion-fauna`: el script mapea las 5 columnas nuevas del CSV (split `;` en `colores`,
  parseo de `featured` booleano) validando contra sus vocabularios.
- `catalogo-app`: la página de inicio deja de ser un placeholder y renderiza la pantalla de
  búsqueda + resultados del catálogo.

## Impact

- **Sub-dominios:** `aves` (catálogo) y `foundation` (esquema de contenido, migración).
- **Código:** nuevos componentes de búsqueda/resultados y la página índice en `apps/catalogo`
  (`components/search/*`, etc.); `lib/dictionary.ts` (vocabularios de UI); `lib/content.ts`
  (5 tipos nuevos + `desc` derivado); `scripts/migrar-fauna.py` (5 mapeos).
- **Contenido:** las 63 fichas se regeneran (`--force`) con los 5 campos; `content/README.md`
  y `content/fauna/aves/_ejemplo.md` documentan los campos nuevos.
- **Referencia de diseño:** `docs/design/buscar-aves/` (handoff podado, sin binarios pesados).
- **Dependencias:** `lucide-react` ya está; no se prevén dependencias de runtime nuevas.
- **Desbloquea:** cierra #11 y #12; deja listo el enlace a #13 (detalle) y la fuente para #14 (PDF).
