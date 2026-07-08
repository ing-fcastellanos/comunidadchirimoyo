#!/usr/bin/env bash
# setup-phase6-contenido-admin.sh
# Crea el milestone, el label `subdomain: admin`, la épica y los sub-issues de la
# Fase 6 — Contenido dinámico (noticias + jornadas en Firestore) + panel admin.
#
# Decisiones: ADR-0028 (contenido dinámico en Firestore, refina ADR-0004),
# ADR-0029 (auth con Firebase Auth), ADR-0030 (app apps/admin Firebase-native,
# preserva ADR-0006).
#
# Uso:
#   bash scripts/setup-phase6-contenido-admin.sh
#
# El milestone y el label se crean solo si faltan (idempotente). Los issues NO
# son idempotentes: correrlo dos veces duplica la épica y los sub-issues.

set -euo pipefail

OWNER="ing-fcastellanos"
REPO="comunidadchirimoyo"
REPO_FULL="${OWNER}/${REPO}"
MS_TITLE="Fase 6 — Contenido dinámico + Admin"
MS_DESC="Noticias y jornadas dinámicas desde Firestore + app de administración (admin.chirimoyo.org) con login Firebase Auth. Ver ADR-0028/0029/0030."

say() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }

command -v gh >/dev/null 2>&1 || { echo "gh CLI no instalado."; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh no autenticado. Corre: gh auth login"; exit 1; }

# ---------- Milestone ----------
say "Milestone"
if [[ -z "$(gh api "repos/${REPO_FULL}/milestones?state=all" --jq ".[] | select(.title==\"${MS_TITLE}\") | .number")" ]]; then
  gh api "repos/${REPO_FULL}/milestones" -f title="${MS_TITLE}" -f state=open -f description="${MS_DESC}" >/dev/null
  ok "milestone creado: ${MS_TITLE}"
else
  ok "milestone ya existe: ${MS_TITLE}"
fi

# ---------- Label ----------
say "Label subdomain: admin"
gh label create "subdomain: admin" --repo "$REPO_FULL" --color "9c27b0" \
  --description "apps/admin (panel de gestión, admin.chirimoyo.org)" 2>/dev/null \
  && ok "label creado" || ok "label ya existe"

# ---------- Épica ----------
say "Épica"
D=$(mktemp -d)
cat > "$D/epic.md" <<'EOF'
## Épica — Fase 6

Hacer **dinámicos** noticias y jornadas/eventos moviéndolos a **Firestore**, y
construir un **panel de administración** (`admin.chirimoyo.org`) con login para
gestionarlos.

- **ADR-0028** — Noticias y jornadas dinámicas en Firestore (refina ADR-0004).
- **ADR-0029** — Auth con Firebase Authentication (email/password, altas manuales).
- **ADR-0030** — App `apps/admin` (Next 15) Firebase-native; preserva ADR-0006.

Se desglosa en los sub-issues de esta Fase 6.
EOF
EPIC_URL=$(gh issue create --repo "$REPO_FULL" \
  --title "Épica: Contenido dinámico (noticias + jornadas) y panel de administración" \
  --body-file "$D/epic.md" \
  --label "subdomain: foundation,type: feature,priority: P1" \
  --milestone "$MS_TITLE")
EPIC_NUM="${EPIC_URL##*/}"
ok "épica #${EPIC_NUM}"

# ---------- Sub-issues ----------
# Args: title  labels  body
mk() {
  local body_file; body_file=$(mktemp)
  printf 'Parte de #%s.\n\n%s\n' "$EPIC_NUM" "$3" > "$body_file"
  local url
  url=$(gh issue create --repo "$REPO_FULL" --title "$1" --label "$2" --milestone "$MS_TITLE" --body-file "$body_file")
  ok "$url"
}

say "Sub-issues"
mk "Modelo de datos Firestore: colecciones noticias y jornadas + acceso server-side" \
   "subdomain: foundation,type: chore,priority: P1" \
   "Implementa ADR-0028. Esquema de documentos (traducir tipos de lib/noticias.ts y lib/jornadas.ts), índices, módulo de acceso server-side con Firebase Admin SDK. Reglas Firestore siguen deny-all para client SDK."
mk "Migración/seed de noticias y jornadas a Firestore" \
   "subdomain: foundation,type: chore,priority: P2" \
   "Implementa ADR-0028. Seed desde content/noticias/*.md y content/jornadas/jornadas.json (idempotente), verificar paridad, deprecar copias en repo."
mk "Noticias dinámicas en el sitio (lectura server-side + ISR)" \
   "subdomain: sitio,subdomain: comunidad,type: feature,priority: P1" \
   "Implementa ADR-0028. /comunidad/noticias + detalle + paginación leen de Firestore server-side con ISR + revalidación on-demand. Preservar JSON-LD, sitemap y OG; borradores ocultos en prod."
mk "Jornadas y eventos dinámicos en el sitio" \
   "subdomain: sitio,subdomain: voluntarios,type: feature,priority: P1" \
   "Implementa ADR-0028. Jornadas y eventos desde Firestore; mantener la expansión de recurrencia (proximasJornadas); el select de inscripción consume las ocurrencias dinámicas."
mk "Scaffold apps/admin + subdominio admin.chirimoyo.org" \
   "subdomain: admin,subdomain: foundation,type: chore,priority: P1" \
   "Implementa ADR-0030. Scaffold Next 15 con reuse de tokens por copia (ADR-0013); DNS + Firebase Hosting rewrite + Cloud Run us-central1 (ADR-0015)."
mk "Login del admin con Firebase Auth" \
   "subdomain: admin,type: feature,priority: P1" \
   "Implementa ADR-0029. Login email/password, guardas de sesión + logout, verificación server-side, provisión manual de usuarios documentada."
mk "CRUD de noticias en el admin" \
   "subdomain: admin,type: feature,priority: P1" \
   "Implementa ADR-0030. Crear/editar/borrar, estado borrador↔publicado, validación server-side, revalidación on-demand del sitio al publicar (server actions + Admin SDK)."
mk "CRUD de jornadas y eventos en el admin" \
   "subdomain: admin,type: feature,priority: P2" \
   "Implementa ADR-0030. Gestionar reglas recurrentes + eventos puntuales; validación server-side."
mk "Subida de imágenes de portada a GCS desde el admin" \
   "subdomain: admin,type: feature,priority: P2" \
   "Implementa ADR-0030/0021. Flujo server-side de upload al bucket de comunidad (signed URL o server action); asociar portada + alt a la noticia."
mk "Security review del panel admin" \
   "subdomain: admin,type: research,priority: P1" \
   "Refuerza ADR-0029/0030. Revisar auth (sesión/tokens), reglas Firestore deny-all, CORS, service account. Correr /security-review sobre el diff."
mk "Deploy runbook + CI checks de apps/admin" \
   "subdomain: admin,subdomain: foundation,type: docs,priority: P2" \
   "Implementa ADR-0030. Guía docs/guias/desplegar-admin-produccion.md + checks de CI para apps/admin (deploy manual, ADR-0009)."
mk "Docs: CLAUDE.md/README/overview con apps/admin y arquitectura Firebase-native" \
   "subdomain: foundation,type: docs,priority: P3" \
   "Reflejar apps/admin, noticias/jornadas dinámicas y que el API sigue mínimo (ADR-0006 preservado). Actualizar la sección de cosas que no existen todavía."

say "Listo — Fase 6 sembrada (épica #${EPIC_NUM} + 12 sub-issues)"
