## Context

`apps/sitio` debe servir tres subdominios con contenido distinto en su raíz. Servir contenido por host requiere un servidor (leer `Host`) o separar en build. Se evaluaron tres modelos (ver explore #5): **A** Cloud Run + middleware, **B** paths en vez de subdominios, **C** 3 builds estáticos. Se eligió **A** — un solo build/deploy, mantiene subdominios y respeta ADR-0008 (el costo: reintroduce Cloud Run para el front, que escala a cero).

Referencias: `apps/lectores` de SS (Next standalone + Docker + Cloud Run + Firebase rewrites — aunque SS no hace multi-subdominio-en-una-app). El sistema de diseño ya existe (`docs/design-system/`). El site Firebase `chirimoyo` sirve hoy la holding estática (`infra/holding/`) y `chirimoyo.org`+`www` ya están conectados con SSL.

## Goals / Non-Goals

**Goals:**
- Andamiaje Next 15 que renderiza con el diseño y enruta por host.
- Reutilizar el site `chirimoyo` (ya con dominio+SSL) repurposándolo a rewrite → Cloud Run.
- Dejar las 3 secciones vivas (placeholder) y eliminar la holding.

**Non-Goals:**
- Contenido real, formas (contacto/inscripción), conexión DNS de comunidad/voluntarios (runbook), auth.

## Decisions

### D1 · Cloud Run + middleware por host (ADR-0008)

`next.config.ts` con `output: "standalone"`. `middleware.ts` en la raíz de la app:

```
host = request.headers.host
  comunidad.*   → rewrite a /comunidad + pathname
  voluntarios.* → rewrite a /voluntarios + pathname
  (chirimoyo.org / www / *.run.app)  → sin rewrite (landing en /)
matcher: excluye /_next, /api, archivos estáticos
```

Las rutas internas viven en `app/page.tsx` (landing), `app/comunidad/**`, `app/voluntarios/**`. En local se puede forzar el host con un header o probando los paths directos.

- **Alternativa descartada — export estático (modelos B/C del explore)**: B perdía subdominios; C requería 3 builds. A es un solo deploy y respeta ADR-0008.

### D2 · Repurposar el site Firebase `chirimoyo` a rewrite

El site `chirimoyo` cambia de `{"public": "<holding>"}` a:
```json
{ "site": "chirimoyo", "rewrites": [{ "source": "**", "run": { "serviceId": "sitio", "region": "northamerica-south1" } }] }
```
- `chirimoyo.org` y `www` (ya dominios custom del site `chirimoyo`) pasan a servir la Cloud Run **sin tocar DNS**.
- `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` se **agregan como dominios custom al mismo site** `chirimoyo` (consola Firebase → records A+TXT en Porkbun). Una vez conectados, el middleware los enruta por host.
- `infra/holding/` se elimina (el rewrite lo reemplaza).

### D3 · Consumo del sistema de diseño + layout propio

Igual que `catalogo`: `node scripts/sync-design-tokens.mjs` → `app/tokens.css`; `globals.css` (`@import "tailwindcss"` + `@import "./tokens.css"`); `lib/fonts.ts` (next/font); primitivas en `components/ui/`; `lib/utils.ts` (`cn`); `lucide-react`.

**Header/Footer propios de sitio** (los del handoff son de la guía de aves): un Header con la identidad de la Comunidad + navegación entre secciones, y un Footer común. Server Components, usando tokens.

### D4 · Despliegue (Cloud Run, prod-only)

- Dockerfile multi-stage Next standalone (node alpine, `output: standalone`, puerto 8080), espejo de `apps/lectores`.
- `deploy_prod`: build → push a AR `containers` (imagen `sitio`) → `gcloud run deploy sitio --region=northamerica-south1 --allow-unauthenticated --min-instances=0 --port=8080` (corre como la SA por defecto de Cloud Run; no necesita Firestore).
- `firebase deploy --only hosting` publica el rewrite al site `chirimoyo`.
- Un solo ambiente (prod) — ADR-0003.

### D5 · Acceso a contenido

`lib/content.ts` stub tipado que lee `content/comunidad`, `content/noticias`, `content/jornadas` desde la raíz del repo en build (mismo patrón que `catalogo`: default relativo + `CONTENT_DIR`). El parseo real es Fase 3/4.

## Risks / Trade-offs

- **Middleware por host sin precedente en SS** → Mitigación: patrón estándar de Next; se valida en local (paths directos) y en Cloud Run (por host real). Matcher cuidadoso para no interceptar `/_next`/estáticos.
- **Reintroduce Cloud Run/Docker para el front** → aceptado en el explore; escala a cero, costo ~nulo. El proyecto queda con hosting híbrido (catalogo estático; sitio/api en Cloud Run).
- **Re-apuntado del apex**: al publicar el rewrite, `chirimoyo.org` deja de mostrar la holding y sirve la app → asegurarse de que el deploy a Cloud Run esté vivo ANTES de publicar el rewrite (orden: Cloud Run primero, luego firebase deploy).
- **Conexión DNS de comunidad/voluntarios** depende del usuario (consola+Porkbun) → runbook; hasta entonces esos subdominios no resuelven (la app igual responde por host cuando lleguen).

## Migration Plan

1. `create-next-app` manual en `apps/sitio` (standalone, TS, Tailwind v4).
2. Config (next.config, tsconfig alias, postcss, eslint, components.json), sync tokens, fonts, primitivas, cn, lucide.
3. `middleware.ts` (ruteo por host) + secciones placeholder (landing/comunidad/voluntarios) + Header/Footer de sitio.
4. `lib/content.ts` stub; Dockerfile; Makefile; `firebase.json` (rewrite a Cloud Run) + `.firebaserc` (site `chirimoyo`).
5. Deploy: Cloud Run `sitio` (verificar vivo) → `firebase deploy --only hosting` (rewrite) → verificar `chirimoyo.org` sirve la app.
6. Eliminar `infra/holding/`. Runbook para conectar `comunidad.*`/`voluntarios.*`.

Rollback: re-publicar la holding al site `chirimoyo` (git revert de su firebase.json) y borrar el servicio Cloud Run `sitio`.

## Open Questions

- Navegación entre subdominios (links absolutos entre chirimoyo.org / comunidad.* / voluntarios.*) vs relativa — se define al construir el contenido (Fase 3).
- Nombre del servicio Cloud Run: `sitio` (propuesto).
