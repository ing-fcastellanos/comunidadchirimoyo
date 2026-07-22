## Why

Fase 6 (#133, ADR-0027 a ADR-0030) introdujo `apps/admin`, noticias/jornadas dinámicas en Firestore y auth Firebase-native para el panel — pero la documentación cross-cutting (`CLAUDE.md`, `README.md`, `docs/architecture/overview.md`, `ROADMAP.md`, `docs/project-management.md`) nunca se actualizó. No es solo una omisión: `CLAUDE.md` hoy afirma cosas que ya son falsas ("Contenido | Markdown/JSON en content/", "no hay auth de usuarios"), lo que puede llevar a un agente futuro a buscar noticias en `content/noticias/*.md` (ya no es la fuente de verdad) o a tratar la auth del admin como una desviación no documentada del stack.

## What Changes

- `CLAUDE.md`: agrega `apps/admin` a la identidad del proyecto; corrige la tabla de stack (contenido: noticias/jornadas viven en Firestore, no en `content/`; auth: existe para el panel admin, no para visitantes públicos); agrega un aviso crítico nuevo ("Noticias y jornadas viven en Firestore, no en content/") con el mismo formato que los avisos existentes de catálogo-estático y API-mínima.
- `README.md`: agrega la fila `admin.chirimoyo.org` a la tabla de sitios, `apps/admin` al árbol de estructura, y Firebase Auth/Admin SDK a la sección de stack.
- `docs/architecture/overview.md`: agrega `apps/admin` al diagrama y una subsección de boundaries (Firebase-native, server actions/route handlers vía Admin SDK, no extiende el API); corrige la sección de `apps/sitio` (noticias/jornadas ya no se leen de `content/` en build, sino de Firestore server-side con ISR + revalidación on-demand); agrega noticias/jornadas a la sección de Datos (Firestore) y Firebase Auth a servicios externos.
- `ROADMAP.md`: agrega la fila Fase 6 a "Modelo de fases" y los ADR-0027 a ADR-0030 a "Decisiones de arquitectura".
- `docs/project-management.md`: corrige "un milestone por fase (Fase 0 a Fase 5)" y su tabla de fases para incluir Fase 6; agrega `subdomain: admin` a la taxonomía de labels (ya existe en GitHub, confirmado con `gh label list`); menciona `setup-phase6-contenido-admin.sh` en el bloque de ejemplo de scripts.

## Capabilities

### New Capabilities
- `docs-crosscutting-fase6-admin`: no es comportamiento de aplicación; es el requisito de que la documentación cross-cutting del monorepo (identidad del proyecto, arquitectura, roadmap, gestión de proyecto) refleje con precisión `apps/admin` y el resto de Fase 6, verificable por inspección de los 5 archivos.

### Modified Capabilities
(ninguna — no hay specs de comportamiento de `noticias-admin`/`jornadas-admin`/`upload-portada-admin`/`auth-admin` que cambien; esos ya están correctamente documentados en sus propias specs desde #140-#143)

## Impact

- **Documentación modificada:** `CLAUDE.md`, `README.md`, `docs/architecture/overview.md`, `ROADMAP.md`, `docs/project-management.md`.
- **Sin cambios:** código de aplicación, ADRs existentes (inmutables una vez Accepted — `docs/adr/_index.md` ya está al día, no requiere cambios), `CONTRIBUTING.md` (no hace afirmaciones arquitectónicas obsoletas).
- **Sub-dominios afectados:** `foundation` (documentación cross-cutting).
