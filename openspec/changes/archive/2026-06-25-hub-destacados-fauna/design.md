## Context

El hub (`/`) ya monta `Hero → GruposFauna → ElHumedal → CierreCTA` (todo Server Component, estático). Falta el criterio 2 de #83: especies destacadas. La infraestructura ya está casi toda:

- El esquema de ficha tiene `featured?: boolean` (`fauna-schema.ts`).
- `lib/search.ts` exporta `fichaToEspecie(f): Especie` y `Especie` ya incluye `featured`, `img` (thumb), `href` (`/<grupo>/<slug>`), categoría, presencia, etc.
- `components/search/EspecieCard.tsx` es **presentacional puro** (sin `"use client"`), consume un `Especie` y ya se reusa en `/busqueda` y en los índices de grupo (`IndiceGrupo`).
- Hoy **0 de 76** fichas tienen `featured: true`; el chip «Destacadas del autor» del buscador queda sin efecto hasta marcarlas.

## Goals / Non-Goals

**Goals:**
- Sección «Especies destacadas del humedal» en la home, antes de `CierreCTA`.
- Destacadas derivadas del contenido (`featured: true`), no de slugs hardcodeados en el componente.
- Reusar `EspecieCard` + `fichaToEspecie`; cero duplicación de view-model.
- Activar `featured` como única fuente de verdad, compartida con el buscador.
- Mantener la home 100% estática y Server Component.

**Non-Goals:**
- Tocar el carrusel del hero / `HERO_SLUGS`.
- Nuevo campo de esquema, endpoint, o ADR.
- Orden o curaduría configurable en runtime.

## Decisions

**D1 — Fuente: `featured: true` en frontmatter (no lista de slugs).**
`app/page.tsx` ya carga `getAllFichas()`; deriva `const destacadas = fichas.map(fichaToEspecie).filter(e => e.featured)` y lo pasa a la sección. Una sola señal, la misma que consume el buscador. *Alternativa descartada:* array `DESTACADAS_SLUGS` análogo a `HERO_SLUGS` — sería una segunda lista de curaduría que mantener, contradice el criterio «derivado del contenido».

**D2 — Orden determinista.** El orden de `getAllFichas()` no es semánticamente curado. Para que la fila no dependa del orden de lectura del FS, la sección ordena las destacadas por un **índice explícito**: se define el orden deseado por slug en el componente (o se ordena alfabético estable). Se elige un orden por slug fijo (psarocolius, egretta, nannopterum, bolitoglossa, lithobates, thamnophis) para intercalar grupos visualmente. Esto **ordena**, no **selecciona** — la selección sigue saliendo de `featured`. Slugs en `featured` que no estén en la lista de orden caen al final, estables por nombre común.

**D3 — Reuso de `EspecieCard`.** La sección es un wrapper (`Section` + encabezado + grid) que mapea `destacadas` a `<EspecieCard>`. Sin variante nueva de tarjeta. `img` usa `thumb` (suficiente para la grilla, ya lo hace el buscador).

**D4 — Ubicación: entre `ElHumedal` y `CierreCTA`.** Es el punto más abajo sin dejar contenido bajo la banda oscura de cierre (que contiene los PDFs). Ritmo visual: tarjetas claras → banda mint → tarjetas claras → banda oscura.

**D5 — Encabezado con «Ver todas → /busqueda».** Refuerza el criterio 2 (entrada visible a búsqueda) desde la propia sección de destacadas, además del CTA del hero.

## Risks / Trade-offs

- **`egretta-thula` aparece dos veces** (hero + destacadas) → aceptado en el proposal como redundancia deliberada; la garza es emblemática. Mitigación disponible si molesta: quitarla de una de las dos listas, sin cambio de diseño.
- **Sección vacía si nadie marca `featured`** → este cambio marca 6 fichas, así que arranca poblada. Defensa: si `destacadas.length === 0`, la sección **no se renderiza** (no deja un hueco con encabezado y grid vacío).
- **Grid con 6 tarjetas en móvil** → `EspecieCard` ya es responsive en `/busqueda`; se reusa su grilla (1/2/3 col). Sin riesgo nuevo.

## Migration Plan

Sin migración de datos ni runtime: es contenido (frontmatter) + un componente. Deploy normal de `apps/catalogo` (build estático). Rollback = revertir el commit; las 6 fichas pierden `featured` y la sección desaparece (se auto-oculta al quedar vacía).

## Open Questions

Ninguna abierta. La lista de 6 destacadas y la ubicación quedaron confirmadas con el usuario.
