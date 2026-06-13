# catalogo-detalle Specification

## Purpose
TBD - created by archiving change detalle-especie-aves. Update Purpose after archive.
## Requirements
### Requirement: Ficha de detalle estática por especie

La app SHALL generar, en build, una página de detalle por especie en la ruta `/aves/<slug>`
(`generateStaticParams` a partir de los slugs de `getAllFichas()`), compatible con el export
estático. La página NO SHALL llamar a ningún API. SHALL renderizar, a partir de la ficha y de
las secciones `##` de su cuerpo: hero (fotos + nombre común + científico + estatus), datos
rápidos, descripción, dieta/reproducción, distribución, observación, conservación y taxonomía.
Las secciones o datos ausentes SHALL omitirse sin romper la página.

#### Scenario: Una página estática por especie
- **WHEN** se ejecuta `npm run build`
- **THEN** existe `out/aves/<slug>/index.html` para cada especie del catálogo

#### Scenario: Secciones tolerantes
- **WHEN** una ficha no tiene una sección o un dato opcional (p. ej. envergadura)
- **THEN** esa parte se omite y el resto de la ficha se renderiza correctamente

#### Scenario: Cita destacada en la descripción
- **WHEN** una ficha declara `pullQuote`
- **THEN** la sección Descripción muestra la cita en un aside lateral; si no lo declara, la descripción se renderiza sin el aside

### Requirement: Carrusel de fotos con atribución

El detalle SHALL mostrar las fotos de la especie en un carrusel con lightbox (navegación por
teclado y cierre), usando la variante `web` del bucket. Cada foto SHALL mostrar su
atribución: `credito`, `licencia` y enlaces a `creditoUrl`/`licenciaUrl` cuando existan, para
cumplir la atribución que exigen CC BY / CC BY-SA.

#### Scenario: Atribución visible
- **WHEN** se abre una foto en el lightbox
- **THEN** se muestra su crédito y licencia, con enlace a la fuente cuando esté disponible

#### Scenario: Navegación del carrusel
- **WHEN** la especie tiene varias fotos
- **THEN** el usuario puede avanzar/retroceder y ampliar cualquiera

### Requirement: OpenGraph por especie

La página SHALL exponer metadata por especie vía `generateMetadata`: `title` y `description`
(resumen de la descripción) propios, y `openGraph.image` apuntando a la URL absoluta de la
foto de portada (variante `web`), para previews correctos al compartir el enlace.

#### Scenario: Preview social
- **WHEN** se comparte el enlace `/aves/<slug>`
- **THEN** el preview muestra la foto de portada y el nombre de la especie

### Requirement: Navegación a especies relacionadas

La página SHALL ofrecer enlaces a especies relacionadas, priorizando la **misma familia** y,
en su defecto, la **misma categoría**, excluyendo la especie actual. Se deriva del catálogo
existente, sin datos nuevos.

#### Scenario: Relacionadas por familia
- **WHEN** se abre el detalle de una especie con congéneres de familia en el catálogo
- **THEN** se muestran enlaces a otras especies de la misma familia

### Requirement: Sección de Vocalización con reproductor nativo

Cuando una especie declara `audios`, la ficha de detalle SHALL mostrar una sección **Vocalización** con un reproductor de audio **nativo** (`<audio controls>`, sin JavaScript de cliente, compatible con el export estático). El audio SHALL servirse desde el bucket componiendo la URL con un helper `audioUrl(slug, archivo)` que reusa `NEXT_PUBLIC_FAUNA_CDN_BASE`. La sección SHALL reemplazar el canto **sintetizado** (Web Audio) del handoff de diseño, que NO SHALL usarse. Cuando la ficha no declara `audios`, la sección NO SHALL renderizarse (tolerante, igual que el resto de secciones opcionales).

#### Scenario: Especie con audio muestra el reproductor
- **WHEN** una ficha declara al menos un `audio`
- **THEN** la ficha de detalle muestra la sección Vocalización con un `<audio controls>` cuyo `src` apunta al bucket vía `audioUrl(slug, archivo)`

#### Scenario: Especie sin audio omite la sección
- **WHEN** una ficha no declara `audios`
- **THEN** la sección Vocalización no aparece y el resto de la ficha se renderiza correctamente

#### Scenario: Sin canto sintetizado
- **WHEN** se renderiza la sección Vocalización
- **THEN** reproduce el archivo real de la especie y no genera ningún tono sintetizado por Web Audio

#### Scenario: Compatible con export estático
- **WHEN** se ejecuta `npm run build` (export estático)
- **THEN** la sección se genera sin requerir JavaScript de cliente para reproducir

### Requirement: Atribución de la vocalización

La sección Vocalización SHALL mostrar la atribución de la grabación **compuesta a partir de los campos** del audio (no de un texto almacenado), con la fórmula `"<credito>, <fuenteId>, xeno-canto.org"` y un enlace al texto de la licencia (`licenciaUrl`) y a la página de la grabación (`creditoUrl`) cuando existan. El rótulo del tipo (`Canto`/`Llamado`) SHALL mostrarse cuando `tipo` esté presente.

#### Scenario: Crédito compuesto desde campos
- **WHEN** un audio declara `credito`, `fuenteId` y `licencia`
- **THEN** la atribución mostrada es `"<credito>, <fuenteId>, xeno-canto.org"` con enlace a la licencia, sin depender de ningún campo de leyenda almacenado

#### Scenario: Tipo de vocalización rotulado
- **WHEN** un audio declara `tipo` (`canto` o `llamado`)
- **THEN** la sección lo indica; si no lo declara, se omite el rótulo sin romper la atribución

