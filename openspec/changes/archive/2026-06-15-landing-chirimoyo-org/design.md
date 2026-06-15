## Context

`apps/sitio` ya está en pie: app Next.js 15 en Cloud Run, ruteo multi-subdominio por host (`middleware.ts`), Header/Footer propios y el sistema de diseño heredado (tokens vía `sync-design-tokens.mjs`, `next/font`, primitivas en `components/ui/`). La ruta `/` es un placeholder.

El contenido vive en `content/landing/` (6 archivos) como fuente de verdad (ADR-0004). El lenguaje visual está fijado por el catálogo de aves, cuyo home (`apps/catalogo/components/home/`: `Hero`, `ElHumedal`, `QueHayAqui`, `CierreCTA`) ya portó el handoff v0.dev: hero a dos columnas, tarjetas `rounded-2xl bg-paper-card shadow-card`, banda final `pine-deep`. El landing del catálogo (`landing-catalogo`) es el molde directo de este trabajo.

Restricciones: español (i18n-ready, ADR-0011), Server Components por defecto, sin API en estas páginas, sin CMS. Las fotos se sirven desde GCS igual que la fauna (ADR-0016), pero en un bucket aparte para imágenes de comunidad.

## Goals / Non-Goals

**Goals:**
- Ensamblar el landing `/` consumiendo `content/landing/` sin duplicar texto en el código.
- Reusar al máximo el sistema de diseño y los patrones ya portados; generar vía v0.dev **solo** lo genuinamente nuevo.
- Páginas `/aliados` y `/galeria` estáticas y accesibles.
- Servir fotos de comunidad desde un bucket de GCS, con un data-layer que las liste en build.
- Mantener jerarquía de encabezados accesible (un solo `<h1>`) y foco visible.

**Non-Goals:**
- Inscripción de voluntarios o donación transaccional (donaciones informativas, ADR-0007).
- Rediseñar Header/Footer o tokens.
- Subir el set final de fotos (las 20 actuales son muestra de prueba).
- Optimización avanzada de imágenes más allá del patrón ya usado en el catálogo.

## Decisions

### D1 — Data-layer de `content/landing/` leído en build (no API)
Un módulo (p. ej. `apps/sitio/lib/landing.ts`) lee y tipa los JSON/Markdown de `content/landing/` en tiempo de build, análogo a `getAllFichas()` del catálogo. Las páginas son Server Components que reciben datos ya resueltos.
- **Por qué**: coherente con ADR-0004 (contenido en repo) y con el patrón del catálogo. Evita acoplar el landing al API (ADR-0006).
- **Alternativas**: (a) hardcodear contenido en TSX — rompe la regla de fuente de verdad única e i18n; (b) endpoint de contenido — innecesario y contra ADR-0006.

### D2 — Reusar patrones portados; v0.dev solo para 3 elementos nuevos
Hero, grid de tarjetas ("Qué hacemos"), Donaciones y Cierre CTA se construyen adaptando los patrones ya existentes en el catálogo. Pasan por **v0.dev** únicamente: **(1)** línea de tiempo de logros, **(2)** bloque linktree, **(3)** galería (grid masonry + lightbox).
- **Por qué**: CLAUDE.md exige v0.dev para UI nueva, pero el catálogo "ya marca la pauta". Acotar el handoff a lo nuevo respeta la regla sin reinventar lo resuelto.
- **Alternativas**: (a) v0.dev de todo el landing — costoso y redundante; (b) nada por v0.dev — viola la convención para patrones realmente nuevos.

### D3 — Hero sin carrusel de especies: foto-ancla del humedal
El hero del catálogo rota portadas de especies. El del landing usa una **foto-ancla** de la jornada (`1.50.56`), no fauna. Se reutiliza el layout de dos columnas y el `figcaption`, pero el carrusel automático es opcional (puede empezar con una sola foto).
- **Por qué**: el landing cuenta la lucha de la comunidad, no el catálogo; la foto documental de jornada comunica mejor el mensaje. El lirio acuático es el hilo visual.
- **Alternativas**: hero sin foto (descartado, ya hay material) o carrusel de varias fotos (posible v2 cuando llegue el set completo).

### D4 — Bucket de imágenes de comunidad separado del de fauna → ADR nuevo
Las fotos de humedal/jornadas/eventos van a un bucket de GCS propio (no el de fauna de ADR-0016). El data-layer de galería lista los objetos (manifiesto en repo o índice en build) y `/galeria` los renderiza.
- **Por qué**: separación de responsabilidades y de ciclo de vida (fauna curada vs. fotos de comunidad que crecen). Es una decisión de almacenamiento nueva → **requiere ADR** (`0021-storage-imagenes-comunidad-gcs.md`) y actualizar el índice.
- **Alternativas**: (a) reusar el bucket de fauna — mezcla dominios; (b) fotos en `public/` del sitio — no escala al volumen real ("hay muchas más").
- **Pendiente de cierre**: cómo se enumeran las fotos (manifiesto JSON en `content/` vs. listado del bucket en build). Ver Open Questions.

### D5 — `/aliados` y `/galeria` como rutas estáticas del App Router
`apps/sitio/app/aliados/page.tsx` y `apps/sitio/app/galeria/page.tsx`. El landing muestra un **preview** de aliados (subconjunto) que enlaza a `/aliados`. El lightbox de galería es el único componente que necesita `"use client"`.
- **Por qué**: páginas de contenido simples; coherente con la estructura ya usada en `comunidad/` y `voluntarios/`.

### D6 — Componentes nuevos al sistema de diseño compartido
Timeline, linktree y galería se portan como componentes reusables (candidatos a `docs/design-system/primitives` si aplican a otras apps), usando tokens existentes — sin colores hardcodeados fuera de `tokens.css`.

## Risks / Trade-offs

- **Contenido placeholder en `logros.json`/`aliados.json`** → El diseño avanza sobre el borrador; las páginas deben renderizar correctamente aun con entradas `PLACEHOLDER` y con `foto: null`/`url: null`. Mitigación: el data-layer y los componentes toleran campos nulos y el contenido real (#45) llega en paralelo sin tocar componentes.
- **Bucket nuevo sin ADR aprobado** → Implementar el bucket antes del ADR rompería la convención. Mitigación: redactar el ADR-0021 como primer paso de la parte de galería; si se retrasa, `/galeria` puede salir en una segunda entrega sin bloquear el landing.
- **Fotos de celular pesadas y de orientación mixta** → riesgo de layout shift y peso. Mitigación: aspect-ratios fijos + lazy-load como en el catálogo; grid masonry que tolera vertical/horizontal.
- **Acoplar el landing al set de prueba** → las 20 fotos son muestra. Mitigación: nada de nombres de archivo hardcodeados; el data-layer deriva las imágenes (D1/D4), igual que el catálogo no hardcodea fotos en `Hero.tsx`.
- **Alcance ancho (landing + 2 páginas + bucket + 3 patrones v0.dev)** → riesgo de PR gigante. Mitigación: tasks.md secuencia por entregables; galería puede ir en su propio tramo.

## Open Questions

- ~~**Enumeración de fotos de galería**~~ → **RESUELTO**: manifiesto curado `content/landing/galeria.json` (slug, archivo, alt, pie, orientación, `hero`); el orden del array es el orden de la galería. Da control editorial y pies. Lo expone `getGaleria()`.
- ~~**Carrusel del hero**~~ → **RESUELTO**: carrusel CSS **multi-foto** (patrón del catálogo, ciclo de 16 s / 4 fotos), alimentado por las fotos con `hero: true` de `galeria.json` (`getHeroSlides()`). Fotos de muestra por ahora; se reemplazan con el set curado sin tocar el componente.
- ~~**Preview de aliados en el landing**~~ → **RESUELTO**: se muestran los primeros 3 aliados no-placeholder en orden de `aliados.json` (que ya es la fuente editable de listado y orden); enlace "Ver todos" a `/aliados`.
