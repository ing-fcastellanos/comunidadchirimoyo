#!/usr/bin/env bash
# setup-phase1-aves.sh
# Agrega los issues de Fase 1 (Aves) al Project "Comunidad Chirimoyo Roadmap".
# Asume que ya corriste setup-github-project.sh.
#
# Uso:
#   bash scripts/setup-phase1-aves.sh
#
# NO es idempotente — correrlo dos veces duplica los issues.

set -euo pipefail

# ---------- Config ----------
OWNER="ing-fcastellanos"
REPO="comunidadchirimoyo"
REPO_FULL="${OWNER}/${REPO}"
PROJECT_TITLE="Comunidad Chirimoyo Roadmap"
MILESTONE_TITLE="Fase 1 — Aves"

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

cat > "$D/A01.md" <<'EOF'
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
- Tipo: research
EOF

cat > "$D/A02.md" <<'EOF'
## Contexto

Ya existe un catálogo inicial de aves con características y banco de imágenes. Hay que migrarlo a `content/fauna/aves/` siguiendo el esquema definido en A01.

## Tareas

- [ ] Convertir cada especie al formato definido en `content/fauna/aves/`
- [ ] Optimizar y nombrar imágenes (kebab-case) con sus créditos
- [ ] Decidir si las imágenes van al repo o a un bucket GCS (depende del peso total — ver ADR-0003)
- [ ] Validar que todas las fichas cumplen el esquema (script de validación opcional)

## Criterios de éxito

- Catálogo inicial completo en `content/` y validado
- Imágenes optimizadas y referenciadas correctamente

## Referencias

- A01 (esquema), ADR-0003 (storage)
EOF

cat > "$D/A03.md" <<'EOF'
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

- ADR-0005, ADR-0011, A02
EOF

cat > "$D/A04.md" <<'EOF'
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
EOF

cat > "$D/A05.md" <<'EOF'
## Contexto

Página de detalle por especie, estática, basada en el diseño v0.dev.

## Tareas

- [ ] Ruta dinámica `/[categoria]/[slug]` generada en build para cada especie
- [ ] Galería de fotos con créditos
- [ ] Ficha completa según esquema (A01) y diseño v0.dev
- [ ] Meta tags Open Graph por especie (foto + nombre) para compartir en redes
- [ ] Navegación a especies relacionadas (misma familia/categoría)

## Criterios de éxito

- Cada especie tiene su página de detalle estática
- Previews sociales correctos al compartir el enlace

## Referencias

- ADR-0005, ADR-0011, A01
EOF

cat > "$D/A06.md" <<'EOF'
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
EOF

cat > "$D/A07.md" <<'EOF'
## Contexto

Desplegar `aves.chirimoyo.org` a producción (Cloud Run + Firebase Hosting), una vez listas las páginas.

## Tareas

- [ ] Verificar Dockerfile + firebase.json de `apps/catalogo`
- [ ] `npm run deploy_prod` (build → push → Cloud Run → Firebase Hosting)
- [ ] Conectar el subdominio `aves.chirimoyo.org` (depende de F03 de Fase 0)
- [ ] Smoke test en producción (listado, buscador, detalle, PDF)
- [ ] Verificar performance y SSL

## Criterios de éxito

- `aves.chirimoyo.org` en línea con el catálogo funcionando

## Referencias

- ADR-0003 (hosting), Fase 0 F03 (DNS)
EOF

# ---------- Creación efectiva ----------
say "Creando issues de Fase 1 — Aves"

create_issue "Definir esquema de la ficha de ave (campos + formato)" \
  "subdomain: aves,type: research,priority: P0" "$D/A01.md"

create_issue "Migrar catálogo inicial + imágenes a content/fauna/aves" \
  "subdomain: aves,type: feature,priority: P0" "$D/A02.md"

create_issue "Listado del catálogo (estático, diseño v0.dev)" \
  "subdomain: aves,type: feature,priority: P0" "$D/A03.md"

create_issue "Buscador + filtros en cliente (sin backend)" \
  "subdomain: aves,type: feature,priority: P0" "$D/A04.md"

create_issue "Página de detalle de especie (estática + OpenGraph)" \
  "subdomain: aves,type: feature,priority: P0" "$D/A05.md"

create_issue "Generación del PDF del catálogo" \
  "subdomain: aves,type: feature,priority: P1" "$D/A06.md"

create_issue "Deploy aves.chirimoyo.org a producción" \
  "subdomain: aves,type: chore,priority: P1" "$D/A07.md"

# ---------- Cleanup ----------
rm -rf "$D"

say "Listo — 7 issues de Fase 1 creados"
printf "\nProject: https://github.com/users/%s/projects/%s\n" "$OWNER" "$PROJECT_NUM"
