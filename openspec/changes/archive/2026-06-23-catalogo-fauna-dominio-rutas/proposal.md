## Why

El catálogo se concibió "aves-first" y se sirve en `aves.chirimoyo.org` con la home como landing de aves, pese a que la arquitectura interna ya es multi-grupo (`content/fauna/<grupo>/`, detalle bajo `/aves/<slug>`, buckets "fauna"). Con anfibios y reptiles inminentes —y luego insectos/mamíferos—, el nombre del dominio y la información por path quedaron rezagados. **ADR-0024** ya decidió mover el catálogo a un **dominio único `fauna.chirimoyo.org`** con **un path por grupo taxonómico**; esta propuesta implementa esa arquitectura de información y rutas. El catálogo aún no se publica, por lo que el costo de renombrar es mínimo.

**Sub-dominio afectado:** `aves` (apps/catalogo). No toca `sitio`, `comunidad`, `voluntarios`, `api` ni `foundation`.

## What Changes

- **`/` deja de ser el landing de aves y pasa a ser el hub de fauna**: carrusel (fotos de aves por ahora), tres tarjetas de grupo (aves *activa*; anfibios y reptiles *próximamente*) y un acceso a la búsqueda. **BREAKING** para la IA pública.
- **El landing actual se mueve de `/` a `/aves`** (la home del grupo aves), conservando su contenido (hero, secciones, CTAs).
- **El buscador de aves se mueve de `/busqueda` a `/aves/buscador`** (opción b: aves está vivo, no se apaga). Sus CTAs/enlaces internos se repuntan en consecuencia.
- **`/busqueda` queda como stub "próximamente"**: su futuro inquilino —el buscador general multi-grupo— es trabajo de #85. El hub y el botón global "Buscar especies" del `Header` enlazan a este stub.
- **`/anfibios` y `/reptiles` quedan como stubs "próximamente"** (sus índices/buscadores especializados y datos llegan en #85/#88).
- **La ruta de detalle se generaliza de `/aves/<slug>` a `/<grupo>/<slug>`** (`app/[grupo]/[slug]`), preparada para cualquier grupo; hoy solo genera rutas de aves.
- **El tipo/loader del catálogo expande `grupo` de `aves | anfibios-reptiles` a `aves | anfibios | reptiles`** (solo tipo y descubrimiento de carpetas; los **campos** group-aware del esquema son de #88).
- **Renombrado a `fauna.chirimoyo.org`** en el repo: `metadataBase`, OpenGraph, sitemap, robots, target del site de Firebase Hosting, y neutralización de strings "aves" como nombre del catálogo completo (Header/Footer/títulos).
- **Vanity redirect 301 `aves.* → fauna/aves`**: configuración de Hosting, baja prioridad, último.

### No-goals

- **No** migra fichas de anfibios/reptiles ni añade campos group-aware al esquema (eso es #88; aquí solo el enum de `grupo`).
- **No** construye los buscadores especializados de anfibios/reptiles ni el buscador general (#85).
- **No** introduce endpoint de búsqueda (sigue 100% en cliente, ADR-0005/0006).
- **No** toca DNS de Porkbun ni ejecuta el deploy/rename de infra: esos pasos son manuales del responsable (fuera del repo).

## Capabilities

### New Capabilities
- `catalogo-hub-fauna`: el hub de fauna en `/` (carrusel + tarjetas de grupo con estado activo/«próximamente» + acceso a búsqueda) y las páginas placeholder "próximamente" de los grupos/búsqueda aún no disponibles (`/anfibios`, `/reptiles`, `/busqueda`).

### Modified Capabilities
- `catalogo-app`: la home (`/`) deja de servir el landing y pasa a servir el hub; `metadataBase` y SEO/sitemap/robots apuntan a `fauna.chirimoyo.org`; el target del site de Hosting y el enlace de búsqueda del `Header` se actualizan; se añade el andamiaje de ruta generalizada `app/[grupo]/…`.
- `landing-catalogo`: el landing se sirve en `/aves` (no en `/`); sus CTAs "Explorar el catálogo"/"Ir al catálogo" enlazan a `/aves/buscador`.
- `catalogo-busqueda`: el buscador (de aves) se sirve en `/aves/buscador` (no en `/busqueda`); el enlace "Ver ficha" navega a `/<grupo>/<slug>`.
- `catalogo-detalle`: la ficha de detalle se genera en `/<grupo>/<slug>` (no en `/aves/<slug>`), con `generateStaticParams` sobre pares grupo×slug.
- `esquema-ficha-fauna`: `grupo` pasa a ser `aves | anfibios | reptiles` (anfibios y reptiles separados); el `<grupo>` de la ruta de contenido se amplía en consecuencia.

## Impact

- **Código (apps/catalogo):** `app/page.tsx` (→ hub), `app/aves/[slug]/` (→ `app/[grupo]/[slug]/`), `app/busqueda/page.tsx` (→ `app/[grupo]/buscador/` para aves + stub en `/busqueda`), nuevas páginas de grupo/stub, `components/layout/Header.tsx`, `components/home/*` (Hero, CierreCTA), `components/ficha/secciones.tsx` (RelacionadasNav), `lib/content.ts` (`GRUPOS`), `lib/fauna-schema.ts` (`type Grupo`), `lib/search.ts` (`href`), `layout.tsx`/`metadata`, sitemap y robots.
- **Infra (manual, fuera del repo):** rename del site de Firebase Hosting, DNS en Porkbun, vanity 301.
- **Decisiones:** gobernado por **ADR-0024** (ya Accepted); el modelo de buscadores especializado+general está registrado en #85. No requiere ADR nuevo.
- **Dependencias aguas abajo:** #85 (buscadores), #88 (esquema group-aware + migración de fichas) consumen el andamiaje de grupo y rutas que deja esta propuesta.
