# ADR-0002 — Stack heredado de Sociedad Salvaje

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

El responsable del proyecto ya opera Sociedad Salvaje con un stack y un flujo de trabajo conocidos. Reusarlos reduce la curva de aprendizaje, el costo de mantenimiento y el riesgo, y permite copiar configuración (Dockerfiles, deploy scripts, convenciones) entre proyectos.

## Decisión

Adoptar el mismo stack que Sociedad Salvaje:

- **Frontend:** Next.js 15 (App Router) · TypeScript 5 · Tailwind v4 · shadcn/ui.
- **Backend:** Python 3.12 · Flask · Google Cloud Firestore.
- **Infra:** Docker → Artifact Registry → Cloud Run · Firebase Hosting (rewrites).
- **Flujo:** OpenSpec (`explore → propose → apply → archive`) + ADRs + GitHub Projects.

## Alternativas consideradas

- **Stack estático puro (Astro/Eleventy + sin backend):** más barato para sitios de contenido, pero rompe la homogeneidad con Sociedad Salvaje y obligaría a aprender/operar dos stacks. Para el catálogo y la inscripción de voluntarios, Next + Flask ya resuelve sin sobrecosto relevante.
- **Otro backend (Node/TS, Go):** unificaría lenguaje con el frontend, pero el responsable ya domina Flask + Firestore y tiene plantillas listas. No aporta lo suficiente para justificar el cambio.

## Consecuencias

### Positivas

- Reuso directo de configuración, deploy scripts y conocimiento operativo.
- Un solo conjunto de convenciones entre los dos proyectos del responsable.

### Negativas

- Se hereda algo de peso (Flask + Cloud Run) para un backend que será mínimo (ver ADR-0006). Aceptable por homogeneidad.

### Neutras

- Versiones se fijarán al hacer scaffold; se mantendrán al día con Sociedad Salvaje cuando convenga.

## Plan de revisión

Reconsiderar si Sociedad Salvaje migra de stack, o si el costo de Cloud Run para un backend casi inactivo resulta injustificado frente a una función serverless más simple.

## Referencias

- ADR-0001, ADR-0003, ADR-0006.
- CLAUDE.md de Sociedad Salvaje (verdades del stack).
