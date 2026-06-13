## Why

Hoy `aves.chirimoyo.org/` deja caer al visitante directamente en el buscador, sin contexto de qué es el sitio ni por qué existe. Falta una página de entrada que, en los primeros 10 segundos, comunique **qué** es (un catálogo de la fauna del humedal), **por qué** existe (una comunidad que defiende el humedal del Chirimoyo) y **qué hacer** (explorar el catálogo). El diseño v0.dev ya está entregado y validado.

## What Changes

- **BREAKING (ruta):** El buscador deja de vivir en `/` y se muda a `/busqueda`. Es una mudanza del componente: conserva su encabezado actual ("Guía de Aves" + conteo de especies) y su comportamiento de búsqueda en cliente. Cambio de ruta **limpio, sin redirects**.
- **Nuevo landing en `/`** con cuatro secciones del diseño v0:
  - **Hero** — eyebrow de ubicación, H1 serif, subtítulo, CTA primario *Explorar el catálogo* (→ `/busqueda`), CTA secundario *Conocer la comunidad* (→ comunidad.chirimoyo.org), imagen del avetoro.
  - **Qué hay aquí** — 3 tarjetas: conteo **dinámico** de aves, anfibios/reptiles, fichas con fuentes verificadas.
  - **El humedal** — banda breve (mint-wash) con 2 frases y enlace a la comunidad. Mención breve, sin duplicar el relato de comunidad.chirimoyo.org.
  - **Cierre** — banda pine-deep con botón *Ir al catálogo* (→ `/busqueda`).
- **Header** — agregar enlace *Buscar especies* (píldora en escritorio, botón de icono en móvil) para que siempre haya acceso al buscador desde el landing y las fichas.
- El **conteo de aves** se deriva de `getAllFichas()` en build, **no** se hardcodea.

## Capabilities

### New Capabilities
- `landing-catalogo`: La página de inicio del catálogo (`/`): estructura, secciones, copy, CTAs y conteo dinámico que comunican el propósito del sitio en 10 segundos.

### Modified Capabilities
- `catalogo-app`: El requisito "Layout y metadata del catálogo" cambia — `/` ya NO renderiza la pantalla de búsqueda; ahora renderiza el landing. Se agrega el enlace a `/busqueda` en el Header.
- `catalogo-busqueda`: La pantalla de búsqueda + resultados se sirve en `/busqueda` en lugar de `/`.

## No-goals

- No se rediseña el buscador ni su lógica de filtros — solo cambia su ruta.
- No se desarrolla el relato completo de la comunidad aquí; eso vive en comunidad.chirimoyo.org. El landing solo lo menciona y enlaza.
- No se introducen redirects de la ruta vieja `/` → `/busqueda`.
- No se toca el API ni el contenido de las fichas.

## Impact

- **Sub-dominios afectados:** aves (apps/catalogo). Enlaces salientes a comunidad (comunidad.chirimoyo.org).
- **Código:**
  - `apps/catalogo/app/page.tsx` — pasa de buscador a landing.
  - `apps/catalogo/app/busqueda/page.tsx` — nuevo; recibe el contenido actual de `page.tsx`.
  - `apps/catalogo/components/home/` (nuevo) — `Hero`, `QueHayAqui`, `ElHumedal`, `CierreCTA`.
  - `apps/catalogo/components/layout/Header.tsx` — enlace "Buscar especies".
  - `apps/catalogo/public/` — imagen del hero (`avetoro`).
- **Specs:** `catalogo-app` y `catalogo-busqueda` (deltas), nueva `landing-catalogo`.
- **Sin nuevas dependencias.** Reutiliza tokens, `Section`, `Icon`/`lucide-react` y fuentes existentes. No requiere ADR (no rompe convención documentada; el catálogo sigue 100% estático y la búsqueda sigue en cliente).
