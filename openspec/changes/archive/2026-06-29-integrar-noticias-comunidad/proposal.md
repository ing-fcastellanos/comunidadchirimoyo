## Why

La sección de noticias ya está completa (listado #71, detalle #72), pero **aislada**: la portada de comunidad (`/comunidad`) es un placeholder de scaffold y nada en la navegación lleva a noticias. Este cambio la **conecta con el sitio** (#73, épica #20): muestra las últimas notas en `/comunidad` y agrega un enlace a noticias en la navegación, cumpliendo el criterio "llegar a noticias en ≤1 clic desde la portada de comunidad".

## What Changes

- **Bloque "Últimas noticias" en `/comunidad`** (`app/comunidad/page.tsx`): la página pasa a Server Component **async**, llama `getAllNoticias()` y muestra las **3 notas más recientes** con `NoticiaCard` (reuso de #71), con encabezado y un enlace **"Ver todas → /comunidad/noticias"**. El bloque **se auto-oculta** si no hay notas publicadas (en producción hoy: oculto; en dev: la nota de ejemplo). Se conserva el `h1`/intro de la página y se quita "Noticias" de la lista «próximamente» (ya deja de serlo).
- **Enlace "Noticias" → `/comunidad/noticias`** en el **Header** (nav del sitio) y en el **Footer**.
- Reusa `Section`/`SectionTitle`/`NoticiaCard` y los tokens; **sin v0.dev ni dependencias**.

## No-goals

- **No** se construye el resto de `/comunidad` (historia, acciones, misión/visión): es la épica #19.
- **No** se siembran notas reales (#74): se usa el contenido existente.
- **No** hay middleware por host: la tarea del issue sobre "ruteo por host (ADR-0008)" está **obsoleta** — ADR-0008 fue superseado por ADR-0023 (paths bajo un dominio); `/comunidad/noticias` es un path directo y la cobertura de `comunidad.*` es un **redirect vanity 301** que vive en el deploy (#53), fuera de este cambio.
- **No** se cambia el esquema/loader de notas ni las páginas de listado/detalle.

## Capabilities

### New Capabilities
- `integracion-noticias-comunidad`: integración de la sección de noticias en el sitio — bloque de últimas noticias en la portada de comunidad y enlaces a noticias en la navegación (Header + Footer).

### Modified Capabilities
<!-- ninguna: listado-noticias/detalle-noticia/noticias-comunidad no cambian; solo se consumen -->

## Impact

- **Sub-dominio afectado:** comunidad (`apps/sitio`).
- **Código (`apps/sitio`):** `app/comunidad/page.tsx` (bloque async); `components/layout/Header.tsx` (enlace en NAV) y `components/layout/Footer.tsx` (enlace); reuso de `components/comunidad/NoticiaCard.tsx`.
- **Contenido:** ninguno nuevo (consume `content/noticias/`).
- **Dependencias:** ninguna nueva.
- **Sin** cambios en API, esquema, ni convenciones documentadas → **no requiere ADR**.
