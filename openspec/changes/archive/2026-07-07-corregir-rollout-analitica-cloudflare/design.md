## Context

`Analytics.tsx` (client component, `next/script afterInteractive`) ya existe en ambas apps y
resuelve `NEXT_PUBLIC_CF_BEACON_TOKENS` (JSON host→token) por `window.location.hostname`, con
degradación segura. El código es correcto. Lo que falla es el **rollout**:

- `NEXT_PUBLIC_*` se inlinea en `next build`. El `Dockerfile` de `sitio` (stage `builder`) corre
  `npm run build` sin el token → se hornea `undefined`. En `catalogo` (export estático) el token
  también es build-time, documentado en la guía, pero apuntaba a `aves.*` (obsoleto).
- ADR-0023 (sitio single-domain) y ADR-0024 (catálogo en `fauna.*`) volvieron obsoletos los 4
  sites de Cloudflare: comunidad/voluntarios/aves ahora son 301 vanity y no registran.
- El usuario aportó los 2 tokens reales:
  - `chirimoyo.org` → `fca64e68fa2a4584b791e692ea2235df`
  - `fauna.chirimoyo.org` → `f13a288171d140c79e9fa9b8049a3f50`

## Goals / Non-Goals

**Goals:**
- Que el beacon dispare en producción en `chirimoyo.org` y `fauna.chirimoyo.org`.
- Inyección build-time robusta que no dependa de recordar flags en cada deploy.
- Spec y docs alineados con el modelo de 2 dominios (ADR-0023/0024).
- Dejar `openspec list` limpio (sin el change fantasma).

**Non-Goals:**
- Cambiar de herramienta, tocar `Analytics.tsx`, o agregar banner/cookies.
- Automatizar alta/baja de sites en Cloudflare desde el repo (manual del usuario).
- Instrumentar eventos personalizados; solo pageviews agregados.

## Decisions

### 1. `.env.production` versionado en vez de `--build-arg`
Se commitea un `.env.production` por app con el token real. Next lo carga automáticamente en
`next build` (producción), así que la analítica "just works" en cada build/deploy sin plumbing.
**Por qué es seguro:** el token de beacon de Cloudflare Web Analytics es **público** — se emite
en el `data-cf-beacon` del `<script>` a todos los navegadores. Versionarlo no expone secreto
alguno. **Por qué no `--build-arg`:** es frágil (si se olvida el flag, la analítica se apaga en
silencio, que es justo el bug actual) y agrega ceremonia a un deploy que hoy es manual.

### 2. Excepción acotada en `.gitignore`
El `.gitignore` raíz bloquea `.env.*` (protege secretos reales: SMTP, service accounts). Se
agrega `!apps/*/.env.production` para permitir SOLO esos dos archivos. `.env.local` y demás
siguen bloqueados. La excepción va acompañada de un comentario que explica que el token es público.

### 3. `sitio/Dockerfile`: verificar, no `--build-arg`
El stage `builder` ya hace `COPY . .` antes de `npm run build`, así que `.env.production` entra
al contexto y Next lo toma. Solo se **verifica** que `.dockerignore` no excluya `.env.production`
(si lo hace, se ajusta). No se añade `ARG`/`ENV` de token al Dockerfile.

### 4. Modelo de 2 sites (no 4)
`chirimoyo.org` cubre todo `sitio` (comunidad/voluntarios son paths; sus subdominios 301 caen en
`chirimoyo.org` y el beacon dispara ahí). `fauna.chirimoyo.org` cubre el catálogo. Los sites
`aves/comunidad/voluntarios` de Cloudflare quedan obsoletos (el usuario los puede borrar; no es
código). El componente no cambia: con una sola entrada por app, la resolución por hostname acierta.

### 5. Limpieza del change fantasma
`openspec/changes/analitica-privada-cloudflare/` (solo `tasks.md`, trackeado) sobró tras el
archive del 2026-06-15 y aparece como "activo" en `openspec list`. Se elimina del árbol (el
change real ya está archivado; su spec `analitica-web` vive en `openspec/specs/`).

## Risks / Trade-offs

- **Token en git:** aceptado — es público por diseño de Cloudflare. Riesgo residual: alguien
  podría falsear pageviews con él (impacto nulo sobre datos/seguridad; a lo sumo ruido en métricas).
- **Verificación real requiere browser con JS + dominio productivo:** el beacon es client-side;
  `curl` no lo ve y `localhost` no mapea. La verificación end-to-end depende del redeploy del
  usuario con los tokens y de revisar el panel de Cloudflare (o DevTools en el dominio real).
- **`.dockerignore` podría excluir `.env.production`:** se revisa explícitamente en las tareas;
  si excluye `.env*`, se añade excepción o se ajusta para no romper el horneado.
- **Doble archivo de env** (`.env.example` + `.env.production`): el example queda como plantilla
  (token vacío) y el production con el valor real; se documenta la diferencia para no confundir.
