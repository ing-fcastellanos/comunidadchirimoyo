## Context

`/galeria` y `/aliados` ya están implementadas (change `landing-chirimoyo-org`). `apps/sitio`
corre en Cloud Run con `output: "standalone"` y **sin** `images.unoptimized`, así que el
optimizador de `next/image` está disponible (a diferencia del catálogo, que es `output:
"export"` y por eso usa `<img>` + `unoptimized`, ADR-0014). Las fotos viven en el bucket
público `comunidad-chirimoyo` (ADR-0021) y se resuelven vía `mediaUrl()` en `lib/landing.ts`.
`galeria.json` es el manifiesto curado (slug, archivo, alt, pie, orientacion, hero).

## Goals / Non-Goals

**Goals:**
- Servir las fotos de `/galeria` optimizadas (responsive, formatos modernos, sin layout shift).
- Soportar y mostrar créditos de autoría + fecha por foto.
- Mostrar el `tipo` del aliado en su tarjeta.

**Non-Goals:**
- Migrar hero/teaser/"el caso" a `next/image`.
- Filtros por tipo (aliados) ni agrupación por álbum (galería).
- Cargar datos reales de autoría (dependen de la comunidad).

## Decisions

### D1 — `next/image` en `/galeria` (rejilla), `<img>` en el lightbox
La rejilla usa `next/image` con **`width`/`height` nominales por orientación** (1200×900 /
900×1200) + `w-full h-auto object-cover` y `sizes` por breakpoint; lazy nativo. Se añade
`images.remotePatterns` para `storage.googleapis.com`. **No se usa `fill`**: dentro de una
rejilla CSS `columns` el `fill` (posición absoluta) colapsa el tamaño del contenedor (celda
0×0); con dimensiones en flujo la celda se mide bien y se mantiene la relación de aspecto. El
**lightbox conserva `<img>`**: es una sola foto a resolución completa con tamaño variable
(`object-contain`, `max-h-[72vh]`), donde la optimización aporta poco.
- **Por qué**: `sitio` es servidor (Cloud Run) → el optimizador aplica; cumple "optimizadas"
  de #50 con poco código. `sharp` ya es resoluble.
- **Alternativas**: `<img>` tal cual (no cumple "optimizadas"); variantes pre-generadas en el
  bucket como el catálogo (consistente pero exige pipeline ahora, PR más grande).
- **Nota**: diverge del `<img>` del catálogo por una razón de runtime (servidor vs export),
  no contradice ADR-0016 (que evita Load Balancer/CDN administrado, no `next/image`). Sin ADR.

### D2 — Créditos: esquema nullable + render condicional
`galeria.json` y `FotoGaleria`/`FotoResuelta` ganan `credito: string|null` y `fecha:
string|null` (ISO). Se muestran **solo si existen**: autoría + fecha en el `figcaption` del
lightbox; crédito sutil en el overlay de la tarjeta. Sin dato → no se muestra nada (sin
"Autor: —").
- **Por qué**: mismo patrón "listo ya, contenido después" de logros/aliados; no bloquea con
  datos reales pendientes.

### D3 — `tipo` de aliado como `Badge`
La tarjeta de `AliadosGrid` muestra el `tipo` con el componente `Badge` (un tono del sistema).
Mapa `tipo → etiqueta` legible (colectivo, ONG, académico, gobierno, negocio, medio,
independiente). El `tipo` ya viene en `aliados.json` y en el tipo `Aliado`.

### D4 — Carga incremental de la galería (lotes de 30 + IntersectionObserver)
El contenedor cliente `Galeria` mantiene `visibles` (inicial 30) y renderiza
`fotos.slice(0, visibles)`. Un `<div>` sentinela tras la rejilla se observa con
`IntersectionObserver` (`rootMargin: 600px`); al acercarse, `visibles += 30` hasta agotar la
lista. Se reobserva por lote para rellenar si el sentinela sigue visible. El **lightbox opera
sobre la lista completa** (`fotos`), así que la navegación llega a fotos aún no montadas; como
el slice empieza en 0, el índice del grid coincide con el de la lista completa.
- **Por qué**: a >200 fotos, inyectar todos los nodos + `srcset` de `next/image` engorda el
  HTML inicial linealmente. Renderizar por lotes lo acota sin importar el total. `next/image`
  ya difiere la **descarga** de cada imagen; esto difiere además el **montaje** de los nodos.
- **Alternativas**: lazy nativo de todos los nodos (actual; HTML inicial sin tope);
  virtualización (react-window) — innecesaria a este orden de magnitud y compleja con masonry.
- **Tamaño de lote**: 30 (decisión del equipo); fácil de ajustar (constante `LOTE`).

## Risks / Trade-offs

- **Optimización on-the-fly en Cloud Run** → cómputo por imagen/tamaño en la primera carga
  (cacheado por instancia; con `min-instances=0` la caché es efímera). Mitigación: tráfico
  bajo lo hace insignificante; `sizes` acota variantes. Si algún día pesa, se puede pasar a
  variantes pre-generadas (D1, alternativa).
- **Fotos de muestra sin autoría** → `credito` será null hasta que la comunidad lo cargue; la
  UI ya lo tolera.
- **`remotePatterns`** debe apuntar al host del bucket; si la base cambia (CDN/dominio propio,
  ADR-0021) hay que actualizarlo junto con `NEXT_PUBLIC_COMUNIDAD_CDN_BASE`.
