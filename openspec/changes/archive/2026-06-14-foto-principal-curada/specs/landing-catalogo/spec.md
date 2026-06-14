## MODIFIED Requirements

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
