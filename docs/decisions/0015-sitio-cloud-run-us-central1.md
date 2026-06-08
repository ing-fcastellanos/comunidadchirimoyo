# ADR-0015 — `apps/sitio` corre en Cloud Run `us-central1` (Firebase rewrites no soportan northamerica-south1)

- **Estado:** Accepted
- **Fecha:** 2026-06-08
- **Decisores:** @ing-fcastellanos
- **Issue:** #5 (scaffold apps/sitio)

## Contexto

[ADR-0003](0003-hosting-db-ambientes.md) fijó `northamerica-south1` (Querétaro) como región estándar del proyecto. `apps/sitio` usa el modelo multi-subdominio con **Firebase Hosting rewrites → Cloud Run** ([ADR-0008](0008-multisubdominio-una-app.md)). Al desplegar el rewrite, Firebase Hosting devolvió:

> `Cloud Run region 'northamerica-south1' is not supported`

**Firebase Hosting solo permite rewrites a Cloud Run en una lista acotada de regiones** (us-central1, us-east1, europe-west1, asia-east1, etc.); `northamerica-south1` no está en ella.

## Decisión

El servicio Cloud Run **`sitio`** se despliega en **`us-central1`** (región soportada por Firebase Hosting rewrites, y la misma que usa el proyecto hermano Sociedad Salvaje para `lectores`). El `firebase.json` de `sitio` apunta el rewrite a `us-central1`.

El resto del proyecto **no cambia**: Firestore y el servicio `api` siguen en `northamerica-south1`; el catálogo es export estático (región-agnóstico, servido por CDN de Firebase). Es una **excepción de región acotada a `sitio`**, motivada por una restricción de Firebase Hosting.

## Alternativas consideradas

- **Cambiar `sitio` a hosting estático (modelos B/C del explore #5)**: evita Cloud Run y la restricción de región, pero descarta el modelo A (middleware multi-subdominio) ya construido y reabre la decisión. Descartada por costo de retrabajo.
- **Cloud Run domain mapping / Load Balancer global**: el domain mapping también tiene límites de región; un Load Balancer con serverless NEG soporta cualquier región pero añade bastante infraestructura. Desproporcionado para este proyecto.
- **Mantener `northamerica-south1`**: imposible con Firebase rewrites (el error lo bloquea).

## Consecuencias

### Positivas

- El modelo A (un build, middleware por host, Firebase rewrites) funciona; `chirimoyo.org` ya sirve la app.
- Coincide con el patrón probado de Sociedad Salvaje (`lectores` en us-central1).

### Negativas

- El cómputo de `sitio` queda en EE.UU. (latencia marginalmente mayor para visitantes en México; mitigado por el CDN de Firebase Hosting al frente y por ser contenido mayormente estático/SSG).
- La imagen vive en Artifact Registry `northamerica-south1` y el servicio en `us-central1` → pull cross-región (aceptable; impacto solo en cold start).
- El proyecto tiene regiones mixtas: Firestore + `api` en `northamerica-south1`; `sitio` en `us-central1`.

### Neutras

- Los **datos** (Firestore, PII de voluntarios) permanecen en `northamerica-south1` (México) — ADR-0012 intacto. Solo cambia la región de cómputo de un front sin estado.

## Plan de revisión

Reconsiderar si Firebase Hosting agrega soporte para `northamerica-south1` en rewrites a Cloud Run, o si se migra `sitio` a hosting estático.

## Referencias

- ADR-0003 (región estándar), ADR-0008 (multi-subdominio), ADR-0014 (catálogo estático).
- Change OpenSpec `scaffold-sitio-app`. `apps/sitio/firebase.json`.
