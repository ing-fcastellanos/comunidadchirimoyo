## Why

`/busqueda` es hoy un stub «Próximamente». Con la herpetofauna ya expuesta (detalle #92, distribución #93, índice de grupo #84) falta la superficie de **descubrimiento cross-grupo**: un buscador general sobre las 76 especies. #85 (parte de #81/#17, ADR-0024; respeta ADR-0005/0006: 100% cliente, sin endpoint) lo construye.

La exploración reconcilió el issue con la realidad: el buscador de aves **ya** vive en `/aves/buscador` (no había que "trasladarlo"), `Especie.group` ya existe (rename de #84) y `filterAndSort`/`EspecieCard` ya son group-agnostic. Lo único que falta es la **página general** y su panel de filtros del núcleo común.

Sub-dominio afectado: **aves** (catálogo de fauna). Sin impacto en sitio, voluntarios ni api.

## What Changes

- **`/busqueda` pasa a ser el buscador general** sobre los 3 grupos: reemplaza el stub `Proximamente` por una página estática que carga las 76 fichas en build y monta un buscador 100% cliente.
- **`BuscadorGeneral` (nuevo, client)** standalone: reutiliza `filterAndSort`, `ResultsBar`, `EspecieCard`, los pills de filtros activos y `EmptyState`; monta un **panel reducido** propio (`PanelGeneral`).
- **Panel del núcleo común** (ADR-0025): `texto · grupo · orden · familia · presencia · conservación · ocurrencia`. **Sin** filtros aviares (forma/talla/color/dónde/gremios/quick-presets).
- **Faceta de grupo** con atajo **«herpetofauna»** (anfibios + reptiles); aprovecha `Especie.group`.
- **`lib/search.ts`:** añadir `grupos: string[]` a `Filters` y la cláusula de filtro por grupo en `filterAndSort` (aditivo; no altera el buscador de aves). Extraer a un módulo compartido las piezas hoy internas de `BuscadorAves` (`ResultsBar`, `EmptyState`, helpers de pills) para reusarlas sin tocar el de aves.
- **Sitemap:** incluir `/busqueda` (deja de ser stub).
- **No** se construyen buscadores especializados de herps (`/anfibios/buscador`, `/reptiles/buscador`): la grilla de #84 ya cubre explorar 8/4 especies; el criterio 6 del issue queda **cubierto por #84**.
- **Hub de la home (`/`) refleja la fauna real** (parte de #83, incluida aquí para que la spec de `catalogo-hub-fauna` deje de contradecir la realidad): las **tarjetas de grupo** se activan por su conteo de fichas (anfibios y reptiles dejan de ser «próximamente», con conteo + enlace + ícono del grupo); el **hero** del hub ofrece 3 CTAs —**Buscar aves** (`/aves/buscador`) y **Búsqueda general de especies** (`/busqueda`) en verde primario, **Conoce la comunidad** en blanco— y el `Hero` se generaliza de `primary`/`secondary` a una lista `ctas[]`. Se corrige el copy stale del hero ("pronto, anfibios y reptiles").

## Capabilities

### New Capabilities
_(ninguna)_

### Modified Capabilities
- `catalogo-busqueda`: nuevo requisito de **buscador general en `/busqueda`** (multi-grupo, filtros del núcleo común + faceta de grupo, 100% cliente, enlaza a `/<grupo>/<slug>`). Se ajusta el requisito existente que reservaba `/busqueda` como stub.
- `catalogo-hub-fauna`: **Tarjetas de grupo con estado** (activas por conteo de fichas, no hardcodeadas), **Acceso a búsqueda desde el hub** (hero con acceso al general + aves) y **Páginas placeholder** (solo grupos sin fichas). De paso se corrige el drift de #84: `/anfibios` y `/reptiles` ya no son placeholders (son índices reales).

## Impact

- **Código (aves):** `app/busqueda/page.tsx` (stub → server page del general), nuevo `components/search/BuscadorGeneral.tsx` + `PanelGeneral.tsx`, módulo compartido extraído de `BuscadorAves` (`ResultsBar`/`EmptyState`/pills), `lib/search.ts` (`Filters.grupos` + filtro), `app/sitemap.ts`. **Hub:** `components/home/GruposFauna.tsx` (tarjetas group-aware por conteo), `components/home/Hero.tsx` (`ctas[]`), `app/page.tsx` (conteos + 3 CTAs + copy), `app/[grupo]/page.tsx` (landing de aves migrado a `ctas[]`, sin cambio visual).
- **Datos/esquema:** ninguno — `fichaToEspecie` y `Especie.group` ya están.
- **Dependencias:** ninguna.
- **Visible para el usuario:** `/busqueda` busca en toda la fauna por núcleo común y grupo; deja de ser «Próximamente».

## No-goals

- No construye buscadores **especializados** de anfibios/reptiles (cubierto por la grilla de #84).
- No toca el **buscador de aves** (`/aves/buscador`) salvo extraer piezas compartidas, sin cambiar su comportamiento.
- No completa el resto del **hub** `/` (#83): solo activa las tarjetas de grupo por conteo y ajusta los CTAs del hero para que reflejen las superficies ya reales; el carrusel, destacados y demás siguen siendo trabajo de #83.
- No añade filtros **aviares** al general ni endpoint de búsqueda (sigue 100% cliente, ADR-0005).
- No cambia el **esquema** ni los **datos**.
