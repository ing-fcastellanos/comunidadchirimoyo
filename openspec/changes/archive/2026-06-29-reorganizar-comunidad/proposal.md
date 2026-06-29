## Why

El landing (`/`) creció hasta absorber el contenido que la arquitectura (ADR-0023) reservaba para `/comunidad`: "Qué hacemos" (actividades) y la "Línea de tiempo" (logros). `/comunidad`, en cambio, sigue casi vacío (solo el intro + el bloque de noticias de #73). Este cambio (#19a, épica #19) **reequilibra** las dos páginas: mueve esas dos secciones a `/comunidad` —su hogar natural— y deja en el landing un enlace teaser que invita a conocer a la comunidad. La sección "El caso" (lucha) se mantiene en **ambas** por decisión del proyecto (es el gancho del landing y el contexto de la página de comunidad).

## What Changes

- **Mover "Qué hacemos" (`QueHacemos`/`actividades`) y "Línea de tiempo" (`LineaTiempo`/`logros`) del landing a `/comunidad`.** El landing (`app/page.tsx`) deja de renderizarlas (y deja de cargar `getActividades`/`getLogros`).
- **Landing: enlace teaser** "Conoce a la comunidad → /comunidad" donde estaban las secciones (entre "El caso" y la galería), para no perder el hilo narrativo.
- **`/comunidad`** pasa a: **intro** (h1 + lead, existente) → **El caso** (`ElCaso`, duplicado) → **Qué hacemos** → **Línea de tiempo** → **Últimas noticias** (bloque de #73, ya presente). Reusa los loaders `getLucha`/`getActividades`/`getLogros` y `mediaUrl`.
- **Organización de componentes:** `QueHacemos` y `LineaTiempo` se mueven de `components/landing/` a `components/comunidad/` (salen del landing). `ElCaso` se **queda** en `components/landing/` (lo usan las dos páginas).

## No-goals

- **No** se construye **Misión y Visión**: es #19b (requiere el texto del usuario).
- **No** se toca el bloque de **noticias** de `/comunidad` (#73) ni el listado/detalle.
- **No** se cambia el **contenido** (`lucha.md`, `actividades.json`, `logros.json` siguen igual) ni sus loaders.
- **No** se rediseña nada (sin v0.dev): se reubican secciones existentes.
- **No** se mueve el contenido a `content/comunidad/` (sigue en `content/landing/`, lo consumen ambas páginas).

## Capabilities

### New Capabilities
- `pagina-comunidad`: composición de la página `/comunidad` — "El caso" (duplicado del landing), "Qué hacemos", "Línea de tiempo de logros" y el bloque de últimas noticias, todo Server Component derivado de `content/`.

### Modified Capabilities
- `landing-sitio`: el landing **deja de incluir** "Qué hacemos" y "Línea de tiempo" (se mueven a `/comunidad`) y **gana** un enlace a `/comunidad`.

## Impact

- **Sub-dominios afectados:** sitio (landing), comunidad (`apps/sitio`).
- **Código (`apps/sitio`):** `app/page.tsx` (quita 2 secciones + teaser), `app/comunidad/page.tsx` (añade 3 secciones), mover `components/landing/{QueHacemos,LineaTiempo}.tsx` → `components/comunidad/`.
- **Contenido:** ninguno nuevo (reuso de `actividades.json`/`logros.json`/`lucha.md`).
- **Dependencias:** ninguna.
- **Sin** cambios en API, esquema, ni convenciones documentadas → **no requiere ADR** (es coherente con ADR-0023).
