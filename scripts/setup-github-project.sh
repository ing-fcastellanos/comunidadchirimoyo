#!/usr/bin/env bash
# setup-github-project.sh
# Configura desde cero la base de gestión en GitHub para comunidadchirimoyo:
# labels (sub-dominio × tipo × prioridad), milestones (una por fase) y el Project v2.
#
# NO crea issues — eso lo hacen los scripts de fase (setup-phaseN-*.sh).
#
# Requisitos previos:
#   - gh CLI instalada (https://cli.github.com/)
#   - Autenticado: `gh auth login` (scopes: repo, project, read:user)
#       Si tu PAT no tiene el scope `project`, corre: gh auth refresh -s project
#   - El repo ing-fcastellanos/comunidadchirimoyo debe existir y ser accesible.
#
# Uso:
#   bash scripts/setup-github-project.sh
#
# Idempotencia: labels y milestones se crean-si-no-existen. El Project se detecta
# si ya existe. Puedes correrlo varias veces sin duplicar nada.

set -euo pipefail

# ---------- Config ----------
OWNER="ing-fcastellanos"
REPO="comunidadchirimoyo"
REPO_FULL="${OWNER}/${REPO}"
PROJECT_TITLE="Comunidad Chirimoyo Roadmap"

# ---------- Helpers ----------
say() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }
warn(){ printf "  \033[1;33m!\033[0m %s\n" "$*"; }

require_gh() {
  command -v gh >/dev/null 2>&1 || { echo "gh CLI no instalado. Ver https://cli.github.com/"; exit 1; }
  gh auth status >/dev/null 2>&1 || { echo "gh no autenticado. Corre: gh auth login"; exit 1; }
  if ! gh auth status 2>&1 | grep -q "project"; then
    warn "Tu token podría no tener scope 'project'. Si falla al crear el Project, corre: gh auth refresh -s project"
  fi
}

create_label() {
  local name="$1" color="$2" desc="$3"
  if gh label list --repo "$REPO_FULL" --json name -q '.[].name' | grep -Fxq "$name"; then
    ok "label ya existe: $name"
  else
    gh label create "$name" --repo "$REPO_FULL" --color "$color" --description "$desc" >/dev/null
    ok "label creado: $name"
  fi
}

create_milestone() {
  local title="$1" desc="$2"
  local existing
  existing=$(gh api "repos/${REPO_FULL}/milestones?state=all" --jq ".[] | select(.title==\"$title\") | .number" || true)
  if [[ -n "$existing" ]]; then
    ok "milestone ya existe: $title (#$existing)"
  else
    local number
    number=$(gh api "repos/${REPO_FULL}/milestones" -f title="$title" -f description="$desc" --jq '.number')
    ok "milestone creado: $title (#$number)"
  fi
}

# ---------- Verificación ----------
say "Verificando entorno"
require_gh
gh repo view "$REPO_FULL" >/dev/null 2>&1 || { echo "No tengo acceso al repo $REPO_FULL (¿ya lo creaste?)"; exit 1; }
ok "repo accesible: $REPO_FULL"

# ---------- Labels ----------
say "Creando labels"

# Sub-dominio
create_label "subdomain: foundation"  "5319e7" "Infra, monorepo, docs, CI"
create_label "subdomain: sitio"        "1d76db" "apps/sitio (landing + comunidad + voluntarios)"
create_label "subdomain: comunidad"    "0e8a16" "Contenido y páginas de comunidad"
create_label "subdomain: aves"         "006b75" "Catálogo de aves/anfibios (apps/catalogo)"
create_label "subdomain: voluntarios"  "d93f0b" "Jornadas, inscripción, donaciones"
create_label "subdomain: api"          "fbca04" "services/api (Flask + Firestore)"

# Tipo
create_label "type: adr"      "c5def5" "Architecture decision record"
create_label "type: feature"  "a2eeef" "Nueva funcionalidad"
create_label "type: bug"      "d73a4a" "Defecto"
create_label "type: chore"    "cccccc" "Mantenimiento, refactor, build, config"
create_label "type: research" "e4c2ff" "Investigación o spike sin entregable productivo"
create_label "type: docs"     "0075ca" "Documentación"

# Prioridad
create_label "priority: P0" "b60205" "Crítico — bloqueante"
create_label "priority: P1" "d93f0b" "Alto — esta fase"
create_label "priority: P2" "fbca04" "Medio — siguiente fase"
create_label "priority: P3" "0e8a16" "Bajo — backlog"

# ---------- Milestones ----------
say "Creando milestones (uno por fase)"

create_milestone "Fase 0 — Foundation"        "Repo, monorepo skeleton, docs+ADRs, CI de checks, GCP/Firebase, DNS, sistema de diseño, scaffolds"
create_milestone "Fase 1 — Aves"              "Catálogo: datos en repo, listado+buscador, detalle, PDF, deploy aves.chirimoyo.org"
create_milestone "Fase 2 — Anfibios"          "Anfibios/reptiles como categoría, filtros por grupo (reusa Fase 1)"
create_milestone "Fase 3 — Presencia"         "chirimoyo.org (landing + linktree + contacto) + comunidad (historia, acciones, misión, noticias)"
create_milestone "Fase 4 — Voluntarios"       "Jornadas, calendario, formulario de inscripción (API), donaciones informativas, emails"
create_milestone "Fase 5 — Difusión y pulido" "Analítica, SEO/OpenGraph, accesibilidad, sitemap, performance, observabilidad básica"

# ---------- Project v2 ----------
say "Creando GitHub Project v2 (kanban)"

PROJECT_NUM=$(gh project list --owner "$OWNER" --format json --limit 50 \
  --jq ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number" || true)

if [[ -z "$PROJECT_NUM" || "$PROJECT_NUM" == "null" ]]; then
  PROJECT_NUM=$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json --jq '.number')
  ok "Project creado: #$PROJECT_NUM — $PROJECT_TITLE"
else
  ok "Project ya existe: #$PROJECT_NUM — $PROJECT_TITLE"
fi

# ---------- Cierre ----------
say "Listo"
printf "\nProject: https://github.com/users/%s/projects/%s\n" "$OWNER" "$PROJECT_NUM"
printf "Issues:  https://github.com/%s/issues\n" "$REPO_FULL"
printf "\nSiguiente paso:\n"
printf "  bash scripts/setup-phase0-foundation.sh\n"
printf "  bash scripts/setup-phase1-aves.sh\n"
