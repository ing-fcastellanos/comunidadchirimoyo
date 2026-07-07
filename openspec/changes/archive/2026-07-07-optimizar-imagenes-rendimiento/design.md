## Context

`logo-chirimoyo.png` es 1024×1024, 830 KB, sin comprimir a propósito (RGBA sin optimizar), y se
usa a 48×48px en `Header`/`Footer` de **ambas** apps — 4 sitios de uso, 2 apps, mismo archivo
binario duplicado (no hay tooling de monorepo para compartirlo, ADR-0001). No hay una versión SVG
del logo disponible (solo variantes PNG: base, `-bg`, `-white`).

`apps/sitio` ya usa `next/image` en 4 lugares con `images.remotePatterns` apuntando a
`storage.googleapis.com/comunidad-chirimoyo/**` (ADR-0021). Los 6 `<img>` crudos identificados
(`LineaTiempo`, `AliadosGrid`, `ElCaso`, `GaleriaTeaser`, `Hero`, `Lightbox`) renderizan fotos
reales del mismo bucket, ya cubierto por ese patrón — no falta configuración, falta el cambio de
componente.

`apps/catalogo` tiene `images.unoptimized: true` a propósito (ADR-0016: las fotos de fauna ya
vienen pre-optimizadas en WebP desde su propio bucket, sin CDN/Load Balancer por costo). `sharp`
es devDependency de `catalogo` para el pipeline de PDF; se quitó antes como dependencia directa
del build de imágenes por romper el lockfile de CI en Linux (gotcha documentado del proyecto:
regenerar lockfiles Windows→Linux o `npm ci` falla en el runner).

## Goals / Non-Goals

**Goals:**
- Reducir drásticamente el peso del logo compartido, sin herramienta nueva en el repo.
- Migrar a `next/image` donde el layout ya lo permite limpiamente (contenedores `fill`).
- Dejar Lightbox intacto y su exclusión documentada, no silenciosa.

**Non-Goals:**
- No agregar `sharp` ni ninguna lib de imágenes a `apps/sitio`.
- No tocar `images.unoptimized` de `catalogo` (ADR-0016 se mantiene).
- No rediseñar el Lightbox para forzarlo a un contenedor de aspect-ratio fijo.
- No cache-control/CDN — otra exploración.

## Decisions

### 1. Logo: operación puntual sobre el binario, no dependencia nueva
Se recomprime/redimensiona el PNG una sola vez (herramienta externa al repo, p. ej. un script
Python/PIL corrido manualmente durante la implementación, o cualquier compresor de imágenes —
el resultado es el único artefacto que importa: un binario más chico commiteado en su lugar). No
se agrega `sharp` como dependencia de `apps/sitio` ni se crea un script de build nuevo — evita
repetir el problema de lockfile de CI que ya afectó a `catalogo`. Tamaño objetivo: suficiente
para el mayor uso a 2x (el uso más grande visible es ~48px en Header/Footer → objetivo ~96–128px
de lado, con compresión PNG/WebP agresiva). El mismo archivo optimizado se copia a ambas apps
(mismo patrón que ya usan para tokens/fuentes: copia, no symlink ni paquete compartido).

### 2. `next/image` con `fill` donde el contenedor ya tiene aspect-ratio
3 de los 5 componentes candidatos (`ElCaso`, `GaleriaTeaser`, `Hero`) ya usan
`position: absolute; inset: 0` (o equivalente) dentro de un contenedor con `aspect-*` explícito —
el caso de uso exacto para el que `next/image fill` está diseñado; se preserva el
`loading`/`fetchPriority` existente traduciéndolo a `priority` (Hero, primera foto) y
comportamiento lazy por defecto (el resto). `Header`/`Footer` migran también, con `width`/`height`
explícitos (tienen tamaño fijo, no `fill`) — `Header` además con `priority` por ser above-the-fold
en cada página del sitio.

**Descubierto en implementación (layout):** `LineaTiempo` no tenía ningún contenedor
`relative`/absolute — era un `<img>` de tamaño fijo suelto (`h-40 w-full max-w-xs`); se le
agregó un `<div className="relative ...">` nuevo para habilitar `fill`. Dentro del espíritu del
requisito (migrar a `next/image` donde el layout lo permite), solo con el mecanismo que
corresponde al caso real.

**Descubierto en implementación (dato, más serio — cambia el alcance): `AliadosGrid` NO migra.**
Se intentó tratarlo como logo de tamaño fijo (igual que `Header`/`Footer`, `width`/`height`
explícitos), pero **rompió la página `/aliados` en runtime**: su `logo` viene de
`mediaUrl(aliado.logo)`, que deja pasar **cualquier URL externa absoluta sin tocar** (por diseño,
`lib/landing.ts`) — los aliados enlazan el logo de su propia página de Facebook/sitio, no
restringido al bucket de comunidad. `next/image` valida el hostname contra
`images.remotePatterns` y **lanza una excepción en runtime** (no solo un warning de build) si el
dominio no está en la lista — a diferencia de `<img>`, que simplemente intenta cargar la URL sea
cual sea. Mantener un allowlist de todos los dominios posibles de logos de terceros no es
sostenible. Se revirtió a `<img>`, documentado igual que Lightbox pero por una razón distinta
(dominio arbitrario de terceros, no tamaño dinámico). El alcance real de la migración queda en
**4 componentes** (`LineaTiempo`, `ElCaso`, `GaleriaTeaser`, `Hero`), no 5.

### 3. `Lightbox.tsx` se excluye, documentado
Su tamaño es intrínsecamente dinámico (`max-h-[72vh] w-auto`, sin contenedor de aspect-ratio fijo
— la imagen define su propio tamaño según su relación de aspecto real, dentro de un máximo).
`next/image` sin `fill` exige `width`/`height` conocidos de antemano; con `fill` exigiría un
contenedor de tamaño fijo, lo que rompería el comportamiento actual de "la imagen se ajusta a su
contenido". Forzarlo sería un rework de layout no pedido por este change. Se deja el comentario
`eslint-disable` existente y se amplía con la razón de esta decisión.

### 4. `apps/catalogo`: solo el logo, sin tocar la etiqueta `<img>`
El logo optimizado (payload físicamente más chico) beneficia a `catalogo` igual que a `sitio`,
sin importar si se sirve vía `<img>` o `next/image`, porque `catalogo` tiene
`images.unoptimized: true` (ADR-0016) — `next/image` ahí no re-procesaría el archivo en absoluto,
solo cambiaría la etiqueta HTML sin beneficio real. Se evita ese cambio cosmético fuera de alcance.

## Risks / Trade-offs

- **Recompresión manual, no repetible por script:** si el logo cambia en el futuro, alguien debe
  recordar optimizarlo a mano de nuevo. Aceptado — es un asset de marca que cambia rara vez, y no
  amerita tooling nuevo para un evento infrecuente.
- **Pequeña posible pérdida de fidelidad visual del logo** por la compresión — mitigado
  verificando visualmente antes de commitear (comparación lado a lado).
- **`fill` requiere que el contenedor padre tenga `position: relative` (o similar) y dimensiones
  definidas** — ya es el caso en los 5 componentes migrados (verificado en el explore), pero se
  revisa cada uno al implementar por si algún detalle de CSS lo rompe.
