## Context

`apps/sitio` sirve los 3 subdominios con un `Header`/`Footer` compartidos (`components/layout/`),
hoy del scaffold. El landing ya usa `lib/links.ts` (`COMUNIDAD_URL`/`VOLUNTARIOS_URL`/`AVES_URL`)
para enlazar al ecosistema, pero el Header usa rutas relativas. Existe handoff v0.dev:
`HeaderEcosistema.jsx` (cliente, drawer móvil accesible) y `FooterEcosistema.jsx` (server, por
props). `content/landing/enlaces.json` ya tiene `sitios`, `redes`, `contacto`, `ubicacion`.

## Goals / Non-Goals

**Goals:**
- Nav del Header coherente y cross-subdominio (URLs absolutas), con menú móvil accesible.
- Footer del ecosistema desde `enlaces.json` con redes y enlaces legales.
- Portar el handoff v0.dev a TS + tokens + wrapper `Icon`, sin colores hex sueltos.

**Non-Goals:**
- Crear `/privacidad` (#56); tocar `middleware.ts`; estado "activo" de nav.

## Decisions

### D1 — Header: Server Component + subcomponente cliente `MobileNav`
La estructura del Header (logo, nav de escritorio) se mantiene **Server Component**; el menú
móvil (estado del drawer) se aísla en un componente **`"use client"`** (`MobileNav`) que recibe
los enlaces. Así solo lo interactivo es cliente.
- **Por qué**: minimiza el JS de cliente; el resto del header es estático.
- **Alternativa**: todo el Header cliente (como el JSX de v0.dev). Más simple de portar, pero
  manda al cliente lo que no lo necesita. Se prefiere aislar.

### D2 — Enlaces desde `lib/links.ts`, logo → `/`
La nav (escritorio y drawer) usa `COMUNIDAD_URL`/`VOLUNTARIOS_URL`/`AVES_URL` de `lib/links.ts`,
no URLs hardcodeadas en el componente. El **logo enlaza a `/`** (inicio del sitio actual), no a
comunidad (el handoff de v0.dev lo apuntaba a comunidad; se corrige).
- **Por qué**: un solo origen de URLs (ya usado por Hero/Cierre/Linktree); coherencia. Caveat
  aceptado: los enlaces absolutos no se navegan en local (salen a producción) y dependen del
  deploy de subdominios (#53) — válido porque el ecosistema es por subdominios (ADR-0008).

### D3 — Footer desde `enlaces.json` (Server Component)
`Footer` lee `getEnlaces()` (data-layer, build) y pasa `sitios`/`redes`/`contacto`/`ubicacion`
al componente portado. Los **legales** se arman en código: `/privacidad`, `/aliados`, `/galeria`.
- **Por qué**: fuente de verdad única (ADR-0004); añadir una red = editar `enlaces.json`.

### D4 — Enlace a `/privacidad` al vacío
El footer enlaza a `/privacidad` aunque la página no exista aún (cae en 404 hasta #56).
- **Por qué**: decisión del equipo; el link queda sembrado y #56 solo crea la página.

## Risks / Trade-offs

- **Enlaces absolutos en local** → la nav del header sale del dev server. Mitigación: aceptado;
  los destinos (comunidad/voluntarios) son placeholders hasta #19/#53 de todos modos.
- **404 temporal en `/privacidad`** → hasta #56. Mitigación: es intencional y acotado.
- **`new Date().getFullYear()` en el Footer** (año del copyright) → en Server Component se
  evalúa en build/request; aceptable (no es contenido crítico). Si molestara en prerender,
  fijar el año en contenido.
