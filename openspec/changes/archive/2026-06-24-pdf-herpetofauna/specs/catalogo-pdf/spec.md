## ADDED Requirements

### Requirement: Catálogos por disciplina generados en build

El catálogo SHALL generar, durante el build, **dos archivos PDF por disciplina** a partir de los datos de `content/fauna/` (la misma fuente de verdad del sitio): un catálogo de **ornitología** con las especies de `aves` (`out/catalogo-aves-chirimoyo.pdf`) y un catálogo de **herpetología** con las especies de `anfibios` y `reptiles` (`out/catalogo-herpetofauna-chirimoyo.pdf`). La generación SHALL ocurrir en build, NO en runtime, NO en cliente y NO mediante el API. Ambos PDFs SHALL producirse con un único generador parametrizado por **configuración de disciplina** (grupos incluidos, copy de marca, orden y tonos de categoría, CSV de resúmenes, archivo de salida), sin duplicar la lógica de maquetación.

#### Scenario: El build produce los dos PDFs
- **WHEN** se ejecuta `build:pdf` (parte del flujo de deploy) seguido de `next build`
- **THEN** existen `out/catalogo-aves-chirimoyo.pdf` (aves) y `out/catalogo-herpetofauna-chirimoyo.pdf` (anfibios + reptiles), cada uno con una página por especie de su disciplina más las páginas de marca

#### Scenario: Sin dependencia del API
- **WHEN** se generan los PDFs
- **THEN** el proceso NO realiza ninguna llamada al API ni expone ningún endpoint de generación

#### Scenario: Regeneración determinista al cambiar los datos
- **WHEN** cambia una ficha en `content/` y se vuelve a ejecutar el build
- **THEN** el PDF de su disciplina se regenera reflejando el cambio, y un mismo `content/` produce PDFs equivalentes

#### Scenario: Herpetología agrupa anfibios y reptiles
- **WHEN** se abre `catalogo-herpetofauna-chirimoyo.pdf`
- **THEN** contiene las fichas de anfibios y reptiles, y ninguna de aves

## MODIFIED Requirements

### Requirement: Estructura del documento fiel al diseño

Cada PDF de disciplina SHALL constar de páginas A4 verticales que reproducen el diseño entregado: **portada**, **introducción + leyenda** del sistema de insignias, **índice por categoría**, una **ficha por especie** (una especie por hoja) y una página de **cierre** con créditos, fuentes y licencias. El documento SHALL usar la identidad visual del proyecto (tokens canónicos de color/tipografía: paleta forest/pine/mint/paper/ink con acentos ochre/terra/teal; Cormorant Garamond + Source Sans 3).

#### Scenario: Páginas de marca presentes
- **WHEN** se abre cualquiera de los PDFs
- **THEN** la primera página es la portada, seguida de introducción+leyenda e índice, y la última es el cierre

#### Scenario: Una página por especie
- **WHEN** una disciplina tiene N especies
- **THEN** su PDF contiene N fichas, una por hoja A4

#### Scenario: Tamaño de impresión correcto
- **WHEN** se imprime o previsualiza el PDF
- **THEN** cada hoja es A4 sin márgenes de página añadidos y los fondos/gradientes se imprimen

### Requirement: Contenido de la ficha por especie

Cada ficha SHALL renderizar, a partir de la ficha y de las secciones `##` de su cuerpo:
nombre común, nombre científico con autoridad, **categoría** (`categoria`), otros nombres, una foto
principal con su crédito y licencia, insignias de estatus (`estatusMigratorio`, `gradoOcurrencia`,
`estatusDistribucion`), códigos de conservación (IUCN y NOM-059), taxonomía (orden/familia/género),
medidas y los extractos de cuatro secciones: Descripción, Cómo identificarla, ¿Sabías que? y Dónde y
cuándo observarla. Las **medidas** SHALL rotular la talla con el criterio de la ficha (`medidas.criterio`,
p. ej. «LHC (hocico-cloaca)» en herpetofauna) cuando exista, cayendo a «Tamaño» si no; `Envergadura`
SHALL mostrarse solo cuando la ficha la declare (aves). Los datos o secciones ausentes SHALL omitirse
sin romper la maquetación de la página.

#### Scenario: Ficha completa
- **WHEN** una especie declara todos los campos
- **THEN** su página muestra encabezado, foto con atribución, insignias, conservación, taxonomía, medidas y las cuatro secciones de texto

#### Scenario: Talla con criterio (LHC)
- **WHEN** una ficha de herpetofauna declara `medidas.criterio: "LHC (hocico-cloaca)"`
- **THEN** la ficha del PDF rotula la talla con ese criterio, no como «Envergadura»

#### Scenario: Datos opcionales ausentes
- **WHEN** una ficha no tiene un dato opcional (p. ej. envergadura) o una sección del cuerpo
- **THEN** esa parte se omite y el resto de la página se renderiza correctamente

### Requirement: Índice por gremio con folios

Cada PDF SHALL incluir un índice que agrupe las especies por **categoría** (`categoria`) en el orden propio de su disciplina (gremios en aves; clases taxonómicas en herpetofauna, ordenadas por grupo) y, por cada especie, muestre su nombre común, su nombre científico y el **folio** de la página de su ficha. (El requisito se generaliza de «gremio» a «categoría»; el título se conserva por continuidad.)

#### Scenario: Folios correctos
- **WHEN** se consulta el índice
- **THEN** cada especie aparece bajo su categoría con el número de página real de su ficha en el documento

#### Scenario: Orden de categorías por disciplina
- **WHEN** se consulta el índice de herpetología
- **THEN** las categorías aparecen agrupadas por grupo (anfibios: Anuros, Salamandras; reptiles: Lagartijas, Serpientes, Tortugas)

### Requirement: Códigos QR reales

El PDF SHALL incluir códigos QR escaneables y válidos. Cada ficha SHALL incluir un QR que enlace a
la página web de esa especie en **`fauna.chirimoyo.org/<grupo>/<slug>`**, derivando `<grupo>` de la
ficha (ADR-0024). Las páginas de introducción y de cierre SHALL incluir un QR que enlace al landing
del sitio. La base de URL SHALL ser configurable.

#### Scenario: QR de especie
- **WHEN** se escanea el QR de una ficha
- **THEN** la URL codificada es `fauna.chirimoyo.org/<grupo>/<slug>` de esa especie (p. ej. `/anfibios/incilius-valliceps`)

#### Scenario: QR de sitio en intro y cierre
- **WHEN** se escanea el QR de la introducción o del cierre
- **THEN** la URL codificada es la del landing del sitio

### Requirement: Descarga desde el catálogo web

El catálogo web SHALL ofrecer enlaces de descarga a **ambos** PDFs estáticos generados (ornitología y
herpetología), sin llamar al API. El acceso SHALL ser contextual: el hub ofrece los dos; el landing de
aves (`/aves`) enlaza el de ornitología; los índices de herpetofauna (`/anfibios`, `/reptiles`) enlazan
el de herpetología.

#### Scenario: Descarga de ambos catálogos desde el hub
- **WHEN** una persona usa el hub del catálogo web
- **THEN** puede descargar tanto `catalogo-aves-chirimoyo.pdf` como `catalogo-herpetofauna-chirimoyo.pdf` desde enlaces a archivos estáticos

#### Scenario: Descarga contextual por grupo
- **WHEN** una persona está en `/anfibios` o `/reptiles`
- **THEN** el enlace de descarga apunta al PDF de herpetología

## REMOVED Requirements

### Requirement: PDF único del catálogo generado en build

**Reason**: El catálogo deja de ser un único PDF de aves y pasa a **dos PDFs por disciplina** (ornitología y herpetología); ver el nuevo requisito *Catálogos por disciplina generados en build*.
**Migration**: La generación ahora corre un generador parametrizado dos veces (`build:pdf`), produciendo `out/catalogo-aves-chirimoyo.pdf` y `out/catalogo-herpetofauna-chirimoyo.pdf`. Quien dependía del PDF único de aves sigue encontrándolo en la misma ruta; el de herpetología es adicional.
