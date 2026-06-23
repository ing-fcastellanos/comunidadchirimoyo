## MODIFIED Requirements

### Requirement: Página de inicio del catálogo (landing estático)

La app del catálogo SHALL servir, en la ruta **`/aves`** (índice del grupo aves), un landing estático cuyo propósito es que el visitante comprenda en los primeros segundos **qué** es (la guía de las aves del humedal), **por qué** existe (una comunidad que defiende el humedal del Chirimoyo) y **qué hacer** (explorar el buscador de aves). El landing SHALL ser un Server Component que NO llama a ningún API; cualquier dato dinámico (p. ej. conteos) SHALL resolverse en build con `getAllFichas()`. El landing NO SHALL contener el buscador ni sus filtros (esos viven en `/aves/buscador`, capacidad `catalogo-busqueda`). La home (`/`) ya NO sirve este landing: ahora sirve el hub de fauna (capacidad `catalogo-hub-fauna`).

#### Scenario: /aves sirve el landing de aves
- **WHEN** se abre `/aves` del catálogo
- **THEN** se muestra el landing de aves (hero, secciones y CTAs), no la pantalla de búsqueda + resultados ni el hub

#### Scenario: Landing estático sin API
- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** `out/aves/index.html` contiene el landing renderizado, sin requerir un servidor en runtime ni llamadas de red a un API

### Requirement: Hero de comprensión en 10 segundos

El landing SHALL abrir con una sección **hero** que contenga: un *eyebrow* con la ubicación (humedal del Chirimoyo · Orizaba, Veracruz), un **H1** (único en la página) con el nombre del grupo, un subtítulo de una frase, un **CTA primario** "Explorar el catálogo" que enlaza a `/aves/buscador`, un **CTA secundario** "Conocer la comunidad" que enlaza al sitio de la comunidad (chirimoyo.org), y un **carrusel automático** de imágenes representativas de las aves del humedal. El carrusel SHALL mostrar las **portadas curadas** (`fotos[0]`) de 4 especies fijas y en orden — Avetoro Norteño, Martín Pescador Norteño, Garza Dedos Dorados y Pijije Alas Blancas — obtenidas vía el data-layer del catálogo; NO SHALL hardcodear archivos de imagen específicos en el componente. El carrusel SHALL avanzar **automáticamente en bucle infinito** (4 s por foto, fundido cruzado de 0.8 s) mediante **CSS, sin JavaScript**, y SHALL mostrar un pie de foto que **rota sincronizado** con la imagen activa (nombre común de la especie). Cada imagen SHALL tener texto alternativo descriptivo. Bajo `prefers-reduced-motion: reduce`, el carrusel NO SHALL autoanimar: SHALL mostrar la primera foto (y su pie) de forma fija. El hero SHALL usar los tokens del sistema de diseño y ser legible en un viewport móvil (~380px).

#### Scenario: CTA primario lleva al buscador de aves
- **WHEN** el usuario activa "Explorar el catálogo"
- **THEN** navega a `/aves/buscador`

#### Scenario: CTA secundario lleva a la comunidad
- **WHEN** el usuario activa "Conocer la comunidad"
- **THEN** navega al sitio de la comunidad (fuera del catálogo)

#### Scenario: El carrusel rota automáticamente en bucle
- **WHEN** el usuario observa el hero sin interactuar
- **THEN** las 4 fotos se suceden en bucle infinito con fundido cruzado, y el pie de foto cambia al nombre de la especie visible en cada momento

#### Scenario: Las imágenes del carrusel usan las portadas curadas
- **WHEN** se recura la portada (`fotos[0]`) de alguna de las 4 especies y se reconstruye
- **THEN** el carrusel muestra la nueva portada sin editar el componente `Hero.tsx`

#### Scenario: Respeta prefers-reduced-motion
- **WHEN** el usuario tiene activada la preferencia de movimiento reducido
- **THEN** el carrusel no autoanima y muestra la primera foto con su pie de forma fija

#### Scenario: Jerarquía de encabezados accesible
- **WHEN** se inspecciona el landing
- **THEN** existe exactamente un `<h1>` y los CTAs tienen estados de foco visibles

### Requirement: Sección de cierre con CTA al catálogo

El landing SHALL cerrar con una banda destacada que repita la llamada a la acción principal con un botón "Ir al catálogo" que enlaza a `/aves/buscador`.

#### Scenario: CTA de cierre lleva al buscador de aves
- **WHEN** el usuario activa "Ir al catálogo" en la banda de cierre
- **THEN** navega a `/aves/buscador`
