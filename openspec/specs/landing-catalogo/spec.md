# landing-catalogo Specification

## Purpose
TBD - created by archiving change landing-catalogo. Update Purpose after archive.
## Requirements
### Requirement: Página de inicio del catálogo (landing estático)

La app del catálogo SHALL servir, como **página índice** (`/`), un landing estático cuyo propósito es que el visitante comprenda en los primeros segundos **qué** es el sitio (un catálogo de la fauna del humedal), **por qué** existe (una comunidad que defiende el humedal del Chirimoyo) y **qué hacer** (explorar el catálogo). El landing SHALL ser un Server Component que NO llama a ningún API; cualquier dato dinámico (p. ej. conteos) SHALL resolverse en build con `getAllFichas()`. El landing NO SHALL contener el buscador ni sus filtros (esos viven en `/busqueda`, capacidad `catalogo-busqueda`).

#### Scenario: Inicio es el landing, no el buscador
- **WHEN** se abre `/` del catálogo
- **THEN** se muestra el landing (hero, secciones y CTAs), no la pantalla de búsqueda + resultados

#### Scenario: Landing estático sin API
- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** `out/index.html` contiene el landing renderizado, sin requerir un servidor en runtime ni llamadas de red a un API

### Requirement: Hero de comprensión en 10 segundos

El landing SHALL abrir con una sección **hero** que contenga: un *eyebrow* con la ubicación (humedal del Chirimoyo · Orizaba, Veracruz), un **H1** (único en la página) con el nombre del catálogo, un subtítulo de una frase, un **CTA primario** "Explorar el catálogo" que enlaza a `/busqueda`, un **CTA secundario** "Conocer la comunidad" que enlaza al sitio de la comunidad (comunidad.chirimoyo.org / chirimoyo.org), y una imagen representativa de la fauna del humedal con texto alternativo descriptivo. La imagen del hero SHALL derivarse del contenido: SHALL ser la **portada curada** (`fotos[0]`) de una especie representativa, obtenida vía el data-layer del catálogo, y NO SHALL estar hardcodeada a un archivo de imagen específico en el componente. El hero SHALL usar los tokens del sistema de diseño y ser legible en un viewport móvil (~380px).

#### Scenario: CTA primario lleva al buscador
- **WHEN** el usuario activa "Explorar el catálogo"
- **THEN** navega a `/busqueda`

#### Scenario: CTA secundario lleva a la comunidad
- **WHEN** el usuario activa "Conocer la comunidad"
- **THEN** navega al sitio de la comunidad (fuera del catálogo)

#### Scenario: La imagen del hero usa la portada curada
- **WHEN** se recura la portada de la especie representativa (cambia `fotos[0]`) y se reconstruye
- **THEN** el hero muestra la nueva portada sin editar el componente `Hero.tsx`

#### Scenario: Jerarquía de encabezados accesible
- **WHEN** se inspecciona el landing
- **THEN** existe exactamente un `<h1>` y los CTAs tienen estados de foco visibles

### Requirement: Sección "Qué hay aquí" con conteo dinámico

El landing SHALL incluir una sección de tres tarjetas escaneables que resuman el contenido del catálogo: (1) el **número de especies de aves**, (2) anfibios y reptiles como categoría, y (3) fichas con fuentes verificadas. El conteo de aves SHALL derivarse en build de `getAllFichas()` y NO SHALL estar hardcodeado.

#### Scenario: El conteo refleja el contenido real
- **WHEN** se agrega o elimina una ficha de ave en `content/` y se reconstruye
- **THEN** el número mostrado en la tarjeta de aves cambia en consecuencia, sin editar el componente

### Requirement: Sección "El humedal" breve con enlace a la comunidad

El landing SHALL incluir una sección breve sobre el humedal (un par de frases, no el relato completo) que enlace al sitio de la comunidad para profundizar. Esta sección NO SHALL duplicar el contenido extenso de comunidad.chirimoyo.org.

#### Scenario: Enlace a la comunidad
- **WHEN** el usuario activa el enlace "Conoce la lucha de la comunidad"
- **THEN** navega al sitio de la comunidad

### Requirement: Sección de cierre con CTA al catálogo

El landing SHALL cerrar con una banda destacada que repita la llamada a la acción principal con un botón "Ir al catálogo" que enlaza a `/busqueda`.

#### Scenario: CTA de cierre lleva al buscador
- **WHEN** el usuario activa "Ir al catálogo" en la banda de cierre
- **THEN** navega a `/busqueda`

