# catalogo-detalle Specification

## Purpose
TBD - created by archiving change detalle-especie-aves. Update Purpose after archive.
## Requirements
### Requirement: Ficha de detalle estática por especie

La app SHALL generar, en build, una página de detalle por especie en la ruta **`/<grupo>/<slug>`** (`app/[grupo]/[slug]`, con `generateStaticParams` a partir de los pares grupo×slug de `getAllFichas()` y `dynamicParams = false`), compatible con el export estático. La página NO SHALL llamar a ningún API. SHALL renderizar, a partir de la ficha y de las secciones `##` de su cuerpo: hero (fotos + nombre común + científico + estatus), datos rápidos, descripción, dieta/reproducción, distribución, observación, conservación y taxonomía. Las secciones o datos ausentes SHALL omitirse sin romper la página. Hoy solo existen fichas de aves, por lo que solo se generan rutas `/aves/<slug>`; la ruta queda preparada para `/anfibios/<slug>` y `/reptiles/<slug>` cuando lleguen sus datos.

#### Scenario: Una página estática por especie bajo su grupo
- **WHEN** se ejecuta `npm run build`
- **THEN** existe `out/<grupo>/<slug>/index.html` para cada especie del catálogo (p. ej. `out/aves/<slug>/index.html`)

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

La página SHALL exponer metadata por especie vía `generateMetadata`: `title` y `description` (resumen de la descripción) propios, y `openGraph.image` apuntando a la URL absoluta de la foto de portada (variante `web`), para previews correctos al compartir el enlace `/<grupo>/<slug>`.

#### Scenario: Preview social
- **WHEN** se comparte el enlace `/<grupo>/<slug>`
- **THEN** el preview muestra la foto de portada y el nombre de la especie

### Requirement: Navegación a especies relacionadas

La página SHALL ofrecer enlaces a especies relacionadas, priorizando la **misma familia** y, en su defecto, la **misma categoría**, excluyendo la especie actual. Cada enlace SHALL navegar a `/<grupo>/<slug>` de la especie relacionada (derivado de su `grupo`). Se deriva del catálogo existente, sin datos nuevos.

#### Scenario: Relacionadas por familia
- **WHEN** se abre el detalle de una especie con congéneres de familia en el catálogo
- **THEN** se muestran enlaces a otras especies de la misma familia, cada uno hacia `/<grupo>/<slug>`

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

La sección Vocalización SHALL mostrar la atribución de la grabación **compuesta a partir de los campos** del audio (no de un texto almacenado), con la fórmula `"<credito>, <fuenteId>, <fuente>"`, donde `<fuente>` SHALL derivarse del dato de la grabación y NO SHALL estar fijada a `xeno-canto.org`. La fuente SHALL inferirse del prefijo de `fuenteId` (`XC…` → `xeno-canto.org`, `iNat…` → `iNaturalist`); si el prefijo no se reconoce, SHALL usarse el host de `creditoUrl` y, en su defecto, SHALL omitirse el segmento de fuente sin inventar una atribución. La atribución SHALL incluir un enlace al texto de la licencia (`licenciaUrl`) y a la página de la grabación (`creditoUrl`) cuando existan. El rótulo del tipo (`Canto`/`Llamado`) SHALL mostrarse cuando `tipo` esté presente.

#### Scenario: Crédito compuesto con fuente derivada (xeno-canto)
- **WHEN** un audio de un ave declara `credito`, `fuenteId: "XC123456"` y `licencia`
- **THEN** la atribución mostrada es `"<credito>, XC123456, xeno-canto.org"` con enlace a la licencia, sin depender de ningún campo de leyenda almacenado

#### Scenario: Crédito compuesto con fuente derivada (iNaturalist)
- **WHEN** un audio de herpetofauna declara `fuenteId: "iNat1999482"` y `creditoUrl` de inaturalist.org
- **THEN** la atribución mostrada nombra **iNaturalist** como fuente (no xeno-canto), con enlace a `creditoUrl`

#### Scenario: Fuente desconocida no inventa atribución
- **WHEN** un audio trae un `fuenteId` con prefijo no reconocido y sin `creditoUrl`
- **THEN** la atribución muestra `credito` (y `fuenteId`) sin un segmento de fuente inventado

#### Scenario: Tipo de vocalización rotulado
- **WHEN** un audio declara `tipo` (`canto` o `llamado`)
- **THEN** la sección lo indica; si no lo declara, se omite el rótulo sin romper la atribución

### Requirement: Render group-aware del detalle

El render de la ficha de detalle SHALL adaptarse al `grupo` de la especie (`aves` | `anfibios` | `reptiles`) sin literales específicos de aves. En particular:

- La tabla de **Taxonomía** SHALL mostrar la clase taxonómica correspondiente al grupo (`aves` → `Aves`, `anfibios` → `Amphibia`, `reptiles` → `Reptilia`), derivada de una tabla `CLASE_LABEL` por grupo, y NO SHALL mostrar `Aves` fijo para todas las especies.
- El **ícono** del encabezado de la ficha (kicker "Ficha de especie") y el de la navegación a especies relacionadas SHALL provenir de una tabla `GRUPO_ICON` por grupo (`aves` → `Bird`, `anfibios` → `Droplet`, `reptiles` → `Turtle`), de modo que una ficha de herpetofauna no muestre el ícono de ave.
- El **encuadre descriptivo** de la sección Vocalización SHALL adaptarse al grupo: para aves describe la voz de las aves; para anfibios describe el canto de ranas y sapos; para otros grupos usa un texto genérico. La frase de procedencia SHALL nombrar la fuente real de la grabación (derivada del audio), no `xeno-canto` fijo.

El comportamiento para las fichas de **aves** SHALL permanecer idéntico al actual (los valores derivados coinciden con los literales previos). Ningún campo de esquema ni de datos SHALL cambiar; los valores se derivan del `grupo` y de los campos del audio ya presentes.

#### Scenario: Clase taxonómica según el grupo
- **WHEN** se abre el detalle de un anfibio (`grupo: anfibios`)
- **THEN** la fila "Clase" de la tabla de taxonomía muestra `Amphibia` (no `Aves`)

#### Scenario: Ícono según el grupo
- **WHEN** se abre el detalle de un reptil (`grupo: reptiles`)
- **THEN** el ícono del kicker y el de especies relacionadas son el del grupo reptiles (no `Bird`)

#### Scenario: Encuadre de vocalización para anuros
- **WHEN** se abre el detalle de un anuro con audio
- **THEN** el texto descriptivo de la sección Vocalización habla de ranas/sapos y nombra **iNaturalist** como fuente, sin afirmar "Las aves usan la voz" ni "xeno-canto"

#### Scenario: Aves sin regresión
- **WHEN** se abre el detalle de un ave
- **THEN** la clase es `Aves`, el ícono es `Bird` y el encuadre de vocalización es el de aves con `xeno-canto.org` como fuente — idéntico al comportamiento previo

