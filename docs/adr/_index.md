# Índice de ADRs

Decisiones arquitectónicas (tomadas o pendientes) de Comunidad Chirimoyo. Cada ADR vive en su archivo en [`../decisions/`](../decisions/).

| ID | Título | Estado | Fase | Archivo |
|----|--------|--------|------|---------|
| 0001 | Layout del monorepo (2 apps + 1 service, sin tooling) | Accepted | 0 | [0001-monorepo-layout.md](../decisions/0001-monorepo-layout.md) |
| 0002 | Stack heredado de Sociedad Salvaje | Accepted | 0 | [0002-stack-heredado.md](../decisions/0002-stack-heredado.md) |
| 0003 | Hosting, DB, storage y ambientes (GCP nuevo) | Accepted | 0 | [0003-hosting-db-ambientes.md](../decisions/0003-hosting-db-ambientes.md) |
| 0004 | Contenido en repo (Markdown/JSON) en vez de CMS | Accepted | 0 | [0004-contenido-en-repo.md](../decisions/0004-contenido-en-repo.md) |
| 0005 | Catálogo de fauna estático; anfibios como categoría | Accepted | 1 | [0005-catalogo-estatico-anfibios-categoria.md](../decisions/0005-catalogo-estatico-anfibios-categoria.md) |
| 0006 | API mínima: inscripciones + contacto | Accepted | 0 | [0006-api-minima.md](../decisions/0006-api-minima.md) |
| 0007 | Donaciones informativas (sin pasarela) | Accepted | 4 | [0007-donaciones-informativas.md](../decisions/0007-donaciones-informativas.md) |
| 0008 | Multi-subdominio desde una sola app (Firebase rewrites) | Accepted | 0 | [0008-multisubdominio-una-app.md](../decisions/0008-multisubdominio-una-app.md) |
| 0009 | CI de checks (GitHub Actions) + deploy manual | Accepted | 0 | [0009-ci-checks-deploy-manual.md](../decisions/0009-ci-checks-deploy-manual.md) |
| 0010 | Analítica respetuosa de privacidad | Superseded by ADR-0020 | 0 | [0010-analitica-privada.md](../decisions/0010-analitica-privada.md) |
| 0011 | Sistema de diseño desde v0.dev; solo-ES i18n-ready | Accepted | 0 | [0011-diseno-i18n.md](../decisions/0011-diseno-i18n.md) |
| 0012 | Privacidad de datos de voluntarios | Accepted | 4 | [0012-privacidad-datos-voluntarios.md](../decisions/0012-privacidad-datos-voluntarios.md) |
| 0013 | Tokens de diseño compartidos por copia desde fuente canónica | Accepted | 0 | [0013-tokens-compartidos-por-copia.md](../decisions/0013-tokens-compartidos-por-copia.md) |
| 0014 | Catálogo como export estático en Firebase Hosting (sin Cloud Run) | Accepted | 0 | [0014-catalogo-export-estatico.md](../decisions/0014-catalogo-export-estatico.md) |
| 0015 | `sitio` en Cloud Run us-central1 (Firebase rewrites no soportan northamerica-south1) | Accepted | 0 | [0015-sitio-cloud-run-us-central1.md](../decisions/0015-sitio-cloud-run-us-central1.md) |
| 0016 | Storage de imágenes de fauna en GCS, servidas por URL pública del bucket | Accepted | 1 | [0016-storage-imagenes-fauna-gcs.md](../decisions/0016-storage-imagenes-fauna-gcs.md) |
| 0017 | Storage de audio de fauna en GCS (verbatim), servido por URL pública del bucket | Accepted | 1 | [0017-storage-audio-fauna-gcs.md](../decisions/0017-storage-audio-fauna-gcs.md) |
| 0018 | Mapa de distribución: geografía real (Natural Earth) + zonas curadas por país | Accepted | 1 | [0018-mapa-distribucion-geografia-real.md](../decisions/0018-mapa-distribucion-geografia-real.md) |
| 0019 | PDF del catálogo generado en build con navegador headless | Accepted | 1 | [0019-pdf-catalogo-build-headless.md](../decisions/0019-pdf-catalogo-build-headless.md) |
| 0020 | Analítica web: Cloudflare Web Analytics (supersede 0010) | Accepted | 5 | [0020-analitica-cloudflare-web-analytics.md](../decisions/0020-analitica-cloudflare-web-analytics.md) |

## Estados

- **Proposed**: el problema está identificado pero la decisión no se ha tomado
- **Accepted**: la decisión está tomada y debe seguirse
- **Superseded by ADR-NNNN**: una decisión más nueva la reemplaza
- **Deprecated**: ya no aplica pero no fue reemplazada formalmente

## Cómo agregar un ADR

1. Abre una issue de discusión (label `type: adr`).
2. Copia [`_template.md`](./_template.md) a `../decisions/NNNN-titulo-corto.md` (NNNN incremental).
3. Llena las secciones.
4. Agrega una fila a este índice.
5. Cierra la issue referenciando el ADR.

## Cómo cambiar una decisión

Los ADRs aceptados **no se editan**. Si la decisión cambia: escribe un nuevo ADR, en "Contexto" explica por qué se reconsideró, marca el viejo como `Superseded by ADR-NNNN` y actualiza este índice.
