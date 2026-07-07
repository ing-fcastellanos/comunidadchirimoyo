## Why

La analítica (Cloudflare Web Analytics, #59/ADR-0020) está **codeada pero no funciona en
producción**: los 4 "sites" de Cloudflare (chirimoyo/comunidad/voluntarios/aves) registran 0
pageviews. Dos causas:

1. **Modelo de dominios obsoleto.** El diseño asumía un site por subdominio, pero ADR-0023
   colapsó `sitio` a un solo dominio (`chirimoyo.org`, con comunidad/voluntarios como *paths*;
   los subdominios son 301 vanity) y ADR-0024 movió el catálogo a `fauna.chirimoyo.org`
   (`aves.*` es 301 vanity). Un beacon en un subdominio que redirige (301) nunca dispara.
2. **El token nunca se hornea en `sitio`.** `NEXT_PUBLIC_*` se inlinea en `next build`, pero el
   `Dockerfile` del sitio corre `npm run build` sin el token → queda `undefined`. La tarea que
   pedía inyectarlo "en el runtime de Cloud Run" es inefectiva (NEXT_PUBLIC es build-time).

El usuario ya proporcionó los 2 tokens reales; falta cablear el rollout y refrescar la spec.

## What Changes

- **Modelo de 2 sites** (en vez de 4): `chirimoyo.org` (todo `sitio`) y `fauna.chirimoyo.org`
  (catálogo). Los subdominios vanity no llevan analítica propia.
- **`.env.production` commiteado** por app con el token real. El beacon token de Cloudflare es
  **público** (viaja en el JS del browser), así que versionarlo no filtra ningún secreto y
  hace que Next lo hornee automáticamente en cada `next build` — sin plumbing de ops.
  - `apps/sitio/.env.production` → `{"chirimoyo.org":"fca64e68fa2a4584b791e692ea2235df"}`
  - `apps/catalogo/.env.production` → `{"fauna.chirimoyo.org":"f13a288171d140c79e9fa9b8049a3f50"}`
- **Excepción en `.gitignore`** raíz (`!apps/*/.env.production`) para permitir esos dos archivos,
  manteniendo bloqueado el resto de `.env.*` (secretos reales).
- **Spec `analitica-web` actualizada** al modelo de 2 dominios e inyección build-time en ambas apps.
- **Limpieza:** eliminar el change fantasma `openspec/changes/analitica-privada-cloudflare/`
  (solo `tasks.md`, sobrante del archive del 2026-06-15) que ensucia `openspec list`.
- **Docs:** guía de deploy y referencias `aves.*`→`fauna.*`; corregir la premisa build-time.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `analitica-web`: el modelo de dominios pasa de 4 subdominios a 2 sites (`chirimoyo.org`,
  `fauna.chirimoyo.org`) por ADR-0023/0024; la configuración se hornea en **build** en ambas
  apps (no en runtime de Cloud Run), vía `.env.production` versionado.

## Impact

- **Sub-dominios afectados:** `sitio`, `catálogo` (foundation). No toca `api` ni PII.
- **Código/archivos:**
  - `apps/sitio/.env.production`, `apps/catalogo/.env.production` (nuevos, versionados).
  - `.gitignore` (excepción).
  - `apps/sitio/Dockerfile` — asegurar que `.env.production` esté presente en el stage `builder`
    (ya hace `COPY . .`, se verifica; no requiere `--build-arg`).
  - `openspec/specs/analitica-web/spec.md` (vía delta).
  - `docs/guias/desplegar-fauna-produccion.md` y guía/README de `sitio`.
  - Borrar `openspec/changes/analitica-privada-cloudflare/`.
- **Sin ADR nuevo:** el cambio 4→2 sites es consecuencia de ADR-0023/0024 ya aceptados.
- **Manual del usuario (fuera del código):** crear el site `fauna.chirimoyo.org` en Cloudflare
  (el token ya se generó); redeploy de ambas apps; opcional borrar los sites obsoletos
  (aves/comunidad/voluntarios).

## No-goals

- No se cambia la herramienta de analítica (sigue Cloudflare Web Analytics, ADR-0020).
- No se agrega banner de consentimiento (no hay cookies ni PII; ADR-0020/0012).
- No se toca el componente `Analytics.tsx` (su resolución host→token ya es correcta; con una
  sola entrada por app basta).
- No se gestiona el alta/baja de sites en Cloudflare desde el repo (es acción manual del usuario).
