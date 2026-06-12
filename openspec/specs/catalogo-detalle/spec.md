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

