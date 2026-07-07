# paginas-error-sitio Specification

## Purpose
Definir el comportamiento de las pantallas de error de las apps del frontend (`apps/sitio` y `apps/catalogo`): la página de "no encontrado" (404) y la página de error inesperado, ambas con la identidad visual del proyecto en lugar de las pantallas por defecto de Next.js. Cubre la navegación de regreso al ecosistema, la coherencia con el sistema de diseño (tokens y tipografía), la accesibilidad y responsividad, y el criterio de implementación genérica duplicada por app sin introducir un paquete de UI compartido ni tooling de monorepo.
## Requirements
### Requirement: Página 404 con identidad del proyecto

Cada app del frontend (`apps/sitio` y `apps/catalogo`) SHALL servir una página de "no encontrado" (404) con la identidad visual del proyecto en lugar de la pantalla por defecto de Next.js, implementada como `app/not-found.tsx`.

#### Scenario: Visitar una URL inexistente

- **WHEN** una persona navega a una ruta que no existe en la app
- **THEN** se muestra la página 404 de marca con la ilustración del humedal (ave en vuelo sobre los juncos), el indicador "Error 404", el titular serif "Esta página voló del humedal" y un texto de apoyo
- **AND** la página hereda el Header y el Footer del `layout.tsx` (el contenido es un bloque centrado, no redefine la barra ni el pie)

#### Scenario: Regresar al ecosistema desde el 404

- **WHEN** la persona está en la página 404
- **THEN** ve un botón primario "Volver al inicio" que enlaza a la home de la app (`/`)
- **AND** ve enlaces secundarios genéricos al ecosistema (p. ej. guía de aves y comunidad) cuyos destinos provienen de `lib/links.ts`

### Requirement: Página de error inesperado con identidad del proyecto

Cada app del frontend SHALL servir una página de error inesperado con identidad de marca
implementada como `app/error.tsx` con la directiva `"use client"`, que recibe el callback
`reset()` y el objeto `error` de Next. El componente SHALL registrar el `error` recibido con
`console.error` para dejar rastro en las herramientas de desarrollador, ya que es el único
mecanismo de observabilidad de errores de cliente disponible sin introducir un servicio de
error tracking de terceros. Cada app SHALL además implementar `app/global-error.tsx` como
boundary del root layout (para errores que ocurren en el propio `layout.tsx`, que `error.tsx`
no puede capturar), con el mismo tratamiento de log y una UI mínima autocontenida (no puede
heredar Header/Footer del layout, porque lo reemplaza).

#### Scenario: Ocurre un error en el render de una ruta

- **WHEN** una ruta lanza un error inesperado durante el render
- **THEN** se muestra la página de error de marca con la ilustración en acento terracota (ave posada entre los juncos), el indicador "Error inesperado", el titular serif "Algo salió mal" y un texto de apoyo
- **AND** la página hereda el Header y el Footer del `layout.tsx`
- **AND** el error se registra con `console.error` antes o durante el render de la pantalla

#### Scenario: Reintentar tras el error

- **WHEN** la persona pulsa el botón primario "Intentar de nuevo"
- **THEN** se invoca el callback `reset()` de Next para reintentar el render del segmento
- **AND** existe además un enlace secundario "Volver al inicio" que lleva a `/`

#### Scenario: Ocurre un error en el root layout

- **WHEN** el propio `layout.tsx` (o algo que renderiza antes que él) lanza un error
- **THEN** `global-error.tsx` lo captura, registra el error con `console.error` y muestra una UI mínima con opción de reintentar
- **AND** esa UI no depende de Header/Footer (renderiza su propio `<html>`/`<body>`, como exige Next para este boundary)

### Requirement: Coherencia visual con el sistema de diseño

Las páginas 404 y de error SHALL usar exclusivamente los tokens de color y tipografía definidos en `app/tokens.css`/`app/globals.css`, sin colores hardcodeados fuera de los tokens, y utilidades de peso de fuente estándar de Tailwind.

#### Scenario: Estilos derivados de tokens

- **WHEN** se revisa el estilo de las páginas de error
- **THEN** los colores provienen de tokens (forest, mint, paper, ink, terracota…) y no de valores hexadecimales sueltos fuera de la capa de tokens
- **AND** los pesos de fuente usan utilidades estándar (`font-semibold`/`font-bold`), no clases no estándar como `font-600`

### Requirement: Accesibilidad y responsividad de las páginas de error

Las páginas 404 y de error SHALL ser accesibles y responsive: un único `<h1>` por pantalla, foco visible en elementos interactivos, contraste AA y sin desbordes en viewports angostos.

#### Scenario: Navegación por teclado

- **WHEN** una persona recorre la página con el teclado
- **THEN** el botón primario y los enlaces muestran un anillo de foco visible
- **AND** existe un solo encabezado de nivel 1 que anuncia el estado de la página

#### Scenario: Viewport angosto

- **WHEN** la página se muestra en una pantalla de 360px de ancho
- **THEN** la ilustración SVG escala sin desbordar y el contenido permanece legible y centrado verticalmente (`min-h` ~60vh)

### Requirement: Diseño genérico compartido sin paquete común

El diseño de las páginas de error SHALL ser el mismo (genérico) en ambas apps, replicado de forma autocontenida en cada una sin introducir un paquete de UI compartido ni tooling de monorepo.

#### Scenario: Implementación por app

- **WHEN** se implementan las páginas de error
- **THEN** cada app contiene su propio `not-found.tsx`, `error.tsx` y componente de ilustración interno
- **AND** la única variación admitida entre apps son los destinos de enlace (vía `lib/links.ts`) y, opcionalmente, el copy del 404

