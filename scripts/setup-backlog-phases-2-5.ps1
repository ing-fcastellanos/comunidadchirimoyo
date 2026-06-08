<#
.SYNOPSIS
  Crea issues "épica" placeholder para las Fases 2-5 (backlog ligero).

.DESCRIPTION
  Da visibilidad del trabajo futuro en el board sin redactar issues accionables
  que se volverían obsoletos. Cada épica se desglosa en issues concretos en la
  mini-sesión de planeación al INICIAR su fase (ahí se genera setup-phaseN-*).

  Todas las épicas se crean con prioridad P3 (backlog). Asume que ya corriste
  setup-github-project.ps1 (milestones y project existen).

  NO es idempotente — correrlo dos veces duplica los issues.

.EXAMPLE
  pwsh ./scripts/setup-backlog-phases-2-5.ps1
#>

$ErrorActionPreference = 'Stop'

# ---------- Config ----------
$Owner        = 'ing-fcastellanos'
$Repo         = 'comunidadchirimoyo'
$RepoFull     = "$Owner/$Repo"
$ProjectTitle = 'Comunidad Chirimoyo Roadmap'

# ---------- Helpers ----------
function Say ($m) { Write-Host "`n▶ $m" -ForegroundColor Cyan }
function Ok  ($m) { Write-Host "  ✓ $m" -ForegroundColor Green }

function Require-Gh {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw "gh CLI no instalado." }
  gh auth status 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "gh no autenticado. Corre: gh auth login" }
}

function New-Epic ($Title, $Labels, $Milestone, $Body) {
  $bodyFile = Join-Path $env:TEMP ("chiri-" + [guid]::NewGuid().ToString() + ".md")
  Set-Content -Path $bodyFile -Value $Body -Encoding utf8
  $labelArgs = @()
  foreach ($l in ($Labels -split ',')) { $labelArgs += @('--label', $l.Trim()) }
  $url = gh issue create --repo $RepoFull --title $Title --body-file $bodyFile `
           @labelArgs --milestone $Milestone --project $ProjectTitle
  Remove-Item $bodyFile -Force
  if ($LASTEXITCODE -ne 0) { throw "Falló la creación del issue: $Title" }
  Ok "épica creada: $Title"
  Write-Host "    $url"
}

# ---------- Verificación ----------
Say "Verificando entorno"
Require-Gh
gh repo view $RepoFull 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Sin acceso al repo $RepoFull" }

$milestones = gh api "repos/$RepoFull/milestones?state=all" | ConvertFrom-Json
foreach ($t in @('Fase 2 — Anfibios','Fase 3 — Presencia','Fase 4 — Voluntarios','Fase 5 — Difusión y pulido')) {
  if (-not ($milestones | Where-Object { $_.title -eq $t })) {
    throw "Milestone '$t' no existe. Corre primero setup-github-project.ps1"
  }
}
$projects = gh project list --owner $Owner --format json --limit 50 | ConvertFrom-Json
if (-not ($projects.projects | Where-Object { $_.title -eq $ProjectTitle })) {
  throw "Project '$ProjectTitle' no existe. Corre primero setup-github-project.ps1"
}
Ok "verificado (milestones 2-5 y project presentes)"

# ========== Fase 2 — Anfibios ==========
Say "Fase 2 — Anfibios"

New-Epic 'Épica: Migrar fichas de anfibios/reptiles a content/fauna/anfibios' `
  'subdomain: aves,type: feature,priority: P3' 'Fase 2 — Anfibios' @'
> **Épica placeholder.** Se desglosa en issues concretos en la mini-sesión de planeación al iniciar la Fase 2.

## Alcance grueso

Convertir las ~10 especies de anfibios/reptiles registradas al esquema de ficha definido en Fase 1, dentro de `content/fauna/anfibios/`, reutilizando el mismo formato y convenciones.

## Posibles sub-issues (a confirmar al planear)

- Validar/extender el esquema de ficha para anfibios/reptiles
- Migrar fichas + imágenes con créditos
- Validar contra el esquema

## Referencias

- ADR-0004, ADR-0005. Depende del esquema de ficha (Fase 1).
'@

New-Epic 'Épica: Habilitar categoría Anfibios/reptiles en el catálogo' `
  'subdomain: aves,type: feature,priority: P3' 'Fase 2 — Anfibios' @'
> **Épica placeholder.** Se desglosa al iniciar la Fase 2.

## Alcance grueso

Exponer los anfibios/reptiles en el catálogo reutilizando listado, buscador, detalle y PDF de Fase 1, con el filtro de categoría (Aves / Anfibios-reptiles) ya previsto.

## Posibles sub-issues (a confirmar al planear)

- Activar el filtro de categoría en buscador y listado
- Verificar páginas de detalle para anfibios
- Incluir anfibios en el PDF del catálogo
- Smoke test en `aves.chirimoyo.org`

## Referencias

- ADR-0005 (anfibios como categoría, no sitio aparte). Reusa componentes de Fase 1.
'@

# ========== Fase 3 — Presencia ==========
Say "Fase 3 — Presencia"

New-Epic 'Épica: Landing chirimoyo.org (intro a la lucha + linktree + contacto)' `
  'subdomain: sitio,type: feature,priority: P3' 'Fase 3 — Presencia' @'
> **Épica placeholder.** Se desglosa al iniciar la Fase 3.

## Alcance grueso

Página principal `chirimoyo.org`: introducción a la defensa del humedal, linktree a los demás sitios/redes, y formulario de contacto. Solo landing.

## Posibles sub-issues (a confirmar al planear)

- Hero + narrativa de la lucha (contenido en repo)
- Linktree (subdominios + redes + donaciones)
- Formulario de contacto (POST al API)

## Referencias

- ADR-0008 (multi-subdominio desde apps/sitio), ADR-0011 (diseño). Depende del sistema de diseño y scaffold (Fase 0).
'@

New-Epic 'Épica: Sitio comunidad (historia, acciones, misión/visión)' `
  'subdomain: comunidad,type: feature,priority: P3' 'Fase 3 — Presencia' @'
> **Épica placeholder.** Se desglosa al iniciar la Fase 3.

## Alcance grueso

`comunidad.chirimoyo.org`: historia del lugar, acciones tomadas en defensa del humedal, y visión/misión. Contenido en repo.

## Posibles sub-issues (a confirmar al planear)

- Página de historia / línea de tiempo de acciones
- Página de misión y visión
- Estructura de contenido en `content/comunidad/`

## Referencias

- ADR-0004 (contenido en repo), ADR-0011 (diseño).
'@

New-Epic 'Épica: Sección de noticias de comunidad' `
  'subdomain: comunidad,type: feature,priority: P3' 'Fase 3 — Presencia' @'
> **Épica placeholder.** Se desglosa al iniciar la Fase 3.

## Alcance grueso

Sección de noticias en `comunidad.chirimoyo.org`: listado y detalle de notas, con el contenido versionado en `content/noticias/`.

## Posibles sub-issues (a confirmar al planear)

- Esquema de la nota (frontmatter)
- Listado paginado de noticias
- Página de detalle + OpenGraph

## Referencias

- ADR-0004 (contenido en repo).
'@

# ========== Fase 4 — Voluntarios ==========
Say "Fase 4 — Voluntarios"

New-Epic 'Épica: API de inscripción de voluntarios + contacto' `
  'subdomain: api,type: feature,priority: P3' 'Fase 4 — Voluntarios' @'
> **Épica placeholder.** Se desglosa al iniciar la Fase 4.

## Alcance grueso

Implementar en `services/api` los dos flujos del backend mínimo: inscripción de voluntarios y contacto. Persistencia en Firestore, email de confirmación, y privacidad.

## Posibles sub-issues (a confirmar al planear)

- Endpoint de inscripción (validación + Firestore + email SMTP)
- Endpoint de contacto
- Aviso de privacidad + consentimiento + reglas de acceso + retención
- Specs OpenSpec de `voluntarios` y `contacto`

## Referencias

- ADR-0006 (API mínima), ADR-0012 (privacidad de datos).
'@

New-Epic 'Épica: Frontend voluntarios (jornadas + calendario + inscripción)' `
  'subdomain: voluntarios,type: feature,priority: P3' 'Fase 4 — Voluntarios' @'
> **Épica placeholder.** Se desglosa al iniciar la Fase 4.

## Alcance grueso

`voluntarios.chirimoyo.org`: difusión de jornadas de limpieza/mantenimiento, calendario, y formulario de inscripción (consume el API).

## Posibles sub-issues (a confirmar al planear)

- Listado/calendario de jornadas (contenido en `content/jornadas/`)
- Formulario de inscripción con consentimiento de privacidad
- Estados de éxito/error + confirmación

## Referencias

- ADR-0006 (API), ADR-0012 (privacidad), ADR-0011 (diseño).
'@

New-Epic 'Épica: Donaciones informativas (Spin/OXXO + en especie)' `
  'subdomain: voluntarios,type: feature,priority: P3' 'Fase 4 — Voluntarios' @'
> **Épica placeholder.** Se desglosa al iniciar la Fase 4.

## Alcance grueso

Sección de donaciones: mostrar datos de transferencia Spin/OXXO (tel/CLABE), QR si aplica, y cómo donar en especie. Sin pasarela de pago.

## Posibles sub-issues (a confirmar al planear)

- Datos de donación en `content/legal/` o `content/`
- Componente de donación (transferencia + QR + en especie)

## Referencias

- ADR-0007 (donaciones informativas).
'@

# ========== Fase 5 — Difusión y pulido ==========
Say "Fase 5 — Difusión y pulido"

New-Epic 'Épica: Analítica respetuosa de privacidad' `
  'subdomain: foundation,type: chore,priority: P3' 'Fase 5 — Difusión y pulido' @'
> **Épica placeholder.** Se desglosa al iniciar la Fase 5.

## Alcance grueso

Integrar analítica sin cookies (Plausible o Umami) en ambas apps para reportar impacto a aliados/donantes, sin banner de consentimiento.

## Posibles sub-issues (a confirmar al planear)

- Elegir Plausible (SaaS) vs Umami (self-host)
- Integrar el script en `sitio` y `catalogo`
- Verificar que no rastrea datos personales

## Referencias

- ADR-0010 (analítica privada).
'@

New-Epic 'Épica: SEO, OpenGraph, sitemap y accesibilidad' `
  'subdomain: foundation,type: feature,priority: P3' 'Fase 5 — Difusión y pulido' @'
> **Épica placeholder.** Se desglosa al iniciar la Fase 5.

## Alcance grueso

Maximizar alcance y calidad: metadatos OpenGraph en todas las páginas, sitemap, robots, y pasada de accesibilidad (WCAG AA) en ambas apps.

## Posibles sub-issues (a confirmar al planear)

- Metadatos + OpenGraph por página
- sitemap.xml + robots.txt
- Auditoría de accesibilidad y correcciones

## Referencias

- ROADMAP Fase 5.
'@

New-Epic 'Épica: Performance + observabilidad básica' `
  'subdomain: foundation,type: chore,priority: P3' 'Fase 5 — Difusión y pulido' @'
> **Épica placeholder.** Se desglosa al iniciar la Fase 5.

## Alcance grueso

Optimización de performance (imágenes, carga, CDN) y observabilidad básica (logs, errores) para los sitios en producción.

## Posibles sub-issues (a confirmar al planear)

- Optimización de imágenes del catálogo
- Lighthouse / Core Web Vitals
- Revisión de logs de Cloud Run y errores

## Referencias

- ROADMAP Fase 5. (Cualquier monitoreo formal nuevo → ADR.)
'@

Say "Listo — épicas de backlog (Fases 2-5) creadas"
$proj = ($projects.projects | Where-Object { $_.title -eq $ProjectTitle } | Select-Object -First 1)
Write-Host "`nProject: https://github.com/users/$Owner/projects/$($proj.number)"
