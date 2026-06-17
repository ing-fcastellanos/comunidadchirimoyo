# apps/sitio

Sitio de contenido de la Comunidad en el dominio único **chirimoyo.org**: landing (`/`), **`/comunidad`** y **`/voluntarios`** (ADR-0023, supersede ADR-0008).

Next.js 15 (App Router) · TypeScript · Tailwind v4. `output: "standalone"` → **Cloud Run** (ADR-0015). El servidor es necesario por las Server Actions del formulario de contacto (ya no por ruteo por host). Las secciones se sirven por **path** mediante el ruteo nativo del App Router; no hay middleware.

## Ruteo por paths

```
chirimoyo.org/             → landing (app/page.tsx)
chirimoyo.org/comunidad    → app/comunidad/...
chirimoyo.org/voluntarios  → app/voluntarios/...
```

Los subdominios `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` se conservan solo como **redirects vanity 301** hacia el path equivalente (difusión). Su configuración de DNS/Hosting vive en el deploy (issue #53):

```
comunidad.chirimoyo.org/*    → 301 → chirimoyo.org/comunidad/*
voluntarios.chirimoyo.org/*  → 301 → chirimoyo.org/voluntarios/*
```

## Comandos

```bash
npm install
npm run dev            # :3000 — / , /comunidad , /voluntarios
npm run build          # standalone
npm run typecheck && npm run lint
npm run sync:tokens    # regenera app/tokens.css desde docs/design-system/
npm run deploy_prod    # docker build/push → Cloud Run 'sitio' → firebase deploy (rewrite)
```

## Hosting

`firebase.json` repurposa el site **`chirimoyo`** a un rewrite `**` → Cloud Run `sitio` en **`us-central1`** (Firebase Hosting no soporta rewrites a `northamerica-south1` — ver [ADR-0015](../../docs/decisions/0015-sitio-cloud-run-us-central1.md)). `chirimoyo.org` y `www` (ya conectados) sirven la app sin cambios de DNS. `comunidad.*` y `voluntarios.*` se configuran como **redirects vanity 301** hacia su path (no como dominios que sirvan la app) — ver issue #53.

> Orden de deploy: **Cloud Run primero** (verificar vivo), **luego** `firebase deploy` (rewrite), para no romper `chirimoyo.org` durante el cambio.

## Analítica (Cloudflare Web Analytics)

Analítica respetuosa de la privacidad ([ADR-0020](../../docs/decisions/0020-analitica-cloudflare-web-analytics.md), supersede ADR-0010): sin cookies, sin PII, sin banner. Seguimiento **por dominio** — `components/Analytics.tsx` resuelve el token del beacon de Cloudflare según el host. Config por entorno (ver [`.env.example`](.env.example)):

- `NEXT_PUBLIC_CF_BEACON_TOKENS` — JSON host→token (un "site" de Cloudflare por dominio que sirve la app; tras ADR-0023 `apps/sitio` sirve un único dominio, `chirimoyo.org`).

`sitio` corre en Cloud Run: define esta variable como **env var del servicio** (`gcloud run ... --set-env-vars` o en la consola) o inyéctala en el build de la imagen. Si falta, la analítica se desactiva sin romper la app. El componente es copia sincronizada con `apps/catalogo` (ADR-0013).

## Sistema de diseño

Tokens en `app/tokens.css` (generado con `npm run sync:tokens`; no editar a mano — ADR-0013). Header/Footer **propios de sitio** en `components/layout/`. Primitivas en `components/ui/`.

## Pendiente (otros issues)

Landing real + linktree + contacto (Fase 3) · historia/misión/noticias (Fase 3) · jornadas/calendario/inscripción/donaciones (Fase 4). Las formas serán cliente → API (`api.chirimoyo.org`).
