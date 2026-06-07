# scripts/

Scripts que reproducen la estructura de gestión en GitHub (labels, milestones, Project v2, issues iniciales). Ver [docs/project-management.md](../docs/project-management.md#scripts-de-setup).

Hay dos versiones equivalentes: **PowerShell** (`.ps1`, para Windows) y **bash** (`.sh`, para Linux/macOS/CI). Usa la que corresponda a tu entorno.

| Script | Qué crea | Estado |
|--------|----------|--------|
| `setup-github-project.{ps1,sh}` | Labels, milestones (Fase 0-5), Project v2 | ✅ listo |
| `setup-phase0-foundation.{ps1,sh}` | 8 issues de Fase 0 | ✅ listo |
| `setup-phase1-aves.{ps1,sh}` | 7 issues de Fase 1 | ✅ listo |
| _(fases 2-5)_ | Issues de cada fase | _por escribir cuando se llegue_ |

## Requisitos

- [`gh` CLI](https://cli.github.com/) autenticada con scopes `repo`, `project`, `read:user`.
  Si falta `project`: `gh auth refresh -s project`.
- El repo `comunidadchirimoyo` debe existir en GitHub (es el primer issue de Fase 0).

## Uso — Windows (PowerShell)

```powershell
# Windows PowerShell 5.1:
powershell -ExecutionPolicy Bypass -File .\scripts\setup-github-project.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\setup-phase0-foundation.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\setup-phase1-aves.ps1

# o con PowerShell 7+ (pwsh):
pwsh ./scripts/setup-github-project.ps1
pwsh ./scripts/setup-phase0-foundation.ps1
pwsh ./scripts/setup-phase1-aves.ps1
```

## Uso — Linux/macOS (bash)

```bash
bash scripts/setup-github-project.sh
bash scripts/setup-phase0-foundation.sh
bash scripts/setup-phase1-aves.sh
```

## Notas

- El orden importa: primero `setup-github-project` (crea labels/milestones/Project), luego las fases.
- `setup-github-project` es **idempotente** en labels y milestones. Los scripts de fase **no** son idempotentes: correrlos dos veces duplica los issues.
- Los `.ps1` están guardados en UTF-8 con BOM para que Windows PowerShell 5.1 lea correctamente acentos y guiones largos.
