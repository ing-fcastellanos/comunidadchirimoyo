## Context

`/comunidad` (`app/comunidad/page.tsx`) es hoy un placeholder de scaffold (Server Component sin datos). Existen `getAllNoticias()` (#70, ordena desc + excluye borradores en prod) y `NoticiaCard` (#71). El Header del sitio tiene un nav de **ecosistema** (`NAV = [Comunidad, Voluntarios, Aves]`, rutas relativas + Aves absoluta) con su variante móvil `MobileNav`. El Footer tiene secciones de enlaces (ecosistema, legales, contacto). No hay middleware por host (ADR-0023): las secciones son paths.

## Goals / Non-Goals

**Goals:**
- Mostrar las últimas notas en `/comunidad` y enlazar a noticias desde la navegación.
- Reusar las piezas existentes; cero contenido/dependencias nuevas.

**Non-Goals:**
- Resto de `/comunidad` (#19); seed real (#74); tocar listado/detalle/loader.

## Decisions

**D1 — Bloque "Últimas noticias" en `/comunidad`.** La página pasa a `async`; `const notas = await getAllNoticias()`. Si `notas.length > 0`, renderiza una sección: `SectionTitle` (kicker "Comunidad", "Últimas noticias") + grilla de **`notas.slice(0, 3)`** con `NoticiaCard`, y un enlace **"Ver todas las noticias → /comunidad/noticias"**. Si `notas.length === 0`, **no** se renderiza el bloque (en prod hoy sale oculto; en dev aparece la nota de ejemplo). Se conserva el `h1`/intro; se elimina "Noticias" del texto «próximamente» (Historia · Misión).

**D2 — Enlace en el Header (nav).** Se añade `{ titulo: "Noticias", url: "/comunidad/noticias" }` al `NAV`. Orden propuesto: `Comunidad · Noticias · Voluntarios · Aves` (Noticias junto a Comunidad, por ser su subsección). Llega tanto al nav de escritorio como al `MobileNav` (ambos consumen el mismo `NAV`). Es una ruta relativa (mismo dominio).

**D3 — Enlace en el Footer.** Se añade un enlace "Noticias" (`/comunidad/noticias`) en una sección de enlaces del Footer (junto a los internos/ecosistema), discreto y consistente con el estilo actual.

**D4 — Reuso visual, sin v0.dev.** El bloque usa `Section`/`SectionTitle`/`NoticiaCard` y los tokens; la grilla replica la del listado (1/2/3 col). No se diseña nada nuevo.

**D5 — Ruteo por host: N/A.** Sin middleware (ADR-0023). `/comunidad/noticias` es un path; la cobertura de `comunidad.*` es un vanity 301 del deploy (#53). Nada que implementar en este cambio.

## Risks / Trade-offs

- **Bloque oculto en prod hoy** (0 publicadas) → intencional; aparece al publicar notas (#74). En dev se ve la de ejemplo, validando el render.
- **"Noticias" en el nav de ecosistema** → mezcla una subpágina con secciones top; aceptado por decisión del usuario (máxima visibilidad, ≤1 clic desde cualquier página). El bloque por sí solo ya cumple el criterio desde la portada.
- **MobileNav** → consume el mismo `NAV`, así que el enlace aparece también en móvil sin trabajo extra.

## Migration Plan

Sin migración: edición de una página + dos componentes de layout, consumiendo contenido existente. Deploy normal del sitio. Rollback = revertir el commit (vuelve el placeholder y el nav previo).

## Open Questions

- Ninguna que bloquee. Cantidad de notas en el bloque fijada en 3 (grilla 3-col); ajustable.
