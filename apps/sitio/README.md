# apps/sitio

Sitios de contenido de la Comunidad → **chirimoyo.org** (landing), **comunidad.chirimoyo.org**, **voluntarios.chirimoyo.org**.

Next.js 15 (App Router) · TypeScript · Tailwind v4. `output: "standalone"` → **Cloud Run** (ADR-0008). Un solo build sirve los tres subdominios; el ruteo es por **host** (`middleware.ts`).

## Ruteo por host

```
chirimoyo.org / www / *.run.app / localhost  → landing (app/page.tsx)
comunidad.chirimoyo.org                       → /comunidad
voluntarios.chirimoyo.org                     → /voluntarios
```

El middleware lee `x-forwarded-host` (detrás de Firebase Hosting → Cloud Run) o `host`. En local, las secciones también son accesibles por path (`/comunidad`, `/voluntarios`).

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

`firebase.json` repurposa el site **`chirimoyo`** a un rewrite `**` → Cloud Run `sitio` en **`us-central1`** (Firebase Hosting no soporta rewrites a `northamerica-south1` — ver [ADR-0015](../../docs/decisions/0015-sitio-cloud-run-us-central1.md)). `chirimoyo.org` y `www` (ya conectados) sirven la app sin cambios de DNS. Conectar `comunidad.*` y `voluntarios.*` como dominios custom del mismo site (consola Firebase + A+TXT en Porkbun).

> Orden de deploy: **Cloud Run primero** (verificar vivo), **luego** `firebase deploy` (rewrite), para no romper `chirimoyo.org` durante el cambio.

## Sistema de diseño

Tokens en `app/tokens.css` (generado con `npm run sync:tokens`; no editar a mano — ADR-0013). Header/Footer **propios de sitio** en `components/layout/`. Primitivas en `components/ui/`.

## Pendiente (otros issues)

Landing real + linktree + contacto (Fase 3) · historia/misión/noticias (Fase 3) · jornadas/calendario/inscripción/donaciones (Fase 4). Las formas serán cliente → API (`api.chirimoyo.org`).
