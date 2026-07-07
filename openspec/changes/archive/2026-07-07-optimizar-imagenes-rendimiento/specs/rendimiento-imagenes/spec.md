## ADDED Requirements

### Requirement: Peso acotado de assets estáticos compartidos

Los assets estáticos servidos en cada carga de página (p. ej. el logo del `Header`/`Footer`) SHALL tener un peso proporcional a su tamaño de despliegue. Un asset mostrado a una resolución de pantalla dada SHALL estar dimensionado y comprimido para esa resolución (con margen para pantallas retina/2x), no servido en su resolución de fuente original sin procesar.

#### Scenario: Logo compartido optimizado

- **WHEN** se carga cualquier página de `sitio` o `catalogo`
- **THEN** el archivo `logo-chirimoyo.png` descargado pesa un orden de magnitud menos que su
  versión original de 830 KB, siendo suficiente para su mayor uso a resolución 2x

### Requirement: Fotos remotas del bucket vía next/image

En `apps/sitio`, los componentes que renderizan fotos reales provenientes de un origen conocido y acotado (el bucket de comunidad, ya cubierto por `images.remotePatterns`, ADR-0021, o el propio contenido estático de la app) SHALL usar el componente `next/image` en lugar de `<img>` crudo, cuando su layout tenga tamaño fijo o un contenedor de proporción fija (`aspect-*`) compatible con la prop `fill`. Esto habilita lazy-loading real, negociación automática de formato y dimensionamiento responsive sin trabajo manual adicional.

#### Scenario: Foto de línea de tiempo optimizada

- **WHEN** se renderiza una foto en la línea de tiempo de comunidad, "El caso", la galería teaser, o el hero del landing
- **THEN** la imagen se sirve mediante `next/image` (con `fill` dentro de su contenedor de aspect-ratio existente, o con `width`/`height` explícitos si es de tamaño fijo)
- **AND** conserva el comportamiento de lazy-loading/priority ya establecido (p. ej. la primera foto del hero sigue cargando con prioridad alta)

#### Scenario: Componente con layout de tamaño dinámico queda excluido

- **WHEN** un componente de imagen no tiene un contenedor de aspect-ratio fijo (p. ej. un visor ampliado cuyo tamaño depende del contenido, como el Lightbox)
- **THEN** puede seguir usando `<img>` crudo, siempre que el código documente explícitamente por qué `next/image` no aplica sin un rework de layout

#### Scenario: Imagen de dominio externo arbitrario queda excluida

- **WHEN** una imagen proviene de una URL cuyo dominio no está (ni puede estarlo de antemano) en `images.remotePatterns`, porque el contenido permite URLs externas arbitrarias definidas por terceros (p. ej. el logo de un aliado, enlazado a su propio sitio o red social)
- **THEN** el componente sigue usando `<img>` crudo, documentando explícitamente por qué `next/image` no aplica (no se mantiene un allowlist de dominios de terceros)

### Requirement: Sin dependencias nuevas de procesamiento de imágenes en sitio

`apps/sitio` NO SHALL agregar una dependencia de procesamiento de imágenes (p. ej. `sharp`) para lograr la optimización de assets estáticos. La optimización de assets fuente (como el logo) SHALL resolverse como una operación puntual sobre el binario versionado, no como un paso de build ni una dependencia de runtime/devDependency nueva.

#### Scenario: package.json de sitio sin librerías de imágenes nuevas

- **WHEN** se revisan las dependencias de `apps/sitio/package.json` tras optimizar el logo
- **THEN** no aparece ninguna dependencia nueva de procesamiento de imágenes
