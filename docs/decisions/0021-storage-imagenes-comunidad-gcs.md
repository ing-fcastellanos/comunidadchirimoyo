# ADR-0021 — Storage de imágenes de comunidad en GCS, en bucket propio separado del de fauna

- **Estado:** Accepted
- **Fecha:** 2026-06-15
- **Decisores:** @ing-fcastellanos
- **Issue:** #54 (diseño del landing) / #45 (contenido), épica #18 (Fase 3 — Presencia)

## Contexto

El landing de `chirimoyo.org` y su página `/galeria` (capacidad `sitio-galeria`) muestran
**fotos del humedal, jornadas de limpieza y eventos comunitarios**: fotos documentales de
celular que crecerán con el tiempo (las jornadas son periódicas). El hero y la sección "el
caso" del landing también usan una o dos **fotos-ancla** del humedal.

[ADR-0004](0004-contenido-en-repo.md) mantiene el contenido textual en el repo, pero
versionar fotos (que crecen sin techo) en git es inviable, igual que se concluyó para la
fauna. [ADR-0016](0016-storage-imagenes-fauna-gcs.md) ya resolvió el storage de imágenes
**de fauna** en GCS servidas por URL pública del bucket, sin Load Balancer ni CDN
administrado, por costo casi nulo. La pregunta abierta es si las fotos de comunidad reusan
ese bucket o tienen el suyo.

## Decisión

Las fotos de comunidad viven en **Google Cloud Storage**, en el proyecto GCP `chirimoyo`,
en un **bucket propio público de lectura**, separado del de fauna:

| Bucket | Acceso | Clase | Contenido |
|---|---|---|---|
| `comunidad-chirimoyo` | **público** (lectura) | Standard | fotos de humedal, jornadas y eventos; fotos-ancla del landing |

Se sirven con la **URL pública del bucket** directamente
(`https://storage.googleapis.com/comunidad-chirimoyo/...`), **sin Load Balancer, sin Cloud
CDN y sin dominio propio**, igual que ADR-0016. La app compone la URL sobre una base en
`NEXT_PUBLIC_COMUNIDAD_CDN_BASE` (default
`https://storage.googleapis.com/comunidad-chirimoyo`), de modo que migrar a un CDN/dominio
propio luego no reescriba el contenido ni los componentes.

La **lista de fotos de la galería** se cura en un manifiesto en repo
(`content/landing/galeria.json`: archivo, pie, orden), no se deriva de un listado automático
del bucket — para conservar control editorial, pies de foto y orden (coherente con ADR-0004:
el texto se versiona; los binarios no).

**Bucket propio, no el de fauna:** separar por dominio (fauna curada vs. comunidad que crece
por jornada) mantiene ciclos de vida, permisos y limpieza independientes, y evita mezclar
contenido con propósitos y cadencias distintas.

## Alternativas consideradas

- **Reusar el bucket de fauna (`catalogo-aves-chirimoyo`):** $0 incremental de setup, pero
  mezcla dos dominios con ciclos de vida y curaduría distintos; ensucia rutas y permisos.
  Descartada.
- **Fotos en `public/` del sitio:** sin infra y simple para 1-2 anclas, pero no escala al
  volumen real de galería (las jornadas generan fotos continuamente) y engorda la imagen de
  Cloud Run. Aceptable **solo como interino** para las fotos-ancla del hero mientras se crea
  el bucket; no para la galería.
- **Listado automático del bucket en build:** menos mantenimiento, pero pierde pies de foto,
  orden curado y control editorial. Descartada a favor del manifiesto.
- **Dominio propio + Cloud CDN:** mismo veredicto que ADR-0016 — ~$18 USD/mes de base por la
  regla de balanceo, desproporcionado para un proyecto vecinal. Reconsiderar si el tráfico
  crece (la base `CDN_BASE` lo hace un cambio sin reescribir contenido).

## Consecuencias

### Positivas

- Repo liviano; el texto (manifiesto, pies) sigue versionado (ADR-0004), los binarios no.
- Costo casi nulo: sin Load Balancer ni CDN administrado; solo almacenamiento + egress.
- Dominios separados (fauna vs. comunidad): permisos, limpieza y ciclo de vida independientes.
- Portabilidad vía `COMUNIDAD_CDN_BASE`: migrar a dominio/CDN propio luego no reescribe nada.

### Negativas

- Sin dominio de marca para las imágenes (se sirven desde `storage.googleapis.com`) ni caché
  administrada propia; se acepta a cambio de costo casi nulo.
- Un bucket más que administrar e IAM.
- Las fotos no se versionan junto al texto; su "fuente de verdad" es el bucket + el banco
  local de origen.
- Acoplamiento operativo a GCP para publicar fotos nuevas.

## Plan de revisión

Reconsiderar un dominio propio + Cloud CDN si el tráfico crece y justifica el costo del
balanceador, o si se necesita control de caché/headers o URLs de marca. Reevaluar el
manifiesto vs. listado automático si el volumen de fotos hace inmanejable la curaduría manual.

## Referencias

- [ADR-0016](0016-storage-imagenes-fauna-gcs.md) (patrón que este ADR replica para comunidad),
  [ADR-0004](0004-contenido-en-repo.md) (contenido en repo), [ADR-0015](0015-sitio-cloud-run-us-central1.md) (sitio en Cloud Run).
- Change OpenSpec `landing-chirimoyo-org` (capacidades `landing-sitio`, `sitio-galeria`).
