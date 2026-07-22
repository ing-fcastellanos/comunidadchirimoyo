## Context

El issue #145 pedía alinear `CLAUDE.md`/`README.md`/`docs/architecture/overview.md` con `apps/admin` y la arquitectura Firebase-native de Fase 6. La exploración (`/opsx:explore 145`) encontró que el problema es más profundo que "falta mencionar una app": `CLAUDE.md` contiene dos afirmaciones activamente falsas desde ADR-0028/0029 (que todo el contenido vive en `content/`, y que no hay auth de usuarios). El usuario expandió el alcance a **todos** los documentos cross-cutting desalineados, no solo los tres del issue original — la exploración encontró dos más con gaps reales (`ROADMAP.md`, `docs/project-management.md`) y descartó dos que ya estaban al día (`docs/adr/_index.md`, `CONTRIBUTING.md`).

Este cambio es puramente documental — no modifica comportamiento de ninguna app ni introduce código nuevo. Los ADR-0027 a ADR-0030 ya son la fuente de verdad técnica; este cambio solo propaga sus conclusiones a los documentos de resumen/onboarding que un agente o colaborador nuevo lee primero.

## Goals / Non-Goals

**Goals:**
- Que `CLAUDE.md`, `README.md` y `docs/architecture/overview.md` reflejen `apps/admin`, noticias/jornadas en Firestore, y auth Firebase-native, sin contradecir los ADRs.
- Que `ROADMAP.md` y `docs/project-management.md` documenten Fase 6 como fase existente (ya tiene milestone, ADRs y script de setup en GitHub/repo).
- Cerrar específicamente las dos afirmaciones falsas en `CLAUDE.md` (D1/D2 del explore).

**Non-Goals:**
- No se toca ningún ADR (inmutables una vez `Accepted`) ni `docs/adr/_index.md` (ya está correcto).
- No se toca `CONTRIBUTING.md` (no contiene afirmaciones arquitectónicas obsoletas — su alcance es contribución de contenido de fauna, ajeno a noticias/jornadas).
- No se crean nuevas fases ni milestones — Fase 6 ya existe en GitHub; este cambio solo la documenta donde faltaba.
- No se re-escribe la sección "Cosas que no existen todavía" de `CLAUDE.md` — se revisó en el explore y sigue siendo correcta tal cual.

## Decisions

### D1 — Nuevo aviso crítico en `CLAUDE.md`: noticias/jornadas en Firestore

En "⚠️ Avisos críticos", agregar una tercera entrada con el mismo formato que "El catálogo es estático" y "El API es mínimo":

> **Noticias y jornadas viven en Firestore, no en `content/`**
> Desde ADR-0028, las colecciones `noticias` y `jornadas` son la fuente de verdad — se editan desde `apps/admin`, no con un PR a `content/noticias/*.md` o `content/jornadas/jornadas.json`. El resto del contenido (fauna, landing, historia, misión/visión) sigue en `content/` sin cambios. `apps/sitio` lee ambas colecciones server-side (Firebase Admin SDK, ISR con revalidación on-demand); las reglas de Firestore para estas colecciones permanecen `deny-all` para el client SDK.

**Alternativa descartada:** solo corregir la tabla de stack sin agregar un aviso dedicado. Rechazada: la sección de avisos existe exactamente para prevenir que un agente asuma un invariante roto (aquí: "todo el contenido vive en `content/`"); la tabla de stack es una referencia rápida, no el lugar para la explicación completa de la excepción.

### D2 — Reformular "auth de usuarios" en la tabla de stack de `CLAUDE.md`

Cambiar la fila `Backend` (o agregar una nota) de "no hay auth de usuarios" a distinguir explícitamente:

> **No** hay auth para visitantes públicos de `sitio`/`catalogo`. **Sí** hay auth (Firebase Authentication, email/password, sin auto-registro) para el staff que usa `admin.chirimoyo.org` — ver ADR-0029.

Misma corrección de contenido aplica a la fila "Contenido" (Markdown/JSON en `content/`): se agrega "(excepto noticias/jornadas, ver aviso crítico arriba — ADR-0028)".

**Alternativa descartada:** eliminar la fila "no hay auth de usuarios" por completo. Rechazada: sigue siendo una verdad importante para `sitio`/`catalogo`/`api` — el matiz es necesario, no la eliminación.

### D3 — `apps/admin` en la identidad del proyecto y estructura (los 3 archivos)

Agregar `apps/admin` como cuarto ítem en la lista de apps de `CLAUDE.md`, como fila en la tabla "Sitios" de `README.md`, y como nodo en el diagrama + árbol de `docs/architecture/overview.md`/`README.md`. Descripción consistente en los tres: *"Panel de administración (`admin.chirimoyo.org`): CRUD de noticias y jornadas con login Firebase, Firebase-native (sin extender el API)."*

### D4 — `docs/architecture/overview.md`: boundary de `apps/admin` + corrección de `apps/sitio`

Nueva subsección `### apps/admin` (mismo formato que las subsecciones existentes de `apps/sitio`/`apps/catalogo`/`services/api`):
- Sirve `admin.chirimoyo.org` (Cloud Run `us-central1` + rewrite de Firebase Hosting, igual que `sitio` — ADR-0015).
- Firebase-native: server actions/route handlers vía Firebase Admin SDK, tras validar sesión de Firebase Auth (cookie `__session`). **No** extiende `services/api` (preserva ADR-0006).
- CRUD de `noticias`/`jornadas` sobre las mismas colecciones que lee `sitio`; sube portadas de noticias al bucket de comunidad (GCS, ADR-0021).

Corregir la viñeta de `apps/sitio` que dice "Contenido (historia, misión, noticias, jornadas) leído de `content/` en build (SSG/ISR)" — separar en dos:
- Historia, misión/visión: `content/` en build, sin cambios.
- Noticias, jornadas: Firestore server-side (Firebase Admin SDK), ISR con revalidación on-demand al publicar desde `apps/admin` — ya no es build-time puro.

El diagrama ASCII gana un nodo `apps/admin` conectado a Firestore (mismo Firestore que ya aparece, ahora con dos usos: inscripciones/contacto vía `api`, y noticias/jornadas vía `admin`+lectura de `sitio`). La sección "Datos" gana una línea para noticias/jornadas (sin PII, a diferencia de inscripciones). "Servicios externos" gana Firebase Auth.

**Alternativa descartada:** dibujar dos diagramas separados (uno "público" y uno "admin"). Rechazada: el diagrama actual ya es el único punto de referencia visual del proyecto; dividirlo fragmenta la vista de conjunto que este documento existe para dar.

### D5 — `ROADMAP.md` y `docs/project-management.md`: Fase 6 como fila, no como reescritura

Agregar Fase 6 a ambas tablas de fases con el mismo nivel de detalle que las fases existentes (foco + milestone), citando ADR-0027 a ADR-0030 en "Decisiones de arquitectura" de `ROADMAP.md`. En `docs/project-management.md`: corregir "Fase 0 a Fase 5" → "Fase 0 a Fase 6", agregar `subdomain: admin` a la taxonomía (ya existe en GitHub), y agregar `setup-phase6-contenido-admin.sh` al bloque de ejemplo de scripts (ya existe en `scripts/`, solo faltaba mencionarse).

**Alternativa descartada:** ninguna — es alineación mecánica 1:1 contra el estado real de GitHub (milestone, labels, scripts), sin ambigüedad de diseño.

## Risks / Trade-offs

- **[Riesgo] Quedar desalineado de nuevo en la próxima fase** — mismo riesgo estructural que ya causó este issue (nadie actualiza docs cross-cutting al cerrar una fase) → Mitigación: ninguna nueva aquí (fuera de alcance introducir un check automatizado); se documenta como observación para el checklist de cierre de fase, no como tarea de este cambio.
- **[Trade-off] Redundancia entre `README.md`/`CLAUDE.md`/`overview.md`** al describir `apps/admin` tres veces — mismo patrón ya existente para `sitio`/`catalogo`, cada archivo tiene una audiencia y nivel de detalle distintos (README = overview público, CLAUDE.md = reglas para agentes, overview.md = arquitectura técnica). No se consolida.

## Migration Plan

No aplica — documentación pura, sin pasos de despliegue ni rollback más allá de revertir el commit.

## Open Questions

Ninguna — D1-D5 cierran el alcance completo confirmado por el usuario en `/opsx:explore 145`.
