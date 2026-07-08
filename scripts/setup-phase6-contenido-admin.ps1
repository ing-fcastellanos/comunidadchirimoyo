# setup-phase6-contenido-admin.ps1
# Gemelo PowerShell de setup-phase6-contenido-admin.sh.
# Crea el milestone, el label `subdomain: admin`, la épica y los sub-issues de la
# Fase 6 — Contenido dinámico (noticias + jornadas en Firestore) + panel admin.
#
# Decisiones: ADR-0028 (contenido dinámico en Firestore), ADR-0029 (Firebase Auth),
# ADR-0030 (app apps/admin Firebase-native, preserva ADR-0006).
#
# Uso:
#   pwsh scripts/setup-phase6-contenido-admin.ps1
#
# Milestone y label se crean solo si faltan. Los issues NO son idempotentes:
# correrlo dos veces duplica la épica y los sub-issues.

$ErrorActionPreference = "Stop"

$Owner   = "ing-fcastellanos"
$Repo    = "comunidadchirimoyo"
$RepoFull = "$Owner/$Repo"
$MsTitle = "Fase 6 — Contenido dinámico + Admin"
$MsDesc  = "Noticias y jornadas dinámicas desde Firestore + app de administración (admin.chirimoyo.org) con login Firebase Auth. Ver ADR-0028/0029/0030."

function Say($m) { Write-Host "`n> $m" -ForegroundColor Cyan }
function Ok($m)  { Write-Host "  OK $m" -ForegroundColor Green }

gh auth status *> $null
if ($LASTEXITCODE -ne 0) { throw "gh no autenticado. Corre: gh auth login" }

# ---------- Milestone ----------
Say "Milestone"
$existing = gh api "repos/$RepoFull/milestones?state=all" --jq ".[] | select(.title==`"$MsTitle`") | .number"
if ([string]::IsNullOrWhiteSpace($existing)) {
  gh api "repos/$RepoFull/milestones" -f title="$MsTitle" -f state=open -f description="$MsDesc" | Out-Null
  Ok "milestone creado: $MsTitle"
} else {
  Ok "milestone ya existe: $MsTitle"
}

# ---------- Label ----------
Say "Label subdomain: admin"
gh label create "subdomain: admin" --repo $RepoFull --color "9c27b0" --description "apps/admin (panel de gestión, admin.chirimoyo.org)" 2>$null
if ($?) { Ok "label creado" } else { Ok "label ya existe" }

# ---------- Épica ----------
Say "Épica"
$epicBody = @'
## Épica — Fase 6

Hacer **dinámicos** noticias y jornadas/eventos moviéndolos a **Firestore**, y
construir un **panel de administración** (`admin.chirimoyo.org`) con login para
gestionarlos.

- **ADR-0028** — Noticias y jornadas dinámicas en Firestore (refina ADR-0004).
- **ADR-0029** — Auth con Firebase Authentication (email/password, altas manuales).
- **ADR-0030** — App `apps/admin` (Next 15) Firebase-native; preserva ADR-0006.

Se desglosa en los sub-issues de esta Fase 6.
'@
$epicFile = New-TemporaryFile
Set-Content -Path $epicFile -Value $epicBody -Encoding utf8
$epicUrl = gh issue create --repo $RepoFull --title "Épica: Contenido dinámico (noticias + jornadas) y panel de administración" --body-file $epicFile --label "subdomain: foundation,type: feature,priority: P1" --milestone $MsTitle
$epicNum = $epicUrl.Split("/")[-1]
Ok "épica #$epicNum"

# ---------- Sub-issues ----------
function New-SubIssue($title, $labels, $body) {
  $f = New-TemporaryFile
  Set-Content -Path $f -Value "Parte de #$epicNum.`n`n$body" -Encoding utf8
  $url = gh issue create --repo $RepoFull --title $title --label $labels --milestone $MsTitle --body-file $f
  Ok $url
}

Say "Sub-issues"
New-SubIssue "Modelo de datos Firestore: colecciones noticias y jornadas + acceso server-side" "subdomain: foundation,type: chore,priority: P1" "Implementa ADR-0028. Esquema de documentos (traducir tipos de lib/noticias.ts y lib/jornadas.ts), índices, módulo de acceso server-side con Firebase Admin SDK. Reglas Firestore siguen deny-all para client SDK."
New-SubIssue "Migración/seed de noticias y jornadas a Firestore" "subdomain: foundation,type: chore,priority: P2" "Implementa ADR-0028. Seed desde content/noticias/*.md y content/jornadas/jornadas.json (idempotente), verificar paridad, deprecar copias en repo."
New-SubIssue "Noticias dinámicas en el sitio (lectura server-side + ISR)" "subdomain: sitio,subdomain: comunidad,type: feature,priority: P1" "Implementa ADR-0028. /comunidad/noticias + detalle + paginación leen de Firestore server-side con ISR + revalidación on-demand. Preservar JSON-LD, sitemap y OG; borradores ocultos en prod."
New-SubIssue "Jornadas y eventos dinámicos en el sitio" "subdomain: sitio,subdomain: voluntarios,type: feature,priority: P1" "Implementa ADR-0028. Jornadas y eventos desde Firestore; mantener la expansión de recurrencia (proximasJornadas); el select de inscripción consume las ocurrencias dinámicas."
New-SubIssue "Scaffold apps/admin + subdominio admin.chirimoyo.org" "subdomain: admin,subdomain: foundation,type: chore,priority: P1" "Implementa ADR-0030. Scaffold Next 15 con reuse de tokens por copia (ADR-0013); DNS + Firebase Hosting rewrite + Cloud Run us-central1 (ADR-0015)."
New-SubIssue "Login del admin con Firebase Auth" "subdomain: admin,type: feature,priority: P1" "Implementa ADR-0029. Login email/password, guardas de sesión + logout, verificación server-side, provisión manual de usuarios documentada."
New-SubIssue "CRUD de noticias en el admin" "subdomain: admin,type: feature,priority: P1" "Implementa ADR-0030. Crear/editar/borrar, estado borrador-publicado, validación server-side, revalidación on-demand del sitio al publicar (server actions + Admin SDK)."
New-SubIssue "CRUD de jornadas y eventos en el admin" "subdomain: admin,type: feature,priority: P2" "Implementa ADR-0030. Gestionar reglas recurrentes + eventos puntuales; validación server-side."
New-SubIssue "Subida de imágenes de portada a GCS desde el admin" "subdomain: admin,type: feature,priority: P2" "Implementa ADR-0030/0021. Flujo server-side de upload al bucket de comunidad (signed URL o server action); asociar portada + alt a la noticia."
New-SubIssue "Security review del panel admin" "subdomain: admin,type: research,priority: P1" "Refuerza ADR-0029/0030. Revisar auth (sesión/tokens), reglas Firestore deny-all, CORS, service account. Correr /security-review sobre el diff."
New-SubIssue "Deploy runbook + CI checks de apps/admin" "subdomain: admin,subdomain: foundation,type: docs,priority: P2" "Implementa ADR-0030. Guía docs/guias/desplegar-admin-produccion.md + checks de CI para apps/admin (deploy manual, ADR-0009)."
New-SubIssue "Docs: CLAUDE.md/README/overview con apps/admin y arquitectura Firebase-native" "subdomain: foundation,type: docs,priority: P3" "Reflejar apps/admin, noticias/jornadas dinámicas y que el API sigue mínimo (ADR-0006 preservado). Actualizar la sección de cosas que no existen todavía."

Say "Listo — Fase 6 sembrada (épica #$epicNum + 12 sub-issues)"
