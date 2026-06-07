<#
.SYNOPSIS
  Agrega los issues de Fase 1 (Aves) al Project "Comunidad Chirimoyo Roadmap".

.DESCRIPTION
  Asume que ya corriste setup-github-project.ps1.
  NO es idempotente — correrlo dos veces duplica los issues.

.EXAMPLE
  pwsh ./scripts/setup-phase1-aves.ps1
#>

$ErrorActionPreference = 'Stop'

# ---------- Config ----------
$Owner          = 'ing-fcastellanos'
$Repo           = 'comunidadchirimoyo'
$RepoFull       = "$Owner/$Repo"
$ProjectTitle   = 'Comunidad Chirimoyo Roadmap'
$MilestoneTitle = 'Fase 1 — Aves'

# ---------- Helpers ----------
function Say ($m) { Write-Host "`n▶ $m" -ForegroundColor Cyan }
function Ok  ($m) { Write-Host "  ✓ $m" -ForegroundColor Green }

function Require-Gh {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw "gh CLI no instalado." }
  gh auth status 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "gh no autenticado. Corre: gh auth login" }
}

function New-Issue ($Title, $Labels, $Body) {
  $bodyFile = Join-Path $env:TEMP ("chiri-" + [guid]::NewGuid().ToString() + ".md")
  Set-Content -Path $bodyFile -Value $Body -Encoding utf8
  $labelArgs = @()
  foreach ($l in ($Labels -split ',')) { $labelArgs += @('--label', $l.Trim()) }
  $url = gh issue create --repo $RepoFull --title $Title --body-file $bodyFile `
           @labelArgs --milestone $MilestoneTitle --project $ProjectTitle
  Remove-Item $bodyFile -Force
  if ($LASTEXITCODE -ne 0) { throw "Falló la creación del issue: $Title" }
  Ok "issue creado: $Title"
  Write-Host "    $url"
}

# ---------- Verificación ----------
Say "Verificando entorno"
Require-Gh
gh repo view $RepoFull 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Sin acceso al repo $RepoFull" }

$milestones = gh api "repos/$RepoFull/milestones?state=all" | ConvertFrom-Json
$m = $milestones | Where-Object { $_.title -eq $MilestoneTitle } | Select-Object -First 1
if (-not $m) { throw "Milestone '$MilestoneTitle' no existe. Corre primero setup-github-project.ps1" }

$projects = gh project list --owner $Owner --format json --limit 50 | ConvertFrom-Json
$proj = $projects.projects | Where-Object { $_.title -eq $ProjectTitle } | Select-Object -First 1
if (-not $proj) { throw "Project '$ProjectTitle' no existe. Corre primero setup-github-project.ps1" }
Ok "verificado (Project #$($proj.number), Milestone #$($m.number))"

# ---------- Issues ----------
Say "Creando issues de Fase 1 — Aves"

New-Issue 'Definir esquema de la ficha de ave (campos + formato)' `
  'subdomain: aves,type: research,priority: P0' @'
## Contexto

El catálogo es estático y los datos viven en `content/` (ver ADR-0004, ADR-0005). Antes de migrar el catálogo inicial necesitamos congelar el esquema de la ficha de cada especie.

## Tareas

- [ ] Definir campos de la ficha de ave: nombre común, nombre científico, familia/orden, estatus (residente / migratoria / accidental), temporada de avistamiento, descripción, tamaño, hábitat dentro del humedal, fotos (1..n con crédito), estatus de conservación (IUCN), audio (opcional)
- [ ] Definir el formato de archivo por especie (Markdown con frontmatter o JSON) y la convención de nombres/slug
- [ ] Definir cómo se modela la categoría (Aves vs Anfibios/reptiles) para reusar en Fase 2
- [ ] Documentar el esquema en `content/README.md` (o un spec OpenSpec si aplica)

## Criterios de éxito

- Esquema documentado y validado contra 2-3 fichas reales del catálogo inicial

## Referencias

- ADR-0004, ADR-0005
'@

New-Issue 'Migrar catálogo inicial + imágenes a content/fauna/aves' `
  'subdomain: aves,type: feature,priority: P0' @'
## Contexto

Ya existe un catálogo inicial de aves con características y banco de imágenes. Hay que migrarlo a `content/fauna/aves/` siguiendo el esquema definido en el issue de esquema.

## Tareas

- [ ] Convertir cada especie al formato definido en `content/fauna/aves/`
- [ ] Optimizar y nombrar imágenes (kebab-case) con sus créditos
- [ ] Decidir si las imágenes van al repo o a un bucket GCS (depende del peso total — ver ADR-0003)
- [ ] Validar que todas las fichas cumplen el esquema (script de validación opcional)

## Criterios de éxito

- Catálogo inicial completo en `content/` y validado
- Imágenes optimizadas y referenciadas correctamente

## Referencias

- Esquema de ficha (issue de research), ADR-0003 (storage)
'@

New-Issue 'Listado del catálogo (estático, diseño v0.dev)' `
  'subdomain: aves,type: feature,priority: P0' @'
## Contexto

Página de listado del catálogo en `apps/catalogo`, generada estáticamente desde `content/`. Diseño basado en los mocks de v0.dev.

## Tareas

- [ ] Cargar todas las fichas en build (SSG) y generar el grid/listado
- [ ] Tarjeta de especie según diseño v0.dev (foto, nombre común/científico, estatus)
- [ ] Paginación o scroll según volumen
- [ ] Estados de carga/vacío y responsive (móvil primero)

## Criterios de éxito

- El listado muestra todas las especies del catálogo
- Coincide con el diseño v0.dev y es responsive

## Referencias

- ADR-0005, ADR-0011
'@

New-Issue 'Buscador + filtros en cliente (sin backend)' `
  'subdomain: aves,type: feature,priority: P0' @'
## Contexto

Buscador y filtros del catálogo, **100% en cliente** sobre un índice JSON generado en build (ver ADR-0005). Sin llamadas al API.

## Tareas

- [ ] Generar índice de búsqueda en build (nombre común/científico, familia, estatus, temporada, categoría)
- [ ] Búsqueda por texto en cliente (tolerante a acentos)
- [ ] Filtros: categoría (Aves / Anfibios-reptiles — listo para Fase 2), estatus, familia, temporada
- [ ] Sincronizar estado de búsqueda con la URL (querystring) para compartir resultados
- [ ] UI según diseño v0.dev

## Criterios de éxito

- Búsqueda y filtros instantáneos sin backend
- Resultados compartibles vía URL

## Referencias

- ADR-0005, ADR-0011
'@

New-Issue 'Página de detalle de especie (estática + OpenGraph)' `
  'subdomain: aves,type: feature,priority: P0' @'
## Contexto

Página de detalle por especie, estática, basada en el diseño v0.dev.

## Tareas

- [ ] Ruta dinámica `/[categoria]/[slug]` generada en build para cada especie
- [ ] Galería de fotos con créditos
- [ ] Ficha completa según esquema y diseño v0.dev
- [ ] Meta tags Open Graph por especie (foto + nombre) para compartir en redes
- [ ] Navegación a especies relacionadas (misma familia/categoría)

## Criterios de éxito

- Cada especie tiene su página de detalle estática
- Previews sociales correctos al compartir el enlace

## Referencias

- ADR-0005, ADR-0011
'@

New-Issue 'Generación del PDF del catálogo' `
  'subdomain: aves,type: feature,priority: P1' @'
## Contexto

Descarga del catálogo completo en PDF, generado a partir de los mismos datos de `content/` (ver ADR-0005).

## Tareas

- [ ] Definir el enfoque de generación (en build vs on-demand) y la librería
- [ ] Plantilla del PDF con la identidad del proyecto (portada, índice, ficha por especie)
- [ ] Incluir fotos principales y datos clave de cada especie
- [ ] Botón de descarga en el catálogo
- [ ] Regenerar el PDF cuando cambian los datos

## Criterios de éxito

- PDF descargable, legible y consistente con el catálogo web

## Referencias

- ADR-0005
'@

New-Issue 'Deploy aves.chirimoyo.org a producción' `
  'subdomain: aves,type: chore,priority: P1' @'
## Contexto

Desplegar `aves.chirimoyo.org` a producción (Cloud Run + Firebase Hosting), una vez listas las páginas.

## Tareas

- [ ] Verificar Dockerfile + firebase.json de `apps/catalogo`
- [ ] `npm run deploy_prod` (build → push → Cloud Run → Firebase Hosting)
- [ ] Conectar el subdominio `aves.chirimoyo.org` (depende del issue de DNS de Fase 0)
- [ ] Smoke test en producción (listado, buscador, detalle, PDF)
- [ ] Verificar performance y SSL

## Criterios de éxito

- `aves.chirimoyo.org` en línea con el catálogo funcionando

## Referencias

- ADR-0003 (hosting), DNS de Fase 0
'@

Say "Listo — 7 issues de Fase 1 creados"
Write-Host "`nProject: https://github.com/users/$Owner/projects/$($proj.number)"
