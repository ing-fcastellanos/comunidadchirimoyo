<#
.SYNOPSIS
  Agrega los issues de Fase 0 (Foundation) al Project "Comunidad Chirimoyo Roadmap".

.DESCRIPTION
  Asume que ya corriste setup-github-project.ps1 (labels, milestones y project existen).
  NO es idempotente — correrlo dos veces duplica los issues.

.EXAMPLE
  pwsh ./scripts/setup-phase0-foundation.ps1
#>

$ErrorActionPreference = 'Stop'

# ---------- Config ----------
$Owner          = 'ing-fcastellanos'
$Repo           = 'comunidadchirimoyo'
$RepoFull       = "$Owner/$Repo"
$ProjectTitle   = 'Comunidad Chirimoyo Roadmap'
$MilestoneTitle = 'Fase 0 — Foundation'

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
Say "Creando issues de Fase 0 — Foundation"

New-Issue 'Bootstrap: crear repo público + push del andamiaje + correr setup scripts' `
  'subdomain: foundation,type: chore,priority: P0' @'
## Contexto

El andamiaje local del monorepo (estructura de carpetas, CLAUDE.md, README, ROADMAP, los 12 ADRs en `docs/decisions/`, plantillas `.github/`, workflows de CI y READMEs guía) ya está generado. Falta llevarlo a GitHub.

## Tareas

- [ ] Crear el repo público `comunidadchirimoyo` en GitHub
- [ ] Primer commit + push del andamiaje
- [ ] Verificar que las issue templates y el PR template aparecen en la UI
- [ ] Correr `scripts/setup-github-project.ps1` (labels, milestones, Project)
- [ ] Correr este script y el de Fase 1

## Criterios de éxito

- Repo público accesible con el andamiaje completo
- Board del Project visible con labels y milestones
'@

New-Issue 'Provisionar proyecto GCP nuevo + Firebase + Firestore + Artifact Registry' `
  'subdomain: foundation,type: chore,priority: P0' @'
## Contexto

Necesitamos un proyecto GCP nuevo y dedicado para Chirimoyo (ver ADR-0003), separado del de Sociedad Salvaje.

## Tareas

- [ ] Crear proyecto GCP nuevo (ej. `chirimoyo-xxxx`) con facturación
- [ ] Habilitar APIs: Cloud Run, Artifact Registry, Firestore, Firebase
- [ ] Crear base de datos Firestore (modo nativo, región `northamerica-south1`)
- [ ] Crear repositorio en Artifact Registry para imágenes Docker
- [ ] Crear proyecto Firebase + Hosting
- [ ] Generar service account para el API (NO commitear; ver `.gitignore`)
- [ ] Configurar alerta de presupuesto/costo

## Criterios de éxito

- Proyecto GCP operativo con Firestore y Artifact Registry listos
- Firebase Hosting disponible para conectar dominios

## Referencias

- ADR-0003 (hosting, DB, ambientes)
'@

New-Issue 'Conectar dominios de Porkbun a Firebase Hosting (DNS + SSL)' `
  'subdomain: foundation,type: chore,priority: P1' @'
## Contexto

El dominio `chirimoyo.org` está comprado en Porkbun. Hay que apuntarlo a Firebase Hosting para servir los subdominios (ver ADR-0008).

## Tareas

- [ ] Conectar dominios personalizados en Firebase Hosting: `chirimoyo.org`, `comunidad.chirimoyo.org`, `voluntarios.chirimoyo.org`, `aves.chirimoyo.org`
- [ ] Configurar registros DNS en Porkbun (A/AAAA/TXT de verificación) según indique Firebase
- [ ] Verificar emisión de certificados SSL
- [ ] (Opcional) Definir si `anfibios.chirimoyo.org` redirige a la categoría dentro de aves

## Criterios de éxito

- Los 4 subdominios resuelven con HTTPS hacia Firebase Hosting

## Referencias

- ADR-0003, ADR-0008
'@

New-Issue 'Extraer sistema de diseño de v0.dev → tokens en globals.css' `
  'subdomain: foundation,subdomain: aves,type: feature,priority: P1' @'
## Contexto

Los diseños de v0.dev del catálogo de aves marcan la identidad visual del proyecto (ver ADR-0011). Hay que extraer un sistema de diseño compartido antes de construir las apps.

## Tareas

- [ ] Reunir los exports de v0.dev (buscador + detalle de aves)
- [ ] Extraer paleta de color, tipografías, escala de espaciado y tono
- [ ] Definir tokens en `app/globals.css` (Tailwind v4) reutilizables por `sitio` y `catalogo`
- [ ] Documentar el sistema de diseño (breve guía en `docs/` o README de la app)
- [ ] Seleccionar componentes base de shadcn/ui a usar

## Criterios de éxito

- Tokens de diseño definidos y documentados
- Una página de prueba renderiza con la identidad correcta

## Referencias

- ADR-0011 (sistema de diseño desde v0.dev)
'@

New-Issue 'Scaffold apps/sitio (Next 15 + Tailwind v4 + multi-subdominio)' `
  'subdomain: sitio,type: chore,priority: P0' @'
## Contexto

Scaffold de `apps/sitio` (Next 15 App Router), que servirá landing + comunidad + voluntarios en varios subdominios (ver ADR-0001, ADR-0008).

## Tareas

- [ ] `create-next-app` (App Router, TypeScript, Tailwind v4)
- [ ] Integrar shadcn/ui y los tokens del sistema de diseño
- [ ] Estructura de carpetas: `app/`, `components/layout/` (Header/Footer compartidos)
- [ ] Middleware de ruteo por host (subdominio → sección), o estrategia equivalente
- [ ] Dockerfile + firebase.json + scripts de deploy (espejo de Sociedad Salvaje)
- [ ] Página placeholder por subdominio que renderiza con el diseño

## Criterios de éxito

- `npm run dev` levanta la app
- El ruteo por host muestra la sección correcta
- `npm run build` pasa y el CI de frontend corre

## Referencias

- ADR-0001, ADR-0008
'@

New-Issue 'Scaffold apps/catalogo (Next 15 + Tailwind v4, catálogo estático)' `
  'subdomain: aves,type: chore,priority: P0' @'
## Contexto

Scaffold de `apps/catalogo` (Next 15 App Router) para `aves.chirimoyo.org`. Catálogo 100% estático (ver ADR-0005).

## Tareas

- [ ] `create-next-app` (App Router, TypeScript, Tailwind v4)
- [ ] Integrar shadcn/ui y los tokens del sistema de diseño
- [ ] Estructura para leer datos de fauna desde `content/` en build (SSG)
- [ ] Adaptar los componentes de v0.dev (buscador, detalle) a los patrones del proyecto
- [ ] Dockerfile + firebase.json + scripts de deploy

## Criterios de éxito

- `npm run dev` levanta la app con datos de ejemplo
- `npm run build` genera el catálogo estático
- CI de frontend corre

## Referencias

- ADR-0005 (catálogo estático), ADR-0011 (diseño)
'@

New-Issue 'Scaffold services/api (Flask + Firestore, alcance mínimo)' `
  'subdomain: api,type: chore,priority: P0' @'
## Contexto

Scaffold de `services/api` (Flask + Firestore), de alcance mínimo: inscripciones de voluntarios y contacto (ver ADR-0006).

## Tareas

- [ ] Estructura base: `controllers/`, `services/`, `datastore/`, `models/`
- [ ] Endpoint de salud `/health`
- [ ] Configuración de Firestore (cliente + service account vía env, NO commitear)
- [ ] Dockerfile + Makefile con `deploy_prod` (espejo de Sociedad Salvaje)
- [ ] CORS configurado para los subdominios del proyecto
- [ ] Spec OpenSpec inicial de las capabilities `voluntarios` y `contacto`

## Criterios de éxito

- `python app.py` levanta Flask en :8080
- `/health` responde 200
- `python -m compileall app` pasa (smoke check del CI de API)

## Fuera de alcance

- Auth de usuarios, RBAC, pagos (no aplican; ver ADR-0006)
- La lógica de inscripción/contacto se implementa en Fase 4

## Referencias

- ADR-0006 (API mínima)
'@

New-Issue 'Activar y proteger CI de checks en main' `
  'subdomain: foundation,type: chore,priority: P1' @'
## Contexto

Activar y validar el CI de checks (ver ADR-0009). Los workflows `ci-frontend.yml` y `ci-api.yml` ya existen con filtros de `paths` y se activan cuando las apps/servicio existen.

## Tareas

- [ ] Verificar que `ci-frontend` corre lint + typecheck + build para `sitio` y `catalogo`
- [ ] Verificar que `ci-api` corre ruff + compileall para `services/api`
- [ ] Configurar branch protection en `main`: requerir CI verde + 1 review
- [ ] Ajustar cualquier script faltante (`lint`, `build`) en las apps

## Criterios de éxito

- Un PR de prueba dispara los checks y los muestra como required
- `main` protegido

## Referencias

- ADR-0009 (CI de checks + deploy manual)
'@

Say "Listo — 8 issues de Fase 0 creados"
Write-Host "`nProject: https://github.com/users/$Owner/projects/$($proj.number)"
