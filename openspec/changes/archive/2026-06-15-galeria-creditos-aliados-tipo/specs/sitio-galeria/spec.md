## ADDED Requirements

### Requirement: Imágenes de la galería optimizadas

La rejilla de `/galeria` SHALL servir las fotos a través del optimizador de imágenes de
Next (`next/image`), aprovechando que `apps/sitio` corre como servidor en Cloud Run (no es
export estático). El host del bucket de comunidad SHALL declararse en
`images.remotePatterns`. Cada imagen de la rejilla SHALL reservar su espacio según la
orientación (sin layout shift) y SHALL declarar `sizes` acorde a las columnas responsive.
La carga SHALL ser diferida salvo las primeras visibles. El visor ampliado (lightbox) PUEDE
seguir usando una etiqueta `<img>` por tratarse de una sola foto a resolución completa.

#### Scenario: Fotos servidas optimizadas y responsive
- **WHEN** se abre `/galeria` en un viewport dado
- **THEN** las imágenes de la rejilla se sirven optimizadas (tamaño/format acordes al
  viewport) sin provocar saltos de layout

#### Scenario: Host del bucket permitido
- **WHEN** se construye la app
- **THEN** `next/image` acepta las URLs del bucket de comunidad por estar en
  `images.remotePatterns`

### Requirement: Créditos de autoría en la galería

El manifiesto de la galería SHALL admitir, por foto, un crédito de **autoría** y una **fecha**
(formato ISO), ambos opcionales. La interfaz SHALL mostrar la autoría y la fecha **solo
cuando existan** —en el visor ampliado (lightbox) y, de forma sutil, en la tarjeta—, sin
mostrar etiquetas vacías cuando falten. La ausencia de crédito o fecha NO SHALL romper el
render.

#### Scenario: Foto con crédito
- **WHEN** una foto tiene autoría y/o fecha en el manifiesto y se abre en el lightbox
- **THEN** se muestran la autoría y la fecha junto al pie de foto

#### Scenario: Foto sin crédito
- **WHEN** una foto no tiene autoría ni fecha
- **THEN** la galería y el lightbox se renderizan sin etiquetas de crédito vacías

### Requirement: Carga incremental de la galería

La galería SHALL renderizar las fotos por lotes, montando un lote inicial acotado y
añadiendo más a medida que la persona se acerca al final del listado (scroll), en lugar de
inyectar todos los nodos de una sola vez. Esto SHALL acotar el peso del HTML inicial y el
número de nodos en el DOM independientemente del total de fotos (puede ser >200). El visor
ampliado (lightbox) SHALL seguir operando sobre la **lista completa** de fotos, aunque aún no
se hayan montado todas en la rejilla. La carga diferida de cada imagen (que solo se descarga
al acercarse al viewport) SHALL mantenerse.

#### Scenario: Lote inicial acotado
- **WHEN** se abre `/galeria` con más fotos que el tamaño de lote
- **THEN** se renderiza solo el primer lote (no todos los nodos), y el HTML inicial no
  incluye los nodos de las fotos restantes

#### Scenario: Montar más al hacer scroll
- **WHEN** la persona se acerca al final del listado visible
- **THEN** se monta el siguiente lote de fotos, repitiéndose hasta agotar la lista

#### Scenario: Lightbox sobre la lista completa
- **WHEN** se navega en el lightbox (anterior/siguiente) hacia una foto aún no montada en la rejilla
- **THEN** el lightbox la muestra correctamente por su posición en la lista completa
