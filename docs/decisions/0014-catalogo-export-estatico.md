# ADR-0014 — El catálogo se despliega como export estático en Firebase Hosting (sin Cloud Run)

- **Estado:** Accepted
- **Fecha:** 2026-06-08
- **Decisores:** @ing-fcastellanos
- **Issue:** #6 (scaffold apps/catalogo)

## Contexto

[ADR-0003](0003-hosting-db-ambientes.md) fijó el patrón general de despliegue del proyecto: Cloud Run + Firebase Hosting con rewrites (heredado de Sociedad Salvaje). Pero el catálogo de fauna (`aves.chirimoyo.org`) es **100% estático** ([ADR-0005](0005-catalogo-estatico-anfibios-categoria.md)): listado SSG, detalle por especie con `generateStaticParams`, buscador en cliente sobre un JSON, PDF generado en build. No usa SSR, middleware, route handlers ni el API.

Desplegarlo en Cloud Run implicaría un contenedor Node encendido 24/7 para servir contenido estático — costo e infraestructura innecesarios para un grupo vecinal. Además, el contexto de build de Docker (la carpeta de la app) no puede leer `content/` (en la raíz del repo), lo que complicaría el acceso a los datos.

## Decisión

`apps/catalogo` usa **`output: "export"`** de Next: `next build` emite `out/` (HTML/CSS/JS estático) y **Firebase Hosting sirve `out/` directamente** (`"public": "out"`), **sin Cloud Run y sin Dockerfile**. El deploy es `next build && firebase deploy --only hosting:prod`.

Esto **diverge** de ADR-0003 solo para el catálogo. El proyecto queda con **hosting híbrido**: `catalogo` estático en Firebase Hosting; `sitio` y `api` siguen en Cloud Run (ADR-0003 sigue vigente para ellos).

## Alternativas consideradas

- **Cloud Run standalone (patrón de `apps/lectores`)**: consistente con ADR-0003 y con optimización de `next/image` en servidor, pero un contenedor siempre encendido para contenido estático es costo inútil, y reintroduce el problema de leer `content/` desde el contexto Docker. Descartada.
- **Mantener export pero servir desde un bucket GCS / otro CDN**: posible, pero Firebase Hosting ya está en el stack, da CDN + dominios + SSL sin infra extra. Innecesario.

## Consecuencias

### Positivas

- Sin contenedor 24/7: más barato y operación mínima.
- CDN puro → carga muy rápida.
- El build corre en la raíz (local/CI) y lee `content/` sin fricción de contexto Docker.
- Deploy trivial (`next build && firebase deploy`).

### Negativas

- Sin optimizador de `next/image` en servidor → las imágenes se optimizan en build (sharp) o se sirven pre-generadas (ver #10). `images.unoptimized: true` en el scaffold.
- Divergencia del patrón único de ADR-0003 → el proyecto tiene dos modelos de hosting (documentado aquí).
- Sin capacidades de servidor (SSR/middleware/route handlers) en el catálogo — no se necesitan (ADR-0005).

### Neutras

- Un solo ambiente (prod) por ahora (ADR-0003).

## Plan de revisión

Reconsiderar si el catálogo alguna vez necesita render dinámico en servidor (búsqueda server-side, personalización, etc.) — lo cual primero requeriría revisar ADR-0005.

## Referencias

- ADR-0003 (hosting general), ADR-0005 (catálogo estático), ADR-0013 (tokens por copia).
- Change OpenSpec `scaffold-catalogo-app`. `apps/catalogo/firebase.json`, `apps/catalogo/next.config.ts`.
