## ADDED Requirements

### Requirement: PDF único del catálogo generado en build

El catálogo SHALL generar, durante el build, **un único archivo PDF** con todas las especies del
catálogo a partir de los datos de `content/fauna/aves/` (la misma fuente de verdad del sitio). La
generación SHALL ocurrir en build, NO en runtime, NO en cliente y NO mediante el API. El PDF SHALL
quedar disponible como archivo estático del export en `out/catalogo-aves-chirimoyo.pdf`.

#### Scenario: El build produce el PDF estático
- **WHEN** se ejecuta el build del catálogo
- **THEN** existe `out/catalogo-aves-chirimoyo.pdf` con una página por cada especie del catálogo, más las páginas de marca

#### Scenario: Sin dependencia del API
- **WHEN** se genera el PDF
- **THEN** el proceso NO realiza ninguna llamada al API ni expone ningún endpoint de generación

#### Scenario: Regeneración determinista al cambiar los datos
- **WHEN** cambia una ficha en `content/` y se vuelve a ejecutar el build
- **THEN** el PDF se regenera reflejando el cambio, y un mismo `content/` produce un PDF equivalente

### Requirement: Estructura del documento fiel al diseño

El PDF SHALL constar de páginas A4 verticales que reproducen el diseño entregado: **portada**,
**introducción + leyenda** del sistema de insignias, **índice por gremio**, una **ficha por
especie** (una especie por hoja) y una página de **cierre** con créditos, fuentes y licencias. El
documento SHALL usar la identidad visual del proyecto (tokens canónicos de color/tipografía:
paleta forest/pine/mint/paper/ink con acentos ochre/terra/teal; Cormorant Garamond + Source Sans 3).

#### Scenario: Páginas de marca presentes
- **WHEN** se abre el PDF
- **THEN** la primera página es la portada, seguida de introducción+leyenda e índice, y la última es el cierre

#### Scenario: Una página por especie
- **WHEN** el catálogo tiene N especies
- **THEN** el PDF contiene N fichas, una por hoja A4

#### Scenario: Tamaño de impresión correcto
- **WHEN** se imprime o previsualiza el PDF
- **THEN** cada hoja es A4 sin márgenes de página añadidos y los fondos/gradientes se imprimen

### Requirement: Contenido de la ficha por especie

Cada ficha SHALL renderizar, a partir de la ficha y de las secciones `##` de su cuerpo:
nombre común, nombre científico con autoridad, gremio (`categoria`), otros nombres, una foto
principal con su crédito y licencia, insignias de estatus (`estatusMigratorio`, `gradoOcurrencia`,
`estatusDistribucion`), códigos de conservación (IUCN y NOM-059), taxonomía (orden/familia/género),
medidas (`tamanoCm`, `pesoG`, `envergadura`) y los extractos de cuatro secciones: Descripción,
Cómo identificarla, ¿Sabías que? y Dónde y cuándo observarla. Los datos o secciones ausentes SHALL
omitirse sin romper la maquetación de la página.

#### Scenario: Ficha completa
- **WHEN** una especie declara todos los campos
- **THEN** su página muestra encabezado, foto con atribución, insignias, conservación, taxonomía, medidas y las cuatro secciones de texto

#### Scenario: Datos opcionales ausentes
- **WHEN** una ficha no tiene un dato opcional (p. ej. envergadura) o una sección del cuerpo
- **THEN** esa parte se omite y el resto de la página se renderiza correctamente

### Requirement: Índice por gremio con folios

El PDF SHALL incluir un índice que agrupe las especies por gremio (`categoria`) y, por cada
especie, muestre su nombre común, su nombre científico y el **folio** de la página de su ficha.

#### Scenario: Folios correctos
- **WHEN** se consulta el índice
- **THEN** cada especie aparece bajo su gremio con el número de página real de su ficha en el documento

### Requirement: Imágenes desde la copia local con degradado controlado

La generación SHALL incorporar la foto principal de cada especie desde una copia local del banco
de imágenes, resolviendo el nombre de archivo de la ficha. La ubicación del banco SHALL ser
configurable. Cuando una imagen no se encuentre, la ficha SHALL usar un placeholder y la
generación SHALL registrar un aviso, sin abortar el build.

#### Scenario: Foto resuelta desde el banco local
- **WHEN** existe el archivo de imagen de una especie en la ubicación configurada
- **THEN** la ficha incrusta esa foto, recomprimida a un ancho de impresión razonable

#### Scenario: Imagen faltante no rompe el build
- **WHEN** falta el archivo de imagen de una especie
- **THEN** la ficha muestra un placeholder, se registra un aviso identificando la especie, y el build continúa

### Requirement: Textos de ficha con resúmenes curados

Los cuatro bloques de texto de la ficha SHALL usar, cuando existan, los **resúmenes curados**
(acotados, p. ej. ≤350 caracteres) del CSV de origen (columnas `resumen_descripcion`,
`resumen_como_identificarla`, `resumen_sabias_que`, `resumen_donde_cuando`), casados por nombre
científico. Estos resúmenes SHALL tener prioridad sobre el extracto automático del cuerpo. Si una
especie carece de un resumen, la generación SHALL recurrir a un extracto recortado del cuerpo
Markdown, sin romper la maqueta.

#### Scenario: Resumen curado disponible
- **WHEN** una especie tiene resúmenes en el CSV
- **THEN** la ficha muestra esos textos en lugar de los extractos del cuerpo

#### Scenario: Sin resumen
- **WHEN** una especie no tiene un resumen para un bloque
- **THEN** ese bloque usa un extracto recortado del cuerpo Markdown

### Requirement: Selección y encuadre de foto por especie

El proyecto SHALL proveer una herramienta para elegir, por especie, **cuál** de las fotos
disponibles del banco se usa en el PDF y **cómo se encuadra** en el recuadro del catálogo. La
herramienta SHALL exportar las selecciones como un archivo JSON con, por especie, el nombre de la
foto y un recorte **normalizado** (0..1) respecto a la imagen original. La generación del PDF
SHALL, cuando exista ese archivo, usar la foto elegida y aplicar el recorte a la imagen original;
en su ausencia SHALL recurrir a la primera foto (recorte centrado por defecto).

#### Scenario: Elegir foto distinta de la primera
- **WHEN** la selección de una especie indica una foto distinta de la primera del banco
- **THEN** la ficha de esa especie en el PDF usa la foto indicada

#### Scenario: Aplicar el encuadre
- **WHEN** la selección incluye un recorte normalizado
- **THEN** el PDF recorta la imagen original según ese rectángulo antes de incrustarla

#### Scenario: Sin selección
- **WHEN** no existe el archivo de selecciones, o una especie no aparece en él
- **THEN** la ficha usa la primera foto del banco con recorte centrado, sin romper el build

### Requirement: Códigos QR reales

El PDF SHALL incluir códigos QR escaneables y válidos. Cada ficha SHALL incluir un QR que enlace a
la página web de esa especie (`aves.chirimoyo.org/aves/<slug>`). Las páginas de introducción y de
cierre SHALL incluir un QR que enlace al landing del sitio. La base de URL SHALL ser configurable.

#### Scenario: QR de especie
- **WHEN** se escanea el QR de una ficha
- **THEN** la URL codificada es la de la página de esa especie en el sitio

#### Scenario: QR de sitio en intro y cierre
- **WHEN** se escanea el QR de la introducción o del cierre
- **THEN** la URL codificada es la del landing del sitio

### Requirement: Descarga desde el catálogo web

El catálogo web SHALL ofrecer un enlace/botón de descarga que apunte al PDF estático generado, sin
llamar al API.

#### Scenario: Enlace de descarga disponible
- **WHEN** una persona usa el catálogo web
- **THEN** puede descargar el PDF desde un enlace que apunta al archivo estático `catalogo-aves-chirimoyo.pdf`
