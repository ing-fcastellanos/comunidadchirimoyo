#!/usr/bin/env bash
# setup-phase0-foundation.sh
# Agrega los issues de Fase 0 (Foundation) al Project "Comunidad Chirimoyo Roadmap".
# Asume que ya corriste setup-github-project.sh (labels, milestones y project existen).
#
# Uso:
#   bash scripts/setup-phase0-foundation.sh
#
# NO es idempotente — correrlo dos veces duplica los issues.

set -euo pipefail

# ---------- Config ----------
OWNER="ing-fcastellanos"
REPO="comunidadchirimoyo"
REPO_FULL="${OWNER}/${REPO}"
PROJECT_TITLE="Comunidad Chirimoyo Roadmap"
MILESTONE_TITLE="Fase 0 — Foundation"

# ---------- Helpers ----------
say() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }

require_gh() {
  command -v gh >/dev/null 2>&1 || { echo "gh CLI no instalado."; exit 1; }
  gh auth status >/dev/null 2>&1 || { echo "gh no autenticado. Corre: gh auth login"; exit 1; }
}

get_milestone_number() {
  gh api "repos/${REPO_FULL}/milestones?state=all" --jq ".[] | select(.title==\"$1\") | .number"
}

check_project_exists() {
  local num
  num=$(gh project list --owner "$OWNER" --format json --limit 50 \
        --jq ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number" || true)
  [[ -n "$num" && "$num" != "null" ]] || { echo "Project '$PROJECT_TITLE' no existe. Corre primero setup-github-project.sh"; exit 1; }
  echo "$num"
}

create_issue() {
  local title="$1" labels="$2" body_file="$3"
  local url
  url=$(gh issue create \
        --repo "$REPO_FULL" \
        --title "$title" \
        --body-file "$body_file" \
        --label "$labels" \
        --milestone "$MILESTONE_TITLE" \
        --project "$PROJECT_TITLE")
  ok "issue creado: $title"
  printf "    %s\n" "$url"
}

# ---------- Verificación ----------
say "Verificando entorno"
require_gh
gh repo view "$REPO_FULL" >/dev/null 2>&1 || { echo "Sin acceso al repo $REPO_FULL"; exit 1; }
M_NUM=$(get_milestone_number "$MILESTONE_TITLE")
[[ -n "$M_NUM" ]] || { echo "Milestone '$MILESTONE_TITLE' no existe. Corre primero setup-github-project.sh"; exit 1; }
PROJECT_NUM=$(check_project_exists)
ok "verificado (Project #$PROJECT_NUM, Milestone #$M_NUM)"

# ---------- Cuerpos de issue ----------
say "Preparando cuerpos de issue"
D=$(mktemp -d)

cat > "$D/F01.md" <<'EOF'
## Contexto

El andamiaje local del monorepo (estructura de carpetas, CLAUDE.md, README, ROADMAP, los 12 ADRs en `docs/decisions/`, plantillas `.github/`, workflows de CI y READMEs guía) ya está generado. Falta llevarlo a GitHub.

## Tareas

- [ ] Crear el repo público `comunidadchirimoyo` en GitHub
- [ ] Primer commit + push del andamiaje
- [ ] Verificar que las issue templates y el PR template aparecen en la UI
- [ ] Correr `scripts/setup-github-project.sh` (labels, milestones, Project)
- [ ] Correr este script y el de Fase 1

## Criterios de éxito

- Repo público accesible con el andamiaje completo
- Board del Project visible con labels y milestones
EOF

cat > "$D/F02.md" <<'EOF'
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
EOF

cat > "$D/F03.md" <<'EOF'
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
EOF

cat > "$D/F04.md" <<'EOF'
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
EOF

cat > "$D/F05.md" <<'EOF'
## Contexto

Scaffold de `apps/sitio` (Next 15 App Router), que servirá landing + comunidad + voluntarios en varios subdominios (ver ADR-0001, ADR-0008).

## Tareas

- [ ] `create-next-app` (App Router, TypeScript, Tailwind v4)
- [ ] Integrar shadcn/ui y los tokens del sistema de diseño (F04)
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
EOF

cat > "$D/F06.md" <<'EOF'
## Contexto

Scaffold de `apps/catalogo` (Next 15 App Router) para `aves.chirimoyo.org`. Catálogo 100% estático (ver ADR-0005).

## Tareas

- [ ] `create-next-app` (App Router, TypeScript, Tailwind v4)
- [ ] Integrar shadcn/ui y los tokens del sistema de diseño (F04)
- [ ] Estructura para leer datos de fauna desde `content/` en build (SSG)
- [ ] Adaptar los componentes de v0.dev (buscador, detalle) a los patrones del proyecto
- [ ] Dockerfile + firebase.json + scripts de deploy

## Criterios de éxito

- `npm run dev` levanta la app con datos de ejemplo
- `npm run build` genera el catálogo estático
- CI de frontend corre

## Referencias

- ADR-0005 (catálogo estático), ADR-0011 (diseño)
EOF

cat > "$D/F07.md" <<'EOF'
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
EOF

cat > "$D/F08.md" <<'EOF'
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
EOF

# ---------- Creación efectiva ----------
say "Creando issues de Fase 0 — Foundation"

create_issue "Bootstrap: crear repo público + push del andamiaje + correr setup scripts" \
  "subdomain: foundation,type: chore,priority: P0" "$D/F01.md"

create_issue "Provisionar proyecto GCP nuevo + Firebase + Firestore + Artifact Registry" \
  "subdomain: foundation,type: chore,priority: P0" "$D/F02.md"

create_issue "Conectar dominios de Porkbun a Firebase Hosting (DNS + SSL)" \
  "subdomain: foundation,type: chore,priority: P1" "$D/F03.md"

create_issue "Extraer sistema de diseño de v0.dev → tokens en globals.css" \
  "subdomain: foundation,subdomain: aves,type: feature,priority: P1" "$D/F04.md"

create_issue "Scaffold apps/sitio (Next 15 + Tailwind v4 + multi-subdominio)" \
  "subdomain: sitio,type: chore,priority: P0" "$D/F05.md"

create_issue "Scaffold apps/catalogo (Next 15 + Tailwind v4, catálogo estático)" \
  "subdomain: aves,type: chore,priority: P0" "$D/F06.md"

create_issue "Scaffold services/api (Flask + Firestore, alcance mínimo)" \
  "subdomain: api,type: chore,priority: P0" "$D/F07.md"

create_issue "Activar y proteger CI de checks en main" \
  "subdomain: foundation,type: chore,priority: P1" "$D/F08.md"

# ---------- Cleanup ----------
rm -rf "$D"

say "Listo — 8 issues de Fase 0 creados"
printf "\nProject: https://github.com/users/%s/projects/%s\n" "$OWNER" "$PROJECT_NUM"
