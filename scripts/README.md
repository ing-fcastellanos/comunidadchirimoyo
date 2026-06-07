# scripts/

Scripts `setup-*.sh` que reproducen la estructura de gestión en GitHub (labels, milestones, Project v2, issues iniciales). Ver [docs/project-management.md](../docs/project-management.md#scripts-de-setup).

| Script | Qué crea | Estado |
|--------|----------|--------|
| `setup-github-project.sh` | Labels, milestones (Fase 0-5), Project v2 | ✅ listo |
| `setup-phase0-foundation.sh` | 8 issues de Fase 0 | ✅ listo |
| `setup-phase1-aves.sh` | 7 issues de Fase 1 | ✅ listo |
| _(fases 2-5)_ | Issues de cada fase | _por escribir cuando se llegue_ |

## Requisitos

- [`gh` CLI](https://cli.github.com/) autenticada con scopes `repo`, `project`, `read:user`.
  Si falta `project`: `gh auth refresh -s project`.

## Uso

```bash
bash scripts/setup-github-project.sh
bash scripts/setup-phase0-foundation.sh
bash scripts/setup-phase1-aves.sh
```

`setup-github-project.sh` es idempotente en labels y milestones. Los scripts de fase **no** son idempotentes para issues.
