## Context

La exploración (`/opsx:explore #53`) partió del issue original ("Deploy del landing a chirimoyo.org") pero encontró un problema más profundo: no es que falte configurar DNS/Hosting desde cero — esa infra ya funciona (`chirimoyo.org`/`www` ya conectados, rewrite a Cloud Run ya correcto, confirmado porque el scaffold SÍ se sirve). El problema real es que **nadie ha vuelto a desplegar el código actual** desde el scaffold de Fase 0, en ninguna de las dos apps (`sitio`, `api`). Evidencia recopilada en vivo:

- `chirimoyo.org`, `/comunidad`, `/voluntarios`: sirven el placeholder "ANDAMIAJE" del scaffold, no el landing/comunidad/voluntarios reales ya mergeados.
- `sitio` tiene 2 revisiones de Cloud Run, pero **ambas usan la misma imagen** (`sha256:5ff0dd8e...`) — la revisión 2 solo fue un `--set-env-vars` (REVALIDATE_SECRET) hecho en esta sesión, no un rebuild.
- `api` tiene **una sola revisión**, del 2026-06-08. `POST /api/contacto` con payload vacío responde `501 {"error":"No implementado","detail":"...pendiente Fase 4"}` — el stub original; la implementación real (#46) solo acepta POST y no existía aún en esa imagen.
- Las reglas de Firestore **sí** están desplegadas y coinciden con el repo (verificado vía la API de `firebaserules.googleapis.com`) — no requieren acción.
- Secret Manager **nunca se habilitó** en el proyecto `chirimoyo`; el SA `chirimoyo-api` solo tiene `roles/datastore.user`, nada de acceso a secrets.
- `aves.chirimoyo.org` (precedente de vanity redirect, ADR-0024) sí funciona en vivo, pero es un **redirect plano** (no preserva subpath — probado con `/psarocolius-montezuma`, cae en la raíz `fauna.chirimoyo.org/aves`), casi seguro vía URL forwarding de Porkbun (DNS, fuera del repo) y no vía Firebase Hosting.
- `comunidad.chirimoyo.org`/`voluntarios.chirimoyo.org` no resuelven — nunca se configuraron.

## Goals / Non-Goals

**Goals:**
- Runbook único (`docs/guias/desplegar-sitio-produccion.md`) que documente el redeploy real de `api` y `sitio`, en el orden correcto, con verificación explícita de que ya no sirven el scaffold/stub.
- Documentar cómo dar de alta los secrets SMTP (Secret Manager, hoy inexistente) sin ponerlos en texto plano.
- Documentar el redirect vanity de `comunidad.*`/`voluntarios.*` igualando el comportamiento real de `aves.*` (redirect plano, sin subpath) — decisión confirmada por el usuario (D4).

**Non-Goals:**
- DNS público de `api.chirimoyo.org` — fuera de alcance (D5, confirmado por el usuario). `apps/sitio` sigue usando `API_URL` apuntando a la URL cruda de Cloud Run del API.
- Preservar subpath en los redirects vanity — descartado explícitamente a favor de igualar `aves.*` (D4).
- Cambiar Dockerfile/firebase.json/Makefile de `sitio`/`api` — ya son correctos; el problema era que nunca se ejecutó un deploy real con ellos, no que estén mal.
- Ejecutar el redeploy real o los cambios de DNS en Porkbun como parte de este OpenSpec change — igual que `deploy-runbook-admin` (#144), este change entrega el runbook; el usuario ejecuta los pasos después.
- Automatizar el redirect vanity vía Firebase Hosting/Cloud Function — se documenta el mecanismo ya usado (Porkbun URL forwarding), no se introduce uno nuevo.

## Decisions

### D1 — Runbook único cubriendo sitio + api + vanity redirects

`docs/guias/desplegar-sitio-produccion.md` en un solo documento, a diferencia del patrón de un-runbook-por-app de fauna/admin — decisión explícita del usuario, dado que las tres piezas (sitio, api, redirects) se verifican juntas en el mismo checklist de smoke (el formulario de contacto de `sitio` depende de `api`).

**Alternativa descartada:** dos guías separadas (`desplegar-sitio-produccion.md` + `desplegar-api-produccion.md`). Habría sido más consistente con el precedente, pero el usuario prefirió un solo documento dado el acoplamiento funcional entre ambos para el smoke test.

### D2 — Orden de deploy: api primero, luego sitio

1. Redeploy de `api` (`make deploy_prod` desde `services/api`).
2. Verificar `GET /health` (200) y que `POST /api/contacto`/`POST /api/voluntarios` ya **no** respondan `501` (probar con payload inválido — 400, no 501/501 stub).
3. Configurar secrets SMTP (ver D3) y volver a desplegar `api` si los secrets se agregan después del primer redeploy.
4. Redeploy de `sitio` (`npm run deploy_prod` desde `apps/sitio`) — su formulario de contacto llama a `api`, así que debe ir después.
5. Configurar redirects vanity (D4) — independiente del orden anterior, puede ir en paralelo.

### D3 — Secrets SMTP vía Secret Manager

Confirmado que `secretmanager.googleapis.com` está deshabilitada en el proyecto. Pasos a documentar:
1. `gcloud services enable secretmanager.googleapis.com --project=chirimoyo`.
2. Crear el secret: `gcloud secrets create MAIL_PASSWORD --project=chirimoyo --replication-policy=automatic` + `gcloud secrets versions add MAIL_PASSWORD --data-file=-` (el usuario provee el valor real, el asistente no lo tiene ni debe pedirlo por chat).
3. Otorgar `roles/secretmanager.secretAccessor` a `chirimoyo-api@chirimoyo.iam.gserviceaccount.com`, scoped al secret.
4. Referenciarlo en el deploy: `gcloud run deploy api ... --set-secrets=MAIL_PASSWORD=MAIL_PASSWORD:latest`.
5. El resto de vars (`MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_DEFAULT_SENDER`, `CONTACTO_INBOX`, `VOLUNTARIOS_INBOX`) van como `--set-env-vars` normales (no son secretas, ya lo documenta `.env.example`).

**Alternativa descartada:** `--set-env-vars` en texto plano para `MAIL_PASSWORD`. Rechazada explícitamente por el propio issue #53 ("NUNCA en el repo → Cloud Run secret / Secret Manager") y por buena práctica general.

### D4 — Vanity redirects: igual que `aves.*`, redirect plano (confirmado por el usuario)

`comunidad.chirimoyo.org` → 301 → `chirimoyo.org/comunidad` (sin preservar subpath), `voluntarios.chirimoyo.org` → 301 → `chirimoyo.org/voluntarios` — mismo mecanismo que `aves.chirimoyo.org` (casi seguro URL forwarding de Porkbun, fuera del repo). El runbook documenta los pasos manuales en el panel de Porkbun (fuera del alcance de este asistente, que no tiene acceso a esa cuenta) y cómo verificar el resultado con `curl -I`.

**Alternativa descartada:** redirect con wildcard preservando subpath (`comunidad.chirimoyo.org/noticias/x` → `chirimoyo.org/comunidad/noticias/x`), tal como sugería literalmente el checklist original del issue #53. Descartada por el usuario a favor de simplicidad y consistencia con el precedente ya viviendo de `aves.*`.

### D5 — `api.chirimoyo.org` fuera de alcance (confirmado por el usuario)

No se configura DNS público para `api.chirimoyo.org` en este cambio. `apps/sitio` sigue usando `API_URL` (server-only, nunca visible al navegador) apuntando directo a la URL de Cloud Run del API (`https://api-9902000097.northamerica-south1.run.app`, o la que resulte del redeploy). Si en el futuro se decide exponerla públicamente, requiere su propio issue/ADR (misma consideración que llevó a ADR-0023/0024 a reconsiderar subdominios dedicados).

### D6 — Checklist de smoke manual, sin automatización nueva

Mismo criterio que `deploy-runbook-admin` (#144) y el runbook de fauna: checklist manual post-deploy, sin script nuevo. Incluye explícitamente verificar que `/api/contacto` y `/api/voluntarios` ya no respondan `501` (la señal más directa de que el redeploy fue real, no solo un cambio de env vars).

## Risks / Trade-offs

- **[Riesgo] El redeploy de `sitio`/`api` es el primer deploy real desde Fase 0 — puede exponer bugs de integración nunca probados en producción** (p. ej. `API_URL` mal configurado, CORS) → Mitigación: el runbook incluye verificación explícita post-deploy de ambos. El bug de `.env.local`/`.dockerignore` que apareció en `admin` **no aplica aquí** — ya verificado: `apps/sitio/.dockerignore` y `services/api/.dockerignore` ya excluyen `.env*`/`.env.local` correctamente.
- **[Riesgo] Redirects vanity dependen de una cuenta externa (Porkbun) fuera del control del asistente** → Mitigación: el runbook documenta los pasos exactos a seguir manualmente y cómo verificarlos con `curl`, igual que se hizo en esta exploración para `aves.*`.
- **[Trade-off] Redirect plano en vez de subpath-preserving** — material ya compartido con una URL profunda de `comunidad.chirimoyo.org/algo` caería en la raíz `/comunidad`, no en `/comunidad/algo`. Aceptado por el usuario (D4) por simplicidad y consistencia con `aves.*`.

## Migration Plan

No aplica migración de datos. Pasos para que el runbook sea usable (ejecutados por el usuario, no por este change):
1. Seguir el runbook para redesplegar `api` con sus secrets SMTP.
2. Verificar que `api` ya no responde `501`.
3. Redesplegar `sitio`.
4. Configurar los redirects vanity en Porkbun.
5. Correr el checklist de smoke del runbook.

## Open Questions

Ninguna — D1-D6 fueron cerradas explícitamente en `/opsx:explore #53` (D4/D5 confirmadas directamente por el usuario; D1-D3/D6 presentadas y no objetadas).
