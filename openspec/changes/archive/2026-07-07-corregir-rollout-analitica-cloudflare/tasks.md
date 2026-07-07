## 1. Config versionada por app

- [x] 1.1 Crear `apps/sitio/.env.production` con `NEXT_PUBLIC_CF_BEACON_TOKENS={"chirimoyo.org":"fca64e68fa2a4584b791e692ea2235df"}`.
- [x] 1.2 Crear `apps/catalogo/.env.production` con `NEXT_PUBLIC_CF_BEACON_TOKENS={"fauna.chirimoyo.org":"f13a288171d140c79e9fa9b8049a3f50"}`.
- [x] 1.3 En `.gitignore` raíz, añadir excepción `!apps/*/.env.production` (con comentario: token público) tras la regla que bloquea `.env.*`.
- [x] 1.4 Verificar con `git check-ignore -v` que YA NO están ignorados (y que otros `.env.*` siguen bloqueados). → `.env.production` versionables; `.env.local` y `services/api/.env` siguen ignorados.

## 2. Asegurar el horneado en el build de sitio

- [x] 2.1 Revisar `apps/sitio/.dockerignore`: confirma que solo excluye `.env*.local` (NO `.env.production`) → el archivo entra al build. Sin cambios.
- [x] 2.2 Confirmar que el stage `builder` del `apps/sitio/Dockerfile` copia el archivo antes de `npm run build` (ya hace `COPY . .`); no se añade `--build-arg`. Verificado.
- [x] 2.3 `apps/catalogo` no usa Docker (build local → export estático `out/` → firebase deploy); `.env.production` está en el repo durante `next build`. Sin `.dockerignore` que ajustar.

## 3. Actualizar spec y docs (aves→fauna, build-time, 2 sites)

- [x] 3.1 (spec) El delta MODIFIED de `analitica-web` refleja el modelo de 2 dominios y el build-time; se sincroniza al archivar.
- [x] 3.2 `docs/guias/desplegar-fauna-produccion.md`: analítica ahora horneada vía `.env.production` versionado (dominio `fauna.chirimoyo.org`), sin paso manual previo.
- [x] 3.3 `apps/sitio/README.md`: corregida la premisa — build-time vía `.env.production` (Dockerfile `COPY . .`), NO `gcloud run --set-env-vars` (runtime no aplica a `NEXT_PUBLIC`).
- [x] 3.4 Refs residuales a `aves.chirimoyo.org` como dominio de analítica: la única restante es ADR-0020 (inmutable/Accepted y además narrativa histórica) → no se edita.

## 4. Limpieza del change fantasma

- [x] 4.1 Eliminado `openspec/changes/analitica-privada-cloudflare/` (`git rm`; el spec real vive en `openspec/specs/analitica-web/`).
- [x] 4.2 `openspec list` ya no lo muestra como change activo.

## 5. Verificación

- [x] 5.1 `npm run build` de `sitio` con `.env.production` presente → token de `chirimoyo.org` presente en `.next/static/chunks/app/layout-*.js` (horneado ✅).
- [x] 5.2 `npm run build` de `catalogo` → token de `fauna.chirimoyo.org` presente en `out/` (horneado ✅).
- [x] 5.3 Degradación segura garantizada por construcción (`Analytics.tsx`: `if (!raw) return; … if (!token) return null`); host no mapeado (localhost) no inyecta beacon.
- [ ] 5.4 (POST-DEPLOY, manual del usuario) Crear el site `fauna.chirimoyo.org` en Cloudflare si falta, redeploy de ambas apps, y verificar en el panel de Cloudflare / DevTools del dominio real que llegan pageviews sin cookies ni banner. Sites obsoletos (aves/comunidad/voluntarios) se pueden borrar.

## 6. Cierre

- [ ] 6.1 Redactar el comentario de cierre de la épica #24 (enlazando #59 + este change) y cerrarla tras tu visto bueno.
