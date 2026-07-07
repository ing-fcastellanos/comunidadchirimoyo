# Desplegar fauna.chirimoyo.org a producción

Runbook para publicar el catálogo de fauna (`apps/catalogo` → `fauna.chirimoyo.org`).
`aves.chirimoyo.org` es un vanity 301 hacia `fauna.chirimoyo.org/aves` (ADR-0024), configurado
fuera del repo. Cubre el issue [#15](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/15).

> El catálogo es un **export estático servido por Firebase Hosting** — **no** usa
> Cloud Run ni Docker (ver [ADR-0014](../decisions/0014-catalogo-export-estatico.md),
> que diverge a propósito del patrón Cloud Run de [ADR-0003](../decisions/0003-hosting-db-ambientes.md)).
> Si alguien menciona "Dockerfile" o "push a Cloud Run" para este sitio, está
> trabajando con información desactualizada.

## Panorama

```
1. PREREQUISITOS   firebase login · deps instaladas · banco local de fotos · Chromium
2. DEPLOY          npm run deploy_prod   (build:pdf → next build → smoke → firebase deploy)
3. SMOKE TEST      automático (npm run smoke) + verificación manual en producción
4. CIERRE          verificar dominio + vanity 301, marcar checklist del issue
```

Una sola máquina, un solo comando. No hay CI/CD de deploy automático
([ADR-0009](../decisions/0009-ci-checks-deploy-manual.md)): los deploys son manuales.

## Arquitectura del deploy

```
   apps/catalogo                         Firebase Hosting (proyecto: chirimoyo)
   ┌────────────────────────┐            ┌─────────────────────────────────┐
   │ npm run deploy_prod     │            │ target "prod" → site            │
   │  ├ build:pdf  → PDF      │  out/ ───▶ │ "fauna-chirimoyo"               │
   │  ├ next build → out/     │            │  → fauna.chirimoyo.org (CDN+SSL)│
   │  ├ smoke (verifica out/) │            └─────────────────────────────────┘
   │  └ firebase deploy       │
   └────────────────────────┘
            │                              Google Cloud Storage (público)
            │ las fotos NO van en out/ ──▶ storage.googleapis.com/
            │                              catalogo-aves-chirimoyo  (ADR-0016)
```

El sitio referencia las fotos por URL del bucket vía `fotoUrl()`
([fauna-schema.ts](../../apps/catalogo/lib/fauna-schema.ts)). El `out/` solo lleva
HTML/CSS/JS, el PDF y los favicons. **Las imágenes deben estar ya subidas al bucket**
antes del deploy (lo están; ver la guía [Agregar una ave](agregar-una-ave.md) para el
flujo de subida).

## 1. Prerequisitos (una sola vez por máquina)

| Requisito | Cómo verificar / instalar |
|---|---|
| Firebase CLI autenticada en el proyecto `chirimoyo` | `firebase login` · `firebase projects:list` |
| Dependencias de la app instaladas | `cd apps/catalogo && npm install` |
| Chromium de Playwright (para el PDF) | `npx playwright install chromium` |
| Banco local de imágenes (para el PDF) | carpeta en `FAUNA_BANCO_DIR` (default en `Downloads`); ver [build-pdf.mts](../../apps/catalogo/scripts/build-pdf.mts) |

> El **banco local** solo lo necesita la generación del PDF (lee las fotos de disco
> para embeberlas). El **sitio** usa el bucket, no el banco. Si el banco no está, el
> PDF sale con placeholders pero el build no falla.

## 2. Deploy

Desde `apps/catalogo`:

```bash
npm run deploy_prod
```

Esto encadena, en orden:

1. **`build:pdf`** — compila el CSS de impresión y genera los dos PDFs
   (`public/catalogo-aves-chirimoyo.pdf` y `catalogo-herpetofauna-chirimoyo.pdf`) con Chromium.
2. **`next build`** — emite `out/` (export estático), incluyendo los PDFs y los favicons.
3. **`smoke`** — verifica el `out/` (rutas, enlaces internos, PDFs íntegros, sin API); aborta el
   deploy si algo falla. Ver [smoke-fauna.mts](../../apps/catalogo/scripts/smoke-fauna.mts).
4. **`firebase deploy --only hosting:prod --project=chirimoyo`** — sube `out/` al
   site `fauna-chirimoyo` (target `prod` en `.firebaserc`).

Al terminar, Firebase imprime la **Hosting URL**. El deploy reemplaza la página de
*coming soon* que servía el dominio.

### Analítica (Cloudflare Web Analytics) — variables de build

El catálogo es export estático: las `NEXT_PUBLIC_*` se inyectan en **`next build`**, no en
runtime. La analítica ([ADR-0020](../decisions/0020-analitica-cloudflare-web-analytics.md)) queda
horneada automáticamente porque el token vive versionado en
[`apps/catalogo/.env.production`](../../apps/catalogo/.env.production):

- `NEXT_PUBLIC_CF_BEACON_TOKENS` — JSON `{"fauna.chirimoyo.org":"<token>"}` (token del "site" de Cloudflare).

El token de beacon es **público** (viaja en el JS del navegador), por eso se versiona sin riesgo.
No hace falta ningún paso manual antes de `npm run deploy_prod`. Si el archivo faltara, el sitio
despliega igual pero **sin analítica** (degradación segura, sin error). El `.env.example` queda
como plantilla con el token vacío.

## 3. Smoke test en producción

El `deploy_prod` ya corrió `npm run smoke` sobre el `out/` (rutas, enlaces, PDFs, sin API).
Tras el deploy, abrir `https://fauna.chirimoyo.org` y verificar en vivo:

- [ ] **Hub** (`/`) carga (hero, tarjetas de grupo con conteos, destacadas, sin errores en consola).
- [ ] **Índices** `/aves`, `/anfibios`, `/reptiles` listan sus especies.
- [ ] **Buscador** (`/busqueda`): filtra por grupo/forma/color/lugar; los resultados muestran foto.
- [ ] **Detalle** de una especie (`/aves/psarocolius-montezuma`): ficha completa, fotos del bucket cargan.
- [ ] **Mapa de distribución** se renderiza en el detalle.
- [ ] **PDFs**: los botones de descarga sirven `catalogo-aves-chirimoyo.pdf` y `catalogo-herpetofauna-chirimoyo.pdf`.
- [ ] **Vanity**: `aves.chirimoyo.org` responde 301 → `fauna.chirimoyo.org/aves` (`SMOKE_VANITY=1 npm run smoke` o `curl -I`).
- [ ] **Favicons**: pestaña con ícono de Chirimoyo; `site.webmanifest` resuelve.
- [ ] **Analítica**: en `fauna.chirimoyo.org` llega un pageview al panel de Cloudflare Web Analytics; sin cookies de rastreo ni banner.
- [ ] **SSL** válido (candado, certificado de Firebase) y **performance** razonable (carga rápida vía CDN).

## 4. Cierre

- Marcar el checklist del issue [#15](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/15)
  (corrigiendo las tareas obsoletas de Dockerfile/Cloud Run).
- Si algo del smoke test falla, **no** revertir el dominio: re-desplegar tras corregir
  (el deploy es idempotente y barato).

## Rollback

Firebase Hosting guarda versiones anteriores. Para volver a una versión previa sin
re-build: consola de Firebase → Hosting → site `fauna-chirimoyo` → historial de
versiones → **Rollback**. (O re-desplegar desde un commit anterior con `deploy_prod`.)

## Notas

- **Solo producción** por ahora — no hay ambiente de QA ([ADR-0003](../decisions/0003-hosting-db-ambientes.md)).
- El `sitio` (`chirimoyo.org`) y el `api` **sí** van a Cloud Run; este runbook es
  exclusivo del catálogo estático.

## Referencias

- [ADR-0014](../decisions/0014-catalogo-export-estatico.md) — export estático, sin Cloud Run.
- [ADR-0003](../decisions/0003-hosting-db-ambientes.md) — hosting general del proyecto.
- [ADR-0016](../decisions/0016-storage-imagenes-fauna-gcs.md) — imágenes en GCS.
- [ADR-0009](../decisions/0009-ci-checks-deploy-manual.md) — deploys manuales.
- [Agregar una ave](agregar-una-ave.md) — flujo de contenido y subida de fotos.
