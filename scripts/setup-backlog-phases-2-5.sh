#!/usr/bin/env bash
# setup-backlog-phases-2-5.sh
# Crea issues "épica" placeholder para las Fases 2-5 (backlog ligero).
#
# Da visibilidad del trabajo futuro en el board sin redactar issues accionables
# que se volverían obsoletos. Cada épica se desglosa en issues concretos en la
# mini-sesión de planeación al INICIAR su fase (ahí se genera setup-phaseN-*).
#
# Todas con prioridad P3 (backlog). Asume que ya corriste setup-github-project.sh.
#
# Uso:
#   bash scripts/setup-backlog-phases-2-5.sh
#
# NO es idempotente — correrlo dos veces duplica los issues.

set -euo pipefail

# ---------- Config ----------
OWNER="ing-fcastellanos"
REPO="comunidadchirimoyo"
REPO_FULL="${OWNER}/${REPO}"
PROJECT_TITLE="Comunidad Chirimoyo Roadmap"

# ---------- Helpers ----------
say() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }

require_gh() {
  command -v gh >/dev/null 2>&1 || { echo "gh CLI no instalado."; exit 1; }
  gh auth status >/dev/null 2>&1 || { echo "gh no autenticado. Corre: gh auth login"; exit 1; }
}

# Args: title, labels_csv, milestone_title, body_file
new_epic() {
  local title="$1" labels="$2" milestone="$3" body_file="$4"
  local url
  url=$(gh issue create \
        --repo "$REPO_FULL" \
        --title "$title" \
        --body-file "$body_file" \
        --label "$labels" \
        --milestone "$milestone" \
        --project "$PROJECT_TITLE")
  ok "épica creada: $title"
  printf "    %s\n" "$url"
}

milestone_exists() {
  gh api "repos/${REPO_FULL}/milestones?state=all" --jq ".[] | select(.title==\"$1\") | .number"
}

# ---------- Verificación ----------
say "Verificando entorno"
require_gh
gh repo view "$REPO_FULL" >/dev/null 2>&1 || { echo "Sin acceso al repo $REPO_FULL"; exit 1; }
for t in "Fase 2 — Anfibios" "Fase 3 — Presencia" "Fase 4 — Voluntarios" "Fase 5 — Difusión y pulido"; do
  [[ -n "$(milestone_exists "$t")" ]] || { echo "Milestone '$t' no existe. Corre primero setup-github-project.sh"; exit 1; }
done
PROJECT_NUM=$(gh project list --owner "$OWNER" --format json --limit 50 \
  --jq ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number" || true)
[[ -n "$PROJECT_NUM" && "$PROJECT_NUM" != "null" ]] || { echo "Project '$PROJECT_TITLE' no existe. Corre primero setup-github-project.sh"; exit 1; }
ok "verificado (milestones 2-5 y project presentes)"

# ---------- Cuerpos ----------
say "Preparando cuerpos de épica"
D=$(mktemp -d)

cat > "$D/p2a.md" <<'EOF'
> **Épica placeholder.** Se desglosa en issues concretos en la mini-sesión de planeación al iniciar la Fase 2.

## Alcance grueso

Convertir las ~10 especies de anfibios/reptiles registradas al esquema de ficha definido en Fase 1, dentro de `content/fauna/anfibios/`, reutilizando el mismo formato y convenciones.

## Posibles sub-issues (a confirmar al planear)

- Validar/extender el esquema de ficha para anfibios/reptiles
- Migrar fichas + imágenes con créditos
- Validar contra el esquema

## Referencias

- ADR-0004, ADR-0005. Depende del esquema de ficha (Fase 1).
EOF

cat > "$D/p2b.md" <<'EOF'
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
EOF

cat > "$D/p3a.md" <<'EOF'
> **Épica placeholder.** Se desglosa al iniciar la Fase 3.

## Alcance grueso

Página principal `chirimoyo.org`: introducción a la defensa del humedal, linktree a los demás sitios/redes, y formulario de contacto. Solo landing.

## Posibles sub-issues (a confirmar al planear)

- Hero + narrativa de la lucha (contenido en repo)
- Linktree (subdominios + redes + donaciones)
- Formulario de contacto (POST al API)

## Referencias

- ADR-0008 (multi-subdominio desde apps/sitio), ADR-0011 (diseño). Depende del sistema de diseño y scaffold (Fase 0).
EOF

cat > "$D/p3b.md" <<'EOF'
> **Épica placeholder.** Se desglosa al iniciar la Fase 3.

## Alcance grueso

`comunidad.chirimoyo.org`: historia del lugar, acciones tomadas en defensa del humedal, y visión/misión. Contenido en repo.

## Posibles sub-issues (a confirmar al planear)

- Página de historia / línea de tiempo de acciones
- Página de misión y visión
- Estructura de contenido en `content/comunidad/`

## Referencias

- ADR-0004 (contenido en repo), ADR-0011 (diseño).
EOF

cat > "$D/p3c.md" <<'EOF'
> **Épica placeholder.** Se desglosa al iniciar la Fase 3.

## Alcance grueso

Sección de noticias en `comunidad.chirimoyo.org`: listado y detalle de notas, con el contenido versionado en `content/noticias/`.

## Posibles sub-issues (a confirmar al planear)

- Esquema de la nota (frontmatter)
- Listado paginado de noticias
- Página de detalle + OpenGraph

## Referencias

- ADR-0004 (contenido en repo).
EOF

cat > "$D/p4a.md" <<'EOF'
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
EOF

cat > "$D/p4b.md" <<'EOF'
> **Épica placeholder.** Se desglosa al iniciar la Fase 4.

## Alcance grueso

`voluntarios.chirimoyo.org`: difusión de jornadas de limpieza/mantenimiento, calendario, y formulario de inscripción (consume el API).

## Posibles sub-issues (a confirmar al planear)

- Listado/calendario de jornadas (contenido en `content/jornadas/`)
- Formulario de inscripción con consentimiento de privacidad
- Estados de éxito/error + confirmación

## Referencias

- ADR-0006 (API), ADR-0012 (privacidad), ADR-0011 (diseño).
EOF

cat > "$D/p4c.md" <<'EOF'
> **Épica placeholder.** Se desglosa al iniciar la Fase 4.

## Alcance grueso

Sección de donaciones: mostrar datos de transferencia Spin/OXXO (tel/CLABE), QR si aplica, y cómo donar en especie. Sin pasarela de pago.

## Posibles sub-issues (a confirmar al planear)

- Datos de donación en `content/legal/` o `content/`
- Componente de donación (transferencia + QR + en especie)

## Referencias

- ADR-0007 (donaciones informativas).
EOF

cat > "$D/p5a.md" <<'EOF'
> **Épica placeholder.** Se desglosa al iniciar la Fase 5.

## Alcance grueso

Integrar analítica sin cookies (Plausible o Umami) en ambas apps para reportar impacto a aliados/donantes, sin banner de consentimiento.

## Posibles sub-issues (a confirmar al planear)

- Elegir Plausible (SaaS) vs Umami (self-host)
- Integrar el script en `sitio` y `catalogo`
- Verificar que no rastrea datos personales

## Referencias

- ADR-0010 (analítica privada).
EOF

cat > "$D/p5b.md" <<'EOF'
> **Épica placeholder.** Se desglosa al iniciar la Fase 5.

## Alcance grueso

Maximizar alcance y calidad: metadatos OpenGraph en todas las páginas, sitemap, robots, y pasada de accesibilidad (WCAG AA) en ambas apps.

## Posibles sub-issues (a confirmar al planear)

- Metadatos + OpenGraph por página
- sitemap.xml + robots.txt
- Auditoría de accesibilidad y correcciones

## Referencias

- ROADMAP Fase 5.
EOF

cat > "$D/p5c.md" <<'EOF'
> **Épica placeholder.** Se desglosa al iniciar la Fase 5.

## Alcance grueso

Optimización de performance (imágenes, carga, CDN) y observabilidad básica (logs, errores) para los sitios en producción.

## Posibles sub-issues (a confirmar al planear)

- Optimización de imágenes del catálogo
- Lighthouse / Core Web Vitals
- Revisión de logs de Cloud Run y errores

## Referencias

- ROADMAP Fase 5. (Cualquier monitoreo formal nuevo → ADR.)
EOF

# ---------- Creación ----------
say "Creando épicas de backlog (Fases 2-5)"

new_epic "Épica: Migrar fichas de anfibios/reptiles a content/fauna/anfibios" \
  "subdomain: aves,type: feature,priority: P3" "Fase 2 — Anfibios" "$D/p2a.md"
new_epic "Épica: Habilitar categoría Anfibios/reptiles en el catálogo" \
  "subdomain: aves,type: feature,priority: P3" "Fase 2 — Anfibios" "$D/p2b.md"

new_epic "Épica: Landing chirimoyo.org (intro a la lucha + linktree + contacto)" \
  "subdomain: sitio,type: feature,priority: P3" "Fase 3 — Presencia" "$D/p3a.md"
new_epic "Épica: Sitio comunidad (historia, acciones, misión/visión)" \
  "subdomain: comunidad,type: feature,priority: P3" "Fase 3 — Presencia" "$D/p3b.md"
new_epic "Épica: Sección de noticias de comunidad" \
  "subdomain: comunidad,type: feature,priority: P3" "Fase 3 — Presencia" "$D/p3c.md"

new_epic "Épica: API de inscripción de voluntarios + contacto" \
  "subdomain: api,type: feature,priority: P3" "Fase 4 — Voluntarios" "$D/p4a.md"
new_epic "Épica: Frontend voluntarios (jornadas + calendario + inscripción)" \
  "subdomain: voluntarios,type: feature,priority: P3" "Fase 4 — Voluntarios" "$D/p4b.md"
new_epic "Épica: Donaciones informativas (Spin/OXXO + en especie)" \
  "subdomain: voluntarios,type: feature,priority: P3" "Fase 4 — Voluntarios" "$D/p4c.md"

new_epic "Épica: Analítica respetuosa de privacidad" \
  "subdomain: foundation,type: chore,priority: P3" "Fase 5 — Difusión y pulido" "$D/p5a.md"
new_epic "Épica: SEO, OpenGraph, sitemap y accesibilidad" \
  "subdomain: foundation,type: feature,priority: P3" "Fase 5 — Difusión y pulido" "$D/p5b.md"
new_epic "Épica: Performance + observabilidad básica" \
  "subdomain: foundation,type: chore,priority: P3" "Fase 5 — Difusión y pulido" "$D/p5c.md"

rm -rf "$D"

say "Listo — épicas de backlog (Fases 2-5) creadas"
printf "\nProject: https://github.com/users/%s/projects/%s\n" "$OWNER" "$PROJECT_NUM"
