## Why

Es la mitad de "performance" de la épica #26 (la mitad de observabilidad de errores ya se cerró
en #129). Dos gaps reales de imágenes en producción, medidos, no especulativos:

1. **`public/logo-chirimoyo.png` pesa 830 KB (1024×1024 sin comprimir) y se muestra a 48×48px**
   en `Header`/`Footer` de **ambas** apps (`sitio` y `catalogo`) — se descarga en cada página,
   de cada visitante, en ambos dominios. Es el archivo más pesado servido por request en todo el
   proyecto para el elemento visual más pequeño.
2. **6 componentes de `apps/sitio` usan `<img>` crudo** para fotos reales del bucket
   `comunidad-chirimoyo` (ya cubierto por `images.remotePatterns`, ADR-0021) en vez de
   `next/image`, perdiendo lazy-loading real, negociación automática de formato (WebP/AVIF) y
   dimensionamiento responsive.

## What Changes

- **Logo:** recomprimir/redimensionar `logo-chirimoyo.png` una sola vez (operación manual sobre
  el asset, no un paso de build ni una dependencia nueva) a un tamaño adecuado para su mayor uso
  a 2x (~96–128px), commiteado directamente en `public/` de ambas apps.
- **`sitio`:** migrar 4 de los 6 `<img>` crudos a `next/image`:
  `LineaTiempo.tsx`, `ElCaso.tsx`, `GaleriaTeaser.tsx`, `Hero.tsx` (con `fill` dentro de
  contenedores de aspect-ratio existentes o nuevos). `Header.tsx`/`Footer.tsx` también migran a
  `next/image` con el logo ya optimizado y `width`/`height` explícitos (Header además con
  `priority`, es above-the-fold en cada página).
- **`Lightbox.tsx` y `AliadosGrid.tsx` NO se tocan**, por dos razones distintas: `Lightbox` por
  tamaño dinámico (`max-h-[72vh] w-auto`, sin contenedor de aspect-ratio fijo — no encaja con el
  contrato de `next/image` sin un rework de layout no pedido); `AliadosGrid` porque su logo viene
  de una URL externa arbitraria (`mediaUrl` deja pasar cualquier dominio de terceros que el
  aliado use para su propio logo) — `next/image` exige que el hostname esté en
  `images.remotePatterns` y **lanza una excepción en runtime** con dominios no listados
  (descubierto en implementación: rompía `/aliados`). Ambos casos quedan documentados en el
  código.

## Capabilities

### New Capabilities
- `rendimiento-imagenes`: requisitos transversales de optimización de imágenes aplicables al
  shell y a los componentes compartidos/landing de `apps/sitio`, y al asset de logo compartido
  con `apps/catalogo` (peso máximo de assets estáticos servidos en cada page load, uso de
  `next/image` para fotos remotas del bucket cuando el layout lo permite).

### Modified Capabilities
<!-- Ninguna: no cambia el comportamiento de ninguna capability existente (landing-sitio,
     sitio-galeria, etc.), solo el mecanismo de render de imágenes ya usadas por ellas. -->

## Impact

- **Sub-dominios afectados:** `sitio`, `catálogo` (foundation, por el logo compartido).
- **Código:**
  - `apps/sitio/public/logo-chirimoyo.png`, `apps/catalogo/public/logo-chirimoyo.png` (reemplazo
    del binario, mismo nombre de archivo).
  - `apps/sitio/components/layout/{Header,Footer}.tsx`,
    `apps/sitio/components/{comunidad/LineaTiempo,landing/AliadosGrid,landing/ElCaso,landing/GaleriaTeaser,landing/Hero}.tsx`
    (migración a `next/image`).
  - `apps/catalogo/components/layout/{Header,Footer}.tsx` (solo el logo optimizado; siguen con
    `<img>` — ADR-0016 mantiene `images.unoptimized: true` en catálogo, `next/image` ahí no
    aportaría procesamiento server-side, así que no se fuerza el cambio de etiqueta).
- **Sin dependencias nuevas:** la recompresión del logo es una operación puntual sobre el asset,
  no se agrega `sharp` (u otra lib de imágenes) a `apps/sitio` — precedente: se quitó de
  `apps/catalogo` por romper el lockfile de CI en Linux (ver notas de scaffold), no repetirlo.
- **Sin ADR:** no cambia ninguna decisión de arquitectura existente (ADR-0016, ADR-0021 se
  mantienen intactas).

## No-goals

- No se toca `Lightbox.tsx` (documentado el porqué en el código).
- No se agregan cache-control headers ni se toca `firebase.json` — la otra mitad de #26 relativa
  a CDN/caching queda para una exploración aparte (Firebase Hosting ya tiene defaults propios sin
  auditar todavía).
- No se agrega Lighthouse/Core Web Vitals en CI (ya descartado en el explore original de #26).
- No se cambia `images.unoptimized` de `apps/catalogo` (ADR-0016 se mantiene).
- No se introduce ninguna dependencia nueva de procesamiento de imágenes en `apps/sitio`.
