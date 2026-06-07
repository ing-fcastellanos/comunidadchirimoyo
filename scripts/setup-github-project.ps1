<#
.SYNOPSIS
  Configura desde cero la base de gestión en GitHub para comunidadchirimoyo:
  labels (sub-dominio x tipo x prioridad), milestones (una por fase) y el Project v2.

.DESCRIPTION
  NO crea issues — eso lo hacen los scripts de fase (setup-phaseN-*.ps1).

  Requisitos previos:
    - gh CLI instalada (https://cli.github.com/)
    - Autenticado: gh auth login (scopes: repo, project, read:user)
        Si tu PAT no tiene el scope 'project', corre: gh auth refresh -s project
    - El repo ing-fcastellanos/comunidadchirimoyo debe existir y ser accesible.

.EXAMPLE
  pwsh ./scripts/setup-github-project.ps1
  # o en Windows PowerShell:
  powershell -ExecutionPolicy Bypass -File .\scripts\setup-github-project.ps1

.NOTES
  Idempotente: labels y milestones se crean-si-no-existen; el Project se detecta si ya existe.
#>

$ErrorActionPreference = 'Stop'

# ---------- Config ----------
$Owner        = 'ing-fcastellanos'
$Repo         = 'comunidadchirimoyo'
$RepoFull     = "$Owner/$Repo"
$ProjectTitle = 'Comunidad Chirimoyo Roadmap'

# ---------- Helpers ----------
function Say  ($m) { Write-Host "`n▶ $m" -ForegroundColor Cyan }
function Ok   ($m) { Write-Host "  ✓ $m" -ForegroundColor Green }
function Warn ($m) { Write-Host "  ! $m" -ForegroundColor Yellow }

function Require-Gh {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "gh CLI no instalado. Ver https://cli.github.com/"
  }
  gh auth status 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "gh no autenticado. Corre: gh auth login" }
  $status = (gh auth status 2>&1) -join "`n"
  if ($status -notmatch 'project') {
    Warn "Tu token podría no tener scope 'project'. Si falla al crear el Project, corre: gh auth refresh -s project"
  }
}

function Create-Label ($Name, $Color, $Desc) {
  $existing = gh label list --repo $RepoFull --json name | ConvertFrom-Json
  if ($existing.name -contains $Name) {
    Ok "label ya existe: $Name"
  } else {
    gh label create $Name --repo $RepoFull --color $Color --description $Desc | Out-Null
    Ok "label creado: $Name"
  }
}

function Create-Milestone ($Title, $Desc) {
  $milestones = gh api "repos/$RepoFull/milestones?state=all" | ConvertFrom-Json
  $hit = $milestones | Where-Object { $_.title -eq $Title } | Select-Object -First 1
  if ($hit) {
    Ok "milestone ya existe: $Title (#$($hit.number))"
  } else {
    $created = gh api "repos/$RepoFull/milestones" -f title="$Title" -f description="$Desc" | ConvertFrom-Json
    Ok "milestone creado: $Title (#$($created.number))"
  }
}

# ---------- Verificación ----------
Say "Verificando entorno"
Require-Gh
gh repo view $RepoFull 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw "No tengo acceso al repo $RepoFull (¿ya lo creaste?)" }
Ok "repo accesible: $RepoFull"

# ---------- Labels ----------
Say "Creando labels"

# Sub-dominio
Create-Label 'subdomain: foundation'  '5319e7' 'Infra, monorepo, docs, CI'
Create-Label 'subdomain: sitio'       '1d76db' 'apps/sitio (landing + comunidad + voluntarios)'
Create-Label 'subdomain: comunidad'   '0e8a16' 'Contenido y páginas de comunidad'
Create-Label 'subdomain: aves'        '006b75' 'Catálogo de aves/anfibios (apps/catalogo)'
Create-Label 'subdomain: voluntarios' 'd93f0b' 'Jornadas, inscripción, donaciones'
Create-Label 'subdomain: api'         'fbca04' 'services/api (Flask + Firestore)'

# Tipo
Create-Label 'type: adr'      'c5def5' 'Architecture decision record'
Create-Label 'type: feature'  'a2eeef' 'Nueva funcionalidad'
Create-Label 'type: bug'      'd73a4a' 'Defecto'
Create-Label 'type: chore'    'cccccc' 'Mantenimiento, refactor, build, config'
Create-Label 'type: research' 'e4c2ff' 'Investigación o spike sin entregable productivo'
Create-Label 'type: docs'     '0075ca' 'Documentación'

# Prioridad
Create-Label 'priority: P0' 'b60205' 'Crítico — bloqueante'
Create-Label 'priority: P1' 'd93f0b' 'Alto — esta fase'
Create-Label 'priority: P2' 'fbca04' 'Medio — siguiente fase'
Create-Label 'priority: P3' '0e8a16' 'Bajo — backlog'

# ---------- Milestones ----------
Say "Creando milestones (uno por fase)"

Create-Milestone 'Fase 0 — Foundation'        'Repo, monorepo skeleton, docs+ADRs, CI de checks, GCP/Firebase, DNS, sistema de diseño, scaffolds'
Create-Milestone 'Fase 1 — Aves'              'Catálogo: datos en repo, listado+buscador, detalle, PDF, deploy aves.chirimoyo.org'
Create-Milestone 'Fase 2 — Anfibios'          'Anfibios/reptiles como categoría, filtros por grupo (reusa Fase 1)'
Create-Milestone 'Fase 3 — Presencia'         'chirimoyo.org (landing + linktree + contacto) + comunidad (historia, acciones, misión, noticias)'
Create-Milestone 'Fase 4 — Voluntarios'       'Jornadas, calendario, formulario de inscripción (API), donaciones informativas, emails'
Create-Milestone 'Fase 5 — Difusión y pulido' 'Analítica, SEO/OpenGraph, accesibilidad, sitemap, performance, observabilidad básica'

# ---------- Project v2 ----------
Say "Creando GitHub Project v2 (kanban)"

$projects = gh project list --owner $Owner --format json --limit 50 | ConvertFrom-Json
$proj = $projects.projects | Where-Object { $_.title -eq $ProjectTitle } | Select-Object -First 1

if ($proj) {
  $projectNum = $proj.number
  Ok "Project ya existe: #$projectNum — $ProjectTitle"
} else {
  $created = gh project create --owner $Owner --title $ProjectTitle --format json | ConvertFrom-Json
  $projectNum = $created.number
  Ok "Project creado: #$projectNum — $ProjectTitle"
}

# ---------- Cierre ----------
Say "Listo"
Write-Host "`nProject: https://github.com/users/$Owner/projects/$projectNum"
Write-Host "Issues:  https://github.com/$RepoFull/issues"
Write-Host "`nSiguiente paso:"
Write-Host "  pwsh ./scripts/setup-phase0-foundation.ps1"
Write-Host "  pwsh ./scripts/setup-phase1-aves.ps1"
