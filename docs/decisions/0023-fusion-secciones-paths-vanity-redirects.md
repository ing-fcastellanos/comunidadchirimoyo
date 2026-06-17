# ADR-0023 — Fusión de secciones en `chirimoyo.org` por paths, con redirects vanity

- **Estado:** Accepted
- **Fecha:** 2026-06-17
- **Decisores:** @ing-fcastellanos
- **Issue:** #20 (exploración que originó la decisión)

## Contexto

ADR-0008 decidió servir `chirimoyo.org`, `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` desde una sola app (`apps/sitio`), exponiéndolos como **subdominios dedicados** vía Firebase Hosting rewrites + middleware de host. Esa decisión rechazó explícitamente la opción de paths (`chirimoyo.org/comunidad`) con el argumento de "claridad y difusión", apoyada en el plan original donde **`chirimoyo.org` sería solo un landing** y todo lo demás viviría en `comunidad`.

Ese supuesto ya no se sostiene: el sitio principal creció más allá del landing y hoy sirve `/aliados`, `/galeria`, `/contacto` y `/privacidad`. La frontera conceptual "landing vs. todo lo demás" que justificaba los subdominios se disolvió. Antes de construir la sección de noticias (épica #20) y de ejecutar el deploy (issue #53, aún pendiente), conviene revisar la arquitectura de URLs.

Hecho técnico relevante: los subdominios **nunca fueron sitios separados**. Son la misma app, el mismo build y deploy; el middleware solo reescribe el host al prefijo de ruta interno (`comunidad.*` → `/comunidad`). Las rutas internas de Next (`/comunidad/...`, `/voluntarios/...`) son idénticas con o sin subdominio. Por tanto la decisión es de **arquitectura de información, SEO y difusión**, no de costo de código.

## Decisión

Servir todas las secciones del sitio (`comunidad` y `voluntarios`) como **paths bajo el dominio único `chirimoyo.org`** (p. ej. `chirimoyo.org/comunidad`, `chirimoyo.org/comunidad/noticias`, `chirimoyo.org/voluntarios`), eliminando el ruteo por host. Los subdominios `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` se conservan **solo como redirects vanity 301** hacia su path equivalente, para difusión (carteles, voz).

Las rutas internas de Next **no cambian** (`app/comunidad/...`, `app/voluntarios/...`); se retira el middleware de reescritura por host. `aves.chirimoyo.org` queda **fuera de esta decisión**: sigue siendo app propia (`apps/catalogo`) con deploy independiente (ADR-0001/0008 en ese punto siguen vigentes).

Esta decisión **supersede a ADR-0008** en lo relativo a `apps/sitio`.

## Alternativas consideradas

- **Conservar subdominios reales (ADR-0008):** nombre bonito para difusión, pero diluye la autoridad SEO de un dominio que apenas arranca, multiplica sites de Hosting + DNS + middleware, y su justificación conceptual ya se rompió. Descartada.
- **Fusionar solo `comunidad`, dejar `voluntarios` como subdominio:** inconsistente; mantener un solo subdominio a medias combina lo peor de ambos esquemas. Descartada por consistencia.
- **Paths sin redirects vanity:** más simple, pero pierde el valor de difusión de un nombre corto y pronunciable. Los redirects recuperan eso a costo casi nulo. Descartada en favor de paths **con** vanity.
- **Fusionar también `aves`:** fuera de alcance; es app separada con deploy propio y diverge en stack/ritmo. Se mantiene como está.

## Consecuencias

### Positivas

- Toda la autoridad SEO se consolida en un solo dominio — mejor para un sitio pequeño en construcción.
- Operación más simple: un site de Firebase Hosting y un dominio principal en vez de tres; se elimina el middleware de host y su fragilidad.
- Simplifica el deploy pendiente (#53).
- Enlaces internos relativos en vez de URLs absolutas cross-subdominio.
- Se conserva la difusión: los subdominios vanity siguen funcionando como entrada.

### Negativas

- Las URLs públicas de sección son más largas (`/comunidad/...` vs `comunidad.*`).
- Hay que configurar y mantener los redirects 301 (carga mínima).
- Cualquier material ya impreso/publicado con `comunidad.chirimoyo.org` seguirá vivo gracias al redirect, pero apunta a una URL que ya no es la canónica.

### Neutras

- Las rutas internas de la app y los 6 sub-issues de noticias (#69–#74) no se ven afectados: ya usan `/comunidad/...`.
- El Footer y los enlaces cross-sección pueden pasar de URLs absolutas a relativas (limpieza, no ruptura).

## Plan de revisión

Reconsiderar si algún día una sección diverge fuerte en stack, equipo o ritmo de cambios al punto de justificar app/deploy propios (como `aves`), o si la difusión por subdominio resultara claramente superior medida en tráfico.

## Referencias

- Supersede a [ADR-0008](0008-multisubdominio-una-app.md). Relacionados: ADR-0001 (layout), ADR-0003 (hosting/DNS).
- Issue #53 (deploy), épica #20 (noticias).
