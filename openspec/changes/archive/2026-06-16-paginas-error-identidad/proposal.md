## Why

Hoy `apps/sitio` y `apps/catalogo` muestran las pantallas de 404 y error por defecto de Next.js: ajenas a la identidad del proyecto y sin salida amable para la persona usuaria. Esto rompe la coherencia de marca en cualquier URL rota o fallo inesperado, y deja al visitante sin rutas claras de regreso al ecosistema (chirimoyo.org, comunidad, voluntarios, aves). Ya existe el handoff de diseño v0.dev (`PantallasError.jsx`), así que es el momento de portarlo. Cierra el issue #58 (épica #18, Fase 3 — Presencia).

## What Changes

- Nuevas páginas **404 (not-found)** y **error** con identidad del proyecto en **`apps/sitio`** (`app/not-found.tsx`, `app/error.tsx`).
- Las mismas dos páginas, **mismo diseño genérico**, en **`apps/catalogo`** (`app/not-found.tsx`, `app/error.tsx`).
- Portado del handoff v0.dev (`PantallasError.jsx`): ilustración SVG inline de juncos del humedal con un ave (en vuelo para 404, posada/terracota para error), titular serif, botón pill primario y enlaces secundarios.
- El 404 ofrece enlaces **genéricos al ecosistema** (inicio + guía de aves + comunidad) vía la `lib/links.ts` de cada app; sin adaptación por host (no requiere middleware).
- El `error.tsx` es Client Component (`"use client"`) y cablea el botón "Intentar de nuevo" al callback `reset()` que inyecta Next.
- Ambas heredan Header/Footer del `layout.tsx` existente: el contenido es un bloque centrado (`min-h-[60vh]`, fondo transparente), no redefine la barra ni el pie.
- Adaptación a las convenciones del repo: colores vía tokens existentes (no hardcodear fuera de `tokens.css`/`globals.css`), utilidades de peso de fuente estándar de Tailwind (`font-semibold`/`font-bold` en vez de `font-600`/`font-700` del prototipo).

## No-goals

- **No** se adapta el contenido del 404 por subdominio (mismo texto en sitio/comunidad/voluntarios); eso requeriría `headers()` + middleware (ADR-0008) y queda fuera de alcance.
- **No** se crea `global-error.tsx` (errores del propio layout raíz); solo el `error.tsx` por ruta.
- **No** se introduce un paquete de UI compartido: el componente se duplica a propósito en cada app (coherente con ADR-0001, sin workspaces).
- **No** se toca el API ni el contenido (`content/`).

## Capabilities

### New Capabilities
- `paginas-error-sitio`: comportamiento de las pantallas 404 y error con identidad de marca, navegación de regreso, accesibilidad y responsividad, compartido por `apps/sitio` y `apps/catalogo`.

### Modified Capabilities
<!-- Ninguna: no cambian requisitos de capacidades existentes. -->

## Impact

- **Sub-dominios afectados:** sitio, comunidad, voluntarios (vía `apps/sitio`) y aves (vía `apps/catalogo`). API y foundation no se tocan.
- **Código nuevo:** `apps/sitio/app/not-found.tsx`, `apps/sitio/app/error.tsx`, `apps/catalogo/app/not-found.tsx`, `apps/catalogo/app/error.tsx`, y un componente de ilustración/bloques reutilizable dentro de cada app (p. ej. `components/error/`).
- **Reutiliza:** `app/tokens.css` (paleta idéntica entre ambas apps), `lib/links.ts`, `layout.tsx` (Header/Footer), fuentes `serif`/`sans`.
- **Sin nuevas dependencias** y **sin ADR** (no rompe convenciones; el "genérico único duplicado" se alinea con ADR-0001 y ADR-0008).
- **Diseño:** consume el handoff v0.dev `PantallasError.jsx` del bundle de Claude Design.
