# Desplegar aves.chirimoyo.org a producción

Runbook para publicar el catálogo de fauna (`apps/catalogo` → `aves.chirimoyo.org`).
Cubre el issue [#15](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/15).

> El catálogo es un **export estático servido por Firebase Hosting** — **no** usa
> Cloud Run ni Docker (ver [ADR-0014](../decisions/0014-catalogo-export-estatico.md),
> que diverge a propósito del patrón Cloud Run de [ADR-0003](../decisions/0003-hosting-db-ambientes.md)).
> Si alguien menciona "Dockerfile" o "push a Cloud Run" para este sitio, está
> trabajando con información desactualizada.

## Panorama

```
1. PREREQUISITOS   firebase login · deps instaladas · banco local de fotos · Chromium
2. DEPLOY          npm run deploy_prod   (build:pdf → next build → firebase deploy)
3. SMOKE TEST      listado · buscador · detalle · mapa · PDF · favicons · SSL
4. CIERRE          verificar dominio, marcar checklist del issue
```

Una sola máquina, un solo comando. No hay CI/CD de deploy automático
([ADR-0009](../decisions/0009-ci-checks-deploy-manual.md)): los deploys son manuales.

## Arquitectura del deploy

```
   apps/catalogo                         Firebase Hosting (proyecto: chirimoyo)
   ┌────────────────────────┐            ┌─────────────────────────────────┐
   │ npm run deploy_prod     │            │ target "prod" → site            │
   │  ├ build:pdf  → PDF      │  out/ ───▶ │ "aves-chirimoyo"                │
   │  ├ next build → out/     │            │  → aves.chirimoyo.org (CDN+SSL) │
   │  └ firebase deploy       │            └─────────────────────────────────┘
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

1. **`build:pdf`** — compila el CSS de impresión y genera
   `public/catalogo-aves-chirimoyo.pdf` con Chromium.
2. **`next build`** — emite `out/` (export estático), incluyendo el PDF y los favicons.
3. **`firebase deploy --only hosting:prod --project=chirimoyo`** — sube `out/` al
   site `aves-chirimoyo` (target `prod` en `.firebaserc`).

Al terminar, Firebase imprime la **Hosting URL**. El deploy reemplaza la página de
*coming soon* que servía el dominio.

### Analítica (Cloudflare Web Analytics) — variables de build

El catálogo es export estático: las `NEXT_PUBLIC_*` se inyectan en **`next build`**, no en
runtime. Para que la analítica ([ADR-0020](../decisions/0020-analitica-cloudflare-web-analytics.md))
quede en el `out/` desplegado, define **antes** de `npm run deploy_prod` (en `.env.local` o en
el entorno que ejecuta el comando):

- `NEXT_PUBLIC_CF_BEACON_TOKENS` — JSON `{"aves.chirimoyo.org":"<token>"}` (token del "site" de Cloudflare).

Ver [`apps/catalogo/.env.example`](../../apps/catalogo/.env.example). Si falta, el sitio
despliega igual pero **sin analítica** (degradación segura, sin error).

## 3. Smoke test en producción

Abrir `https://aves.chirimoyo.org` y verificar:

- [ ] **Landing** carga (Hero, secciones, sin errores en consola).
- [ ] **Buscador** (`/busqueda`): filtra por forma/color/lugar; los resultados muestran foto.
- [ ] **Detalle** de una especie (`/aves/psarocolius-montezuma`): ficha completa, fotos del bucket cargan.
- [ ] **Mapa de distribución** se renderiza en el detalle.
- [ ] **PDF**: el botón "Descargar guía en PDF" del cierre descarga `catalogo-aves-chirimoyo.pdf`.
- [ ] **Favicons**: pestaña con ícono de Chirimoyo; `site.webmanifest` resuelve.
- [ ] **Analítica**: en `aves.chirimoyo.org` llega un pageview al panel de Cloudflare Web Analytics; sin cookies de rastreo ni banner.
- [ ] **SSL** válido (candado, certificado de Firebase) y **performance** razonable (carga rápida vía CDN).

## 4. Cierre

- Marcar el checklist del issue [#15](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/15)
  (corrigiendo las tareas obsoletas de Dockerfile/Cloud Run).
- Si algo del smoke test falla, **no** revertir el dominio: re-desplegar tras corregir
  (el deploy es idempotente y barato).

## Rollback

Firebase Hosting guarda versiones anteriores. Para volver a una versión previa sin
re-build: consola de Firebase → Hosting → site `aves-chirimoyo` → historial de
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
