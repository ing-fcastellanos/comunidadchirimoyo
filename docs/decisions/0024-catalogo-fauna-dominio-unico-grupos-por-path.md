# ADR-0024 — Catálogo de fauna en dominio único `fauna.chirimoyo.org`, grupos por path

- **Estado:** Accepted
- **Fecha:** 2026-06-17
- **Decisores:** @ing-fcastellanos
- **Issue:** #17 (exploración que originó la decisión)

## Contexto

ADR-0005 decidió que el catálogo de fauna sería estático y que los anfibios/reptiles
serían **una categoría dentro del mismo catálogo**, no un sitio aparte. En ese momento el
catálogo se concebía como "el catálogo de aves" servido en `aves.chirimoyo.org`, y se dejó
abierto que `anfibios.chirimoyo.org`, "si se usaba", redirigiera a la categoría dentro de
`aves.chirimoyo.org`. El plan original anterior incluso contemplaba un subdominio por grupo.

Ese encuadre "aves-first" ya no se sostiene. El proyecto expandirá el catálogo a varios
grupos faunísticos en el futuro cercano —además de aves y anfibios/reptiles, se prevén
**insectos y mamíferos**—. Mantener un subdominio por grupo (`aves.`, `anfibios.`,
`insectos.`, `mamiferos.`) multiplica DNS, sites de Firebase Hosting y mantenimiento, y
diluye la autoridad SEO de un dominio que apenas arranca. Es el mismo problema que ADR-0023
resolvió para el sitio (subdominios por sección → paths bajo un dominio único + vanity).

Hecho técnico relevante: la arquitectura **ya es multi-grupo**, solo el dominio público
quedó rezagado con el nombre `aves`:

- El contenido vive en `content/fauna/<grupo>/` (`fauna/aves/...`), con `grupo` como campo
  del frontmatter de cada ficha.
- La ruta de detalle ya está namespaceada por grupo: `app/aves/[slug]` → `/aves/<slug>`.
- El storage de imágenes y audio usa el término "fauna" (ADR-0016, ADR-0017).

El único lugar donde sobrevive "aves" como nombre del catálogo completo es el dominio. El
catálogo de aves **aún no se ha publicado ni difundido**, por lo que el costo de renombrar
es mínimo.

## Decisión

Servir el catálogo completo de fauna desde el **dominio único `fauna.chirimoyo.org`**, con
**un path por grupo taxonómico**:

- `/` — hub de fauna (grupos + destacados + entrada a búsqueda).
- `/busqueda` — búsqueda global en cliente, con **filtro por grupo**.
- `/aves`, `/anfibios`, `/reptiles` — página índice de cada grupo; futuros `/insectos`,
  `/mamiferos` siguen el mismo patrón.
- `/<grupo>/<slug>` — detalle de especie (el detalle ya vive bajo `/aves/<slug>`).

Regla: **un grupo taxonómico = un path**. Anfibios y reptiles, aunque hoy se migren juntos
desde un solo archivo de datos, se exponen como **grupos separados** (`/anfibios` y
`/reptiles`), consistente con el patrón que seguirán insectos y mamíferos. El filtro de
búsqueda puede ofrecer atajos combinados (p. ej. "herpetofauna") sin romper la regla de paths.

Se descarta definitivamente el subdominio por grupo. `aves.chirimoyo.org` se conserva
**solo como redirect vanity 301** hacia `fauna.chirimoyo.org/aves` (higiene/difusión; baja
prioridad dado que aún no se publica).

Esta decisión **refina ADR-0005** en lo relativo al **nombre del dominio** y a la
**arquitectura de información por paths**; las decisiones de fondo de ADR-0005 —catálogo
100% estático y anfibios/reptiles como parte del mismo catálogo, no sitio aparte— **siguen
vigentes**. `flora` (plantas, hongos) queda **fuera de alcance**: si algún día se agrega, se
hará en un dominio aparte (`flora.chirimoyo.org`), por ser otro reino con otra lógica.

## Alternativas consideradas

- **Subdominio por grupo (`aves.`, `anfibios.`, `insectos.`, `mamiferos.`):** fiel al plan
  original, pero multiplica DNS + sites de Hosting por cada grupo nuevo y fragmenta la
  autoridad SEO. Mismo anti-patrón que ADR-0023 rechazó para el sitio. Descartada.
- **Mantener `aves.chirimoyo.org` como dominio del catálogo completo:** el catálogo crece a
  reptiles, insectos y mamíferos; un dominio llamado "aves" para todo eso es un nombre
  incorrecto que confunde y envejece mal. Descartada.
- **`biodiversidad.chirimoyo.org`:** cubriría flora + fauna y evitaría un futuro rename si se
  agregaran plantas, pero es largo, difícil de dictar por voz/cartel, y la flora es un "quizá
  lejano". Descartada en favor de `fauna`.
- **Anfibios y reptiles fusionados en un solo path (`/anfibios-reptiles`):** más sustancia hoy
  (12 especies juntas), pero rompe la regla "un grupo = un path" y mezcla dos grupos del
  origen de datos en una sola sección. Descartada por consistencia con los grupos futuros.
- **Paths sin vanity:** más simple, pero pierde el valor de difusión de un nombre corto. El
  redirect recupera eso a costo casi nulo. Descartada en favor de paths **con** vanity.

## Consecuencias

### Positivas

- La URL pública alcanza a la arquitectura que ya existe (`content/fauna/`, buckets fauna,
  ruta `/aves/<slug>`): el detalle de un ave pasa del redundante `aves.chirimoyo.org/aves/...`
  al limpio `fauna.chirimoyo.org/aves/...`.
- Toda la autoridad SEO se consolida en un solo dominio de catálogo.
- Agregar un grupo nuevo (insectos, mamíferos) es agregar un path, no un subdominio: cero
  DNS/Hosting nuevos.
- Operación simple: un site de Hosting para todo el catálogo.

### Negativas

- Hay que renombrar el site de Firebase Hosting y el dominio en DNS (Porkbun), actualizar la
  base URL, metadatos/SEO, sitemap y robots del catálogo.
- Se mantiene un redirect 301 `aves.* → fauna/aves` (carga mínima).

### Neutras

- Las rutas internas de Next apenas cambian: el detalle ya está bajo `/aves/[slug]`; se
  generaliza para servir cualquier grupo y se agregan las páginas índice por grupo.
- ADR-0005 no se retira: sus decisiones de fondo siguen vigentes; este ADR solo refina
  dominio + IA.

## Plan de revisión

Reconsiderar si algún día un grupo diverge tanto en stack, volumen o ritmo que justifique app
o deploy propios, o si se decidiera incorporar flora al mismo catálogo (lo que reabriría el
nombre del dominio).

## Referencias

- Refina [ADR-0005](0005-catalogo-estatico-anfibios-categoria.md) (dominio + IA por path).
- Precedente directo: [ADR-0023](0023-fusion-secciones-paths-vanity-redirects.md) (misma
  decisión para el sitio).
- Relacionados: ADR-0001 (layout), ADR-0003 (hosting/DNS), ADR-0014 (catálogo export
  estático), ADR-0016/0017 (storage fauna en GCS).
- Épicas #16 y #17 (Fase 2 — Anfibios).
