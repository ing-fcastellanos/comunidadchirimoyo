## Why

El hero del landing muestra una sola foto (la portada curada del avetoro). Un carrusel automático con varias especies emblemáticas del humedal comunica mejor la riqueza de fauna que defendemos en los primeros segundos de visita, sin pedir interacción al usuario.

**Sub-dominios afectados:** `aves` (apps/catalogo).

## What Changes

- La imagen única del hero pasa a ser un **carrusel automático de 4 fotos en bucle infinito**, con las portadas curadas de: **Avetoro Norteño** (`botaurus-lentiginosus`), **Martín Pescador Norteño** (`megaceryle-alcyon`), **Garza Dedos Dorados** (`egretta-thula`) y **Pijije Alas Blancas** (`dendrocygna-autumnalis`), en ese orden.
- La transición es un **crossfade CSS puro** (sin JavaScript): 4 s por foto, fundido de 0.8 s. El Hero **sigue siendo Server Component**.
- El **pie de foto rota** sincronizado con la imagen activa (nombre común de cada especie).
- Respeta **`prefers-reduced-motion`**: con esa preferencia activa, no autoanima — muestra la primera foto fija.
- Las 4 fotos se derivan de `fotos[0]` de cada ficha (portada curada): si se recura una, el carrusel toma la nueva sin editar el componente.

## No-goals

- **Sin controles manuales** (flechas, dots, swipe) ni lightbox: es puramente automático. (El carrusel interactivo del detalle, `FichaCarrusel.tsx`, no se toca ni se reutiliza.)
- **Sin JavaScript / sin client component**: si se quisieran dots o pausa-al-hover en el futuro, sería otro cambio (migrar a Opción B con JS).
- No se cambia el bucket, `fotoUrl`, ni el esquema de la ficha.
- No se añade un campo `featured`-driven para elegir las especies: la lista de 4 slugs es explícita y ordenada.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `landing-catalogo`: la imagen del hero pasa de ser una sola portada curada a un **carrusel automático de 4 portadas curadas** (especies fijas, en orden), con crossfade CSS, pie rotativo y respeto a `prefers-reduced-motion`.

## Impact

- **Código (apps/catalogo):**
  - `components/home/Hero.tsx` — recibe un arreglo de slides (en vez de `img`/`alt`) y renderiza las 4 fotos apiladas con crossfade + caption rotativo.
  - `app/page.tsx` — deriva las 4 portadas curadas (por slug, en orden) y las pasa al Hero.
  - `app/globals.css` (o el CSS del componente) — keyframes del crossfade de imagen y de caption, más la regla `@media (prefers-reduced-motion: reduce)`.
- **Sin dependencias nuevas.** Sin cambios en API, bucket ni infra. El siguiente `npm run deploy_prod` publica el carrusel.
- Sin ADR (no rompe convenciones; el catálogo sigue estático y el Hero sigue siendo Server Component).
