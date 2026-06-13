# scripts/

Scripts que reproducen la estructura de gestión en GitHub (labels, milestones, Project v2, issues iniciales). Ver [docs/project-management.md](../docs/project-management.md#scripts-de-setup).

Hay dos versiones equivalentes: **PowerShell** (`.ps1`, para Windows) y **bash** (`.sh`, para Linux/macOS/CI). Usa la que corresponda a tu entorno.

| Script | Qué crea | Estado |
|--------|----------|--------|
| `setup-github-project.{ps1,sh}` | Labels, milestones (Fase 0-5), Project v2 | ✅ listo |
| `setup-phase0-foundation.{ps1,sh}` | 8 issues de Fase 0 | ✅ listo |
| `setup-phase1-aves.{ps1,sh}` | 7 issues de Fase 1 | ✅ listo |
| `setup-backlog-phases-2-5.{ps1,sh}` | 11 issues "épica" placeholder (Fases 2-5, P3) | ✅ listo |
| `setup-phase{2,3,4,5}-*.{ps1,sh}` | Issues accionables de cada fase | _se generan en la mini-sesión al iniciar la fase_ |

## Catálogo de fauna (aves)

Scripts del pipeline de contenido del catálogo. El proceso completo de **agregar una
ave** está documentado en [docs/guias/agregar-una-ave.md](../docs/guias/agregar-una-ave.md).

| Script | Qué hace |
|--------|----------|
| `descargar-imagenes-inaturalist.py` | Siembra fotos con licencia libre (CC0/CC BY/CC BY-SA) de iNaturalist para una especie, al banco que consume `migrar-fauna.py`, y fusiona los créditos en `creditos_imagenes.json`. Solo stdlib; no sube nada. |
| `migrar-fauna.py` | Genera las fichas `content/fauna/aves/<slug>/index.md` desde el CSV de origen y, con `--upload`, optimiza y sube fotos/audio a GCS. Idempotente. Ver [ADR-0016](../docs/decisions/0016-storage-imagenes-fauna-gcs.md) / [ADR-0017](../docs/decisions/0017-storage-audio-fauna-gcs.md). |
| `gen-mapa-base.py` | Genera el asset del mapa base (`apps/catalogo/lib/mapa-americas.ts`) desde Natural Earth admin-0. Correr una sola vez. Ver [ADR-0018](../docs/decisions/0018-mapa-distribucion-geografia-real.md). |

```bash
# 1) fotos CC para una especie nueva:
python scripts/descargar-imagenes-inaturalist.py \
    --cientifico "Psarocolius montezuma" --comun "Oropéndola de Moctezuma"
# 2) generar la ficha y subir la media (requiere ADC de gcloud):
python scripts/migrar-fauna.py --upload
```

## Otros scripts

| Script | Qué hace |
|--------|----------|
| `sync-design-tokens.mjs` | Copia el sistema de diseño canónico (`docs/design-system/tokens.css`) a `apps/<app>/app/tokens.css`. Node, multiplataforma, idempotente. Correr tras editar los tokens canónicos o tras scaffoldear una app. Ver [ADR-0013](../docs/decisions/0013-tokens-compartidos-por-copia.md). |

```bash
node scripts/sync-design-tokens.mjs
```

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
