## Why

Las páginas `/galeria` (#50) y `/aliados` (#49) ya existen (change `landing-chirimoyo-org`), pero no cumplen del todo lo que piden sus issues:

- **#50**: su criterio de éxito pide fotos **"optimizadas con créditos"**. Hoy la galería sirve los originales del bucket con `<img>` (sin optimizar) y `galeria.json` no tiene campo de **autoría** ni **fecha**, así que los créditos no se muestran.
- **#49**: la tarjeta de aliado renderiza nombre, descripción, logo y enlace, pero **no el `tipo`**, que el issue lista como dato a mostrar.

Cerrar estos huecos permite cerrar ambos issues.

## What Changes

- **`/galeria` con `next/image`**: servir las fotos vía el optimizador de Next (`sitio` corre en Cloud Run, no es export estático), con `images.remotePatterns` para el bucket. La rejilla usa `<Image fill>` dentro de los contenedores `aspect-*` existentes (sin layout shift) + `sizes`. El lightbox conserva `<img>` (foto única a resolución completa, tamaño variable).
- **Créditos en la galería**: agregar `credito` (autoría) y `fecha` (ISO) a `galeria.json` y a los tipos del data-layer (ambos nullable). Mostrar autoría + fecha en el lightbox y un crédito sutil en el overlay de la tarjeta, solo cuando existan.
- **`tipo` en `/aliados`**: mostrar el `tipo` de cada aliado como insignia (`Badge`).
- **Carga incremental de `/galeria`**: renderizar las fotos por lotes (30) con scroll infinito (`IntersectionObserver`), en vez de inyectar todos los nodos de golpe — la comunidad prevé >200 fotos actualizadas con frecuencia. El lightbox sigue operando sobre la lista completa.

## No-goals

- **No** se migra el hero/teaser/"el caso" a `next/image` (fuera de #50; el hero es el carrusel CSS y migrarlo arriesga la animación).
- **No** se implementan los opcionales de los issues: filtrar aliados por `tipo` (#49) ni agrupar la galería por álbum/evento (#50).
- **No** se cargan créditos reales de autoría (depende de la comunidad, como el resto del contenido de #45); solo se deja el esquema y la UI listos.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `sitio-galeria`: añade requisitos de **imágenes optimizadas** (`next/image`) y de **créditos de autoría/fecha** en la galería.
- `landing-sitio`: añade que la tarjeta de aliado muestra el **`tipo`** del aliado.

## Impact

- **Sub-dominios afectados**: `sitio` (`/galeria`, `/aliados`).
- **Código**: `apps/sitio/next.config.ts` (`images.remotePatterns`), `components/landing/GaleriaGrid.tsx` (`next/image`), `components/landing/Lightbox.tsx` (créditos), `components/landing/AliadosGrid.tsx` (`Badge` de tipo), `lib/landing.ts` (tipos + resolución de `credito`/`fecha`).
- **Contenido**: `content/landing/galeria.json` gana `credito` y `fecha` (nullable).
- **Decisiones**: usar `next/image` en `sitio` (Cloud Run) diverge del `<img>` del catálogo (export estático, ADR-0014); se documenta en `design.md`, sin contradecir ADR-0016 (que evita Load Balancer/CDN, no `next/image`). No requiere ADR nuevo.
- **Cierra**: #49 y #50.
