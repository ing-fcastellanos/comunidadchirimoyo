## Why

El `Header` y `Footer` de `apps/sitio` (compartidos por los 3 subdominios vía middleware) son del scaffold y quedan cortos para #55:

- La **nav del Header usa rutas relativas** (`/comunidad`, `/voluntarios`) mientras el resto del landing (Hero, Cierre, Linktree) ya enlaza a los **subdominios absolutos** (`lib/links`). Incoherente y, en producción, lleva a `chirimoyo.org/comunidad` en vez del subdominio canónico (ADR-0008).
- **No hay menú móvil**: a ~380px el logo + título + 3 enlaces no caben.
- El **Footer hardcodea** enlaces, **sin redes sociales** ni enlace al aviso de privacidad.

Con el handoff de v0.dev de `Header Ecosistema` y `Footer Ecosistema` ya disponible, toca portarlos.

## What Changes

- **Header del ecosistema**: nav a **URLs absolutas de subdominio** (`COMUNIDAD_URL`/`VOLUNTARIOS_URL`/`AVES_URL`); en escritorio enlaces en línea, en móvil un **botón hamburguesa** que abre un **drawer accesible** (aria-expanded/controls, cierra con Escape / click fuera / al elegir enlace, focus trap, scroll lock). Componente cliente aislado; el logo enlaza al inicio del sitio (`/`).
- **Footer del ecosistema** alimentado por `content/landing/enlaces.json` (Server Component): bloque de marca + tagline, **redes sociales** (facebook/instagram con íconos), sitios del ecosistema, contacto (email/tel) y "cómo llegar", y una línea **legal** con enlace a **`/privacidad`** (página aún no existe → #56) y a `/aliados`, `/galeria`.

## No-goals

- **No** se crea la página `/privacidad` (es #56); el enlace del footer apunta a `/privacidad` aunque caiga en 404 hasta entonces.
- **No** se rediseñan tokens ni se toca el ruteo por host (`middleware.ts`).
- **No** se añade estado "activo" del sitio actual en la nav (depende del host; se puede sumar luego).

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `sitio-app`: añade el comportamiento del **Header del ecosistema** (nav cross-subdominio absoluta + menú móvil accesible) y del **Footer del ecosistema** (desde `enlaces.json`, con redes y enlaces legales), refinando la requirement existente de layout propio.

## Impact

- **Sub-dominios afectados**: `sitio` (Header/Footer, compartidos por chirimoyo.org / comunidad / voluntarios).
- **Código**: `apps/sitio/components/layout/Header.tsx` (→ cliente o subcomponente cliente `MobileNav`), `Footer.tsx` (consume `getEnlaces()`), uso de `lib/links.ts`. Handoff v0.dev portado (kebab→PascalCase de íconos, `font-600/700`→pesos nombrados, tokens).
- **Contenido**: ninguno nuevo (Footer lee `enlaces.json` existente).
- **Cierra**: #55. Deja sembrado el enlace para #56.
