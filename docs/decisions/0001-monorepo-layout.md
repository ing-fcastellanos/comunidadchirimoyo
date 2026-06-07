# ADR-0001 — Layout del monorepo: `apps/` + `services/` + `content/`, sin tooling

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff (sin issue previa)_

## Contexto

Comunidad Chirimoyo arranca como un conjunto de sitios de difusión (landing, comunidad, catálogo de fauna, voluntarios) más un backend mínimo. Se quiere un monorepo, reusando el sistema del proyecto hermano **Sociedad Salvaje**. Hay que decidir cómo se organiza y si se adopta tooling de monorepo.

A diferencia de Sociedad Salvaje, aquí la carga es mayormente contenido y solo se prevén **dos** apps frontend y **un** servicio.

## Decisión

1. `apps/<sitio>/` para los frontends Next: **`apps/sitio`** (landing + comunidad + voluntarios) y **`apps/catalogo`** (aves + anfibios).
2. `services/<nombre>/` para backends: **`services/api`** (Flask).
3. `content/` raíz para el contenido versionado (Markdown/JSON): fichas de fauna, noticias, historia, jornadas.
4. `docs/` para documentación cross-cutting; `docs/decisions/` para ADRs.
5. **NO** adoptar tooling de monorepo (ni Nx, ni Turborepo, ni workspaces). Cada app/servicio se construye con sus scripts nativos.

## Alternativas consideradas

- **Una app Next por subdominio (5 apps):** máximo aislamiento, pero 5 Dockerfiles/deploys/CI para un grupo vecinal con un solo dev. Descartada por costo operativo. Ver también ADR-0008.
- **Un solo monolito Next para todo:** mínima operación pero acopla catálogo y sitios de contenido en un deploy, y complica el versionado independiente del catálogo (que evoluciona distinto). Descartada.
- **Tooling de monorepo (Nx/Turborepo/workspaces):** 2 apps + 1 service no justifican la complejidad. Trivial migrar después si aparece código JS/TS compartido real.

## Consecuencias

### Positivas

- Estructura clara y ligera. Cada deploy es independiente, desde su carpeta, con comandos nativos.
- Onboarding mínimo: cualquier dev reconoce un proyecto Next/Flask estándar.
- `content/` separa el contenido (editable por no-devs vía git) del código.

### Negativas

- Sin caché de builds compartida.
- Si `sitio` y `catalogo` llegan a compartir componentes UI reales, habrá que introducir `packages/` (y quizá workspaces) con un ADR.

### Neutras

- `apps/sitio` sirve tres subdominios; la mecánica se detalla en ADR-0008.

## Plan de revisión

Reconsiderar si: aparece un tercer frontend que comparta código real, el número de servicios pasa a 3+, o los tiempos de build/CI se vuelven cuello de botella.

## Referencias

- ADR-0002 (stack), ADR-0008 (multi-subdominio).
- Sociedad Salvaje ADR-0001 (layout análogo).
