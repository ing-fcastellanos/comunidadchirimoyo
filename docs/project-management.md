# Gestión del proyecto

Cómo está organizado el trabajo en este repo. Si vas a abrir issues, planear fases o entender el board, empieza aquí.

## Herramientas

- **GitHub Issues** — todas las tareas, bugs y propuestas de ADR
- **GitHub Projects v2** — tablero kanban "Comunidad Chirimoyo Roadmap"
- **GitHub Milestones** — uno por fase (Fase 0 a Fase 5)
- **Labels** — taxonomía de sub-dominio × tipo × prioridad
- **Scripts `setup-*.sh`** — reproducen la estructura del board desde cero

## Modelo de fases

Ver el [`ROADMAP.md`](../ROADMAP.md) para el detalle. Resumen:

| Fase | Foco |
|------|------|
| **0. Foundation** | Repo, skeleton, docs+ADRs, CI, GCP/Firebase, DNS, diseño, scaffolds |
| **1. Aves** | Catálogo: datos, buscador, detalle, PDF, deploy |
| **2. Anfibios** | Anfibios/reptiles como categoría (reusa Fase 1) |
| **3. Presencia** | Landing + comunidad (historia, misión, noticias) |
| **4. Voluntarios** | Jornadas, inscripción, donaciones, emails |
| **5. Difusión & pulido** | Analítica, SEO, accesibilidad, performance |

Cada fase es un **milestone**. Cada issue se asigna al milestone de su fase.

## Taxonomía de labels

Tres dimensiones por issue:

### Sub-dominio (a qué pertenece)

- `subdomain: foundation` — Infra, monorepo, docs, CI
- `subdomain: sitio` — App de landing + comunidad + voluntarios (transversal)
- `subdomain: comunidad` — Contenido y páginas de comunidad
- `subdomain: aves` — Catálogo de aves/anfibios
- `subdomain: voluntarios` — Jornadas, inscripción, donaciones
- `subdomain: api` — Servicio Flask

Una issue puede tener varios sub-dominios cuando cruza fronteras.

### Tipo (qué clase de trabajo es)

- `type: adr` — Architecture Decision Record
- `type: feature` — Nueva funcionalidad
- `type: bug` — Defecto en algo que ya existe
- `type: chore` — Mantenimiento, refactor, configuración, dependencias
- `type: research` — Investigación o spike
- `type: docs` — Documentación

### Prioridad (cuándo entra al trabajo)

- `priority: P0` — Crítico / bloqueante. Trabaja primero
- `priority: P1` — Alto. En esta fase, después de los P0
- `priority: P2` — Medio. Si hay tiempo en esta fase
- `priority: P3` — Bajo. Backlog

## Tablero kanban

Columnas sugeridas: **Backlog** → **Ready** → **In Progress** (1-2 máx, un solo dev) → **In Review** → **Done**.

Vistas útiles: filtrada por milestone (fase activa) y filtrada por sub-dominio (semana temática).

## Issues

### Anatomía de una buena issue

- **Título corto y específico**: empieza con verbo, o prefijo `ADR — ...` para ADRs
- **Cuerpo con secciones**: Contexto, Objetivo/Tareas, Criterios de éxito, Bloqueada por, Bloquea
- **Labels correctas** (sub-dominio, tipo, prioridad)
- **Milestone** asignado y **linked al Project**

### Plantillas

Las issue templates en [`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE) cubren los casos comunes.

## ADRs

Las decisiones no triviales se documentan en [`docs/decisions/`](./decisions/). Flujo:

1. Abre una issue con la plantilla "ADR proposal".
2. Discute las opciones en la issue.
3. Cuando hay decisión, crea `docs/decisions/NNNN-titulo.md` desde [`docs/adr/_template.md`](./adr/_template.md).
4. Actualiza el índice en [`docs/adr/_index.md`](./adr/_index.md).
5. Cierra la issue referenciando el ADR.

Los ADRs son **inmutables** una vez `Accepted`. Si la decisión cambia, se escribe un nuevo ADR que supersede al anterior.

## Scripts de setup

Toda la estructura del Project + labels + milestones + issues iniciales se reproduce con los scripts `setup-*.sh` en [`scripts/`](../scripts).

### Requisitos

- [`gh` CLI](https://cli.github.com/) instalada y autenticada (`gh auth login`) con scopes `repo`, `project`, `read:user`. Si falta `project`: `gh auth refresh -s project`.

### Uso

```bash
# Primero: estructura base + Fase 0
bash scripts/setup-github-project.sh
bash scripts/setup-phase0-foundation.sh

# Luego las fases en orden de prioridad:
bash scripts/setup-phase1-aves.sh
# ... fases 2-5 cuando se llegue a ellas
```

`setup-github-project.sh` es idempotente en labels y milestones. Los scripts de fase **no** son idempotentes para issues (correrlos dos veces duplica issues).
