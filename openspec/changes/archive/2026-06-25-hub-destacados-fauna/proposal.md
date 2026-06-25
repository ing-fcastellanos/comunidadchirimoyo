## Why

El hub de fauna (`/`) ya presenta el carrusel, las tarjetas de grupo y el acceso a búsqueda, pero le falta el último criterio de #83: una sección de **especies destacadas**. Hoy el campo `featured` existe en el esquema de ficha y en el buscador («Destacadas del autor»), pero **ninguna ficha lo usa** (0 de 76), así que la señal está muerta. Esta sección le da un escaparate cross-grupo a las especies con historia propia en la laguna y, de paso, activa `featured` como única fuente de verdad ya consumida por el buscador.

## What Changes

- **Marcar 6 fichas como `featured: true`** en su `index.md`, balanceadas por grupo: aves (`psarocolius-montezuma`, `egretta-thula`, `nannopterum-brasilianum`), anfibios (`bolitoglossa-platydactyla`, `lithobates-berlandieri`), reptiles (`thamnophis-proximus`).
- **Nueva sección «Especies destacadas del humedal»** en la home, ubicada **antes de `CierreCTA`** (después de `ElHumedal`). Server Component que deriva las destacadas de `getAllFichas().filter(f => f.featured)` —sin hardcodear slugs en el componente— y las presenta como tarjetas que enlazan al detalle `/<grupo>/<slug>`.
- **Reusar `EspecieCard`** (ya presentacional, sin `"use client"`) para las tarjetas, alimentándolo desde el mismo data-layer que usa el buscador.
- **Enlace «Ver todas → `/busqueda`»** en el encabezado de la sección, reforzando la entrada al buscador general (criterio 2 de #83).
- Cierra **#83** (último criterio pendiente del hub).

## No-goals

- **No** se toca el carrusel del hero ni `HERO_SLUGS` (sigue siendo escaparate visual de aves). `egretta-thula` aparecerá en hero **y** destacados; aceptado como redundancia deliberada.
- **No** se introduce un endpoint ni búsqueda en servidor: la home sigue 100% estática (ADR-0005).
- **No** se cambia el orden de las demás secciones (`Hero → GruposFauna → ElHumedal → [Destacadas] → CierreCTA`).
- **No** se añade un campo nuevo al esquema: `featured` ya existe.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `catalogo-hub-fauna`: nuevo requirement «Especies destacadas del humedal» — el hub SHALL mostrar una sección de especies destacadas derivada de fichas con `featured: true`, cross-grupo, enlazando al detalle y a `/busqueda`.

## Impact

- **Sub-dominio afectado:** aves (catálogo, `fauna.chirimoyo.org`).
- **Contenido:** `content/fauna/{aves,anfibios,reptiles}/<slug>/index.md` — añadir `featured: true` a 6 fichas.
- **Código (`apps/catalogo`):** nuevo `components/home/DestacadasFauna.tsx`; `app/page.tsx` (deriva destacadas y monta la sección); posible adaptador ficha→`Especie` para `EspecieCard` si el data-layer del hub no expone ya el shape de búsqueda.
- **Sin cambios** en API, esquema de ficha, ni convenciones documentadas → **no requiere ADR**.
