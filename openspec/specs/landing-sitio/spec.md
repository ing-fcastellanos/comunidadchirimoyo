# landing-sitio Specification

## Purpose
Definir el landing estático de `chirimoyo.org` servido por la app de sitio: una página sin API, derivada en build desde `content/landing/`, que comunica qué es el proyecto, por qué importa el humedal del Chirimoyo y qué puede hacer el visitante (conocer la lucha, sumarse, apoyar). Cubre el hero, la sección "El caso", "Qué hacemos", la línea de tiempo de logros, el linktree, las donaciones informativas, el preview de aliados con su página `/aliados` y la banda de cierre con llamada a la acción.
## Requirements
### Requirement: Landing de chirimoyo.org (estático, sin API)

La app de sitio SHALL servir en la ruta `/` (host `chirimoyo.org` / `www`) un **landing** cuyo propósito es que el visitante comprenda en los primeros segundos **qué** es el proyecto (una comunidad que defiende el humedal del Chirimoyo), **por qué** importa (un ecosistema vivo amenazado) y **qué hacer** (conocer la lucha, sumarse, apoyar). El landing SHALL ser un Server Component que NO llama a ningún API; todo su contenido SHALL derivarse en build desde `content/landing/` mediante un data-layer tipado, sin duplicar ni hardcodear el texto en los componentes. El landing SHALL reusar los tokens y primitivas del sistema de diseño y ser legible en un viewport móvil (~380px).

#### Scenario: Inicio muestra el landing real
- **WHEN** se abre `/` con `Host: chirimoyo.org`
- **THEN** se muestra el landing con contenido real (hero, secciones y CTAs), no el placeholder de andamiaje

#### Scenario: Contenido derivado de content/landing
- **WHEN** se edita un archivo de `content/landing/` y se reconstruye
- **THEN** el landing refleja el cambio sin editar los componentes

#### Scenario: Sin llamadas a API
- **WHEN** se renderiza el landing
- **THEN** no se realiza ninguna petición de red a un API; los datos provienen del build

#### Scenario: Jerarquía de encabezados accesible
- **WHEN** se inspecciona el landing
- **THEN** existe exactamente un `<h1>` y los CTAs y enlaces tienen estados de foco visibles

### Requirement: Hero del landing

El landing SHALL abrir con una sección **hero** que contenga: un *eyebrow* con la ubicación (humedal del Chirimoyo · Orizaba, Veracruz), un **H1** único con el título de la lucha (de `lucha.md`), un subtítulo de una frase (resumen de `lucha.md`), un **CTA primario** y al menos un **CTA secundario**, y una **foto-ancla** documental del humedal/jornada. El título y el subtítulo SHALL provenir del frontmatter de `lucha.md`. La foto SHALL tener texto alternativo descriptivo. El hero NO SHALL hardcodear rutas de imagen específicas en el componente: la(s) imagen(es) SHALL resolverse vía el data-layer.

#### Scenario: Hero refleja lucha.md
- **WHEN** se edita el título o el resumen en el frontmatter de `lucha.md` y se reconstruye
- **THEN** el hero muestra el nuevo texto sin editar el componente

#### Scenario: Hero con foto-ancla
- **WHEN** se observa el hero
- **THEN** muestra una foto documental del humedal con su texto alternativo

### Requirement: Sección "El caso"

El landing SHALL incluir una sección que presente el caso del humedal a partir del cuerpo de `lucha.md`: **qué es** el humedal, **la amenaza** y **qué se pide**. El texto SHALL provenir de `lucha.md` (no duplicado en el código). La sección PUEDE acompañarse de una foto panorámica del humedal.

#### Scenario: El caso desde lucha.md
- **WHEN** se actualiza el cuerpo de `lucha.md` y se reconstruye
- **THEN** la sección "El caso" muestra el contenido actualizado

### Requirement: Linktree

El landing SHALL incluir un bloque **linktree** que enlace a los sitios del ecosistema (subdominios), redes sociales y contacto, derivado de `enlaces.json`. Cada enlace SHALL mostrar su icono y título y SHALL apuntar a la URL definida en el contenido. El bloque SHALL distinguirse visualmente de la navegación del Header. Este patrón SHALL pasar por el flujo de diseño v0.dev antes de portarse.

#### Scenario: Enlaces derivados de enlaces.json
- **WHEN** se edita una URL o se agrega una red en `enlaces.json` y se reconstruye
- **THEN** el linktree refleja el cambio sin editar el componente

#### Scenario: Enlaces externos abren el destino correcto
- **WHEN** el usuario activa un enlace del linktree
- **THEN** navega a la URL definida en `enlaces.json`

### Requirement: Sección de donaciones informativas

El landing SHALL incluir una sección de **donaciones informativas** derivada de `donaciones.json`, mostrando los métodos disponibles (p. ej. transferencia SPEI con CLABE, Spin by OXXO, en especie). La sección SHALL ser puramente informativa: NO SHALL procesar pagos ni cobrar en línea (ADR-0007). Los datos sensibles de cobro (CLABE, beneficiario) SHALL provenir de `donaciones.json`.

#### Scenario: Donación informativa sin pasarela
- **WHEN** el usuario consulta la sección de donaciones
- **THEN** ve los métodos y datos para donar (CLABE, enlace/QR de Spin, contacto en especie) sin que el sitio procese un pago

#### Scenario: Métodos derivados de donaciones.json
- **WHEN** se edita un método en `donaciones.json` y se reconstruye
- **THEN** la sección muestra el método actualizado

### Requirement: Preview de aliados y página /aliados

El landing SHALL incluir un **preview** de proyectos aliados (un subconjunto de `aliados.json`) con un enlace a la página `/aliados`. La app SHALL servir `/aliados` con la **rejilla completa** de aliados derivada de `aliados.json`, mostrando para cada uno su nombre, descripción y, si están disponibles, logo y URL. Los componentes SHALL tolerar `logo: null`/`url: null` y entradas `PLACEHOLDER`.

#### Scenario: Preview enlaza a /aliados
- **WHEN** el usuario activa el enlace del preview de aliados
- **THEN** navega a `/aliados`

#### Scenario: /aliados lista todos los aliados
- **WHEN** se abre `/aliados`
- **THEN** se muestran todas las entradas de `aliados.json`

#### Scenario: Aliado sin logo ni URL
- **WHEN** un aliado tiene `logo: null` y `url: null`
- **THEN** se renderiza su nombre y descripción sin imagen rota ni enlace vacío

### Requirement: Cierre con llamada a la acción

El landing SHALL cerrar con una banda final (patrón `pine-deep` del sistema) que repita una llamada a la acción principal hacia el ecosistema (p. ej. sumarse a las jornadas o conocer la comunidad).

#### Scenario: CTA final visible
- **WHEN** el usuario llega al final del landing
- **THEN** ve una banda de cierre con una llamada a la acción accionable

### Requirement: Tipo de aliado visible en la tarjeta

La tarjeta de cada proyecto aliado SHALL mostrar su **`tipo`** (p. ej. colectivo, ONG,
académico, gobierno, negocio, medio, independiente) como una insignia legible, además del
nombre, la descripción, el logo y el enlace, tanto en el preview del landing como en la
página `/aliados`. El `tipo` SHALL derivarse de `aliados.json`; si un aliado no tiene `tipo`
válido, la tarjeta NO SHALL mostrar una insignia vacía.

#### Scenario: La tarjeta muestra el tipo
- **WHEN** se renderiza una tarjeta de aliado cuyo `tipo` es, p. ej., "negocio"
- **THEN** se muestra una insignia con la etiqueta legible del tipo

#### Scenario: Aliado sin tipo
- **WHEN** un aliado no tiene un `tipo` válido
- **THEN** la tarjeta se renderiza sin insignia de tipo, sin romperse

### Requirement: Enlace a la comunidad desde el landing

El landing SHALL incluir, tras la sección "El caso", un **enlace a `/comunidad`** que invite a conocer a la comunidad (qué hace, su historia y sus logros), de modo que el contenido movido a `/comunidad` siga siendo alcanzable desde la portada en ≤1 clic.

#### Scenario: El landing dirige a la comunidad
- **WHEN** se observa el landing tras la sección "El caso"
- **THEN** existe un enlace que lleva a `/comunidad`

