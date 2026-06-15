## Why

`chirimoyo.org` (apps/sitio, ruta `/`) sigue mostrando un **placeholder de andamiaje**: un H1 y unos badges sin contenido real. Es la puerta de entrada del proyecto y la cara pública de la lucha por el humedal, pero hoy no cuenta la historia, no enlaza al resto del ecosistema (catálogo, comunidad, voluntarios) ni invita a apoyar.

El contenido ya existe como fuente de verdad en `content/landing/` (issue #45) y el lenguaje visual ya quedó fijado por el catálogo de aves (issue #54: flujo v0.dev). Es momento de ensamblar el landing real consumiendo ese contenido y reusando el sistema de diseño, generando vía v0.dev **solo** los patrones que aún no existen.

## What Changes

- **Landing real en `/`** (reemplaza el placeholder de `apps/sitio/app/page.tsx`) con las secciones: Hero, "El caso", "Qué hacemos", Logros (línea de tiempo), Linktree, Donaciones, preview de Aliados y Cierre CTA. Cada sección consume su archivo de `content/landing/` como fuente de verdad, sin duplicar texto en el código.
- **Página `/aliados`** con la rejilla completa de proyectos aliados (`aliados.json`).
- **Página `/galeria`** con rejilla de fotos + lightbox, alimentada desde un **bucket propio de imágenes de comunidad** (mismo patrón que el catálogo de fauna, ADR-0016).
- **Tres patrones de UI nuevos vía v0.dev**, portados a `components/`: línea de tiempo (logros), bloque linktree y galería (grid + lightbox). El resto de secciones reusa primitivas y patrones ya portados del catálogo (`Hero`, grid de tarjetas, `CierreCTA`).
- **Foto del hero curada**: foto `1.50.56` (jornada de limpieza) como ancla del hero; el lirio acuático como hilo visual y narrativo.
- **Completar contenido (#45) en paralelo**: cargar `logros.json` y `aliados.json` con datos reales aprobados por la comunidad y pulir textos; el diseño avanza sobre el borrador, no se bloquea.

## No-goals

- **No** se introduce un endpoint ni búsqueda dinámica: el landing es estático y consume `content/` en build (coherente con ADR-0004; el sitio se sirve en Cloud Run pero sin llamadas a API en estas páginas).
- **No** se construye el flujo de inscripción de voluntarios ni el de donación transaccional (donaciones son **informativas**, ADR-0007; inscripción es Fase 4).
- **No** se rediseñan Header/Footer ni los tokens del sistema; se reusan tal cual.
- **No** entra el video (.mp4) al landing; las fotos actuales son una muestra de prueba (habrá más).

## Capabilities

### New Capabilities
- `landing-sitio`: el landing de `chirimoyo.org` (ruta `/`) y la página `/aliados`. Secciones que consumen `content/landing/`, jerarquía de encabezados accesible, Server Components sin API, reuso del sistema de diseño y de patrones portados del catálogo, más los patrones nuevos (timeline, linktree).
- `sitio-galeria`: la página `/galeria` (rejilla de fotos + lightbox) y el **almacenamiento de imágenes de comunidad** en un bucket de GCS, análogo a las imágenes de fauna (ADR-0016) pero para fotos del humedal, jornadas y eventos.

### Modified Capabilities
- _(ninguna: `sitio-app` ya define la app, el ruteo por host y el sistema de diseño; este cambio añade contenido de páginas, no modifica esos requisitos)._

## Impact

- **Sub-dominios afectados**: `sitio` (landing `/`, `/aliados`, `/galeria`), `foundation` (3 componentes nuevos al sistema de diseño: timeline, linktree, galería).
- **Código**: `apps/sitio/app/page.tsx` (reemplazo), nuevas rutas `apps/sitio/app/aliados/` y `apps/sitio/app/galeria/`, nuevos componentes en `apps/sitio/components/`, un data-layer que lee `content/landing/` en build.
- **Contenido**: `content/landing/logros.json` y `aliados.json` pasan de placeholder a datos reales (#45).
- **Infra / decisiones**: el bucket de fotos de comunidad es una **decisión nueva de almacenamiento** distinta de la de fauna → requiere **ADR** (p. ej. `0021-storage-imagenes-comunidad-gcs.md`) y actualizar el índice de ADRs. El handoff de los 3 patrones nuevos pasa por **v0.dev** antes de portar (flujo de CLAUDE.md).
- **Dependencias**: habilita los issues de implementación #47/#49/#50 (épica #18).
