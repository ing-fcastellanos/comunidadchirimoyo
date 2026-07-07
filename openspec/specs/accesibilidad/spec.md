# accesibilidad Specification

## Purpose
TBD - created by archiving change completar-a11y-wcag-aa. Update Purpose after archive.
## Requirements
### Requirement: Salto al contenido principal (bypass blocks)

Cada app front (`apps/sitio`, `apps/catalogo`) SHALL ofrecer un enlace "Saltar al
contenido" como primer elemento enfocable del documento, que traslade el foco al
contenido principal, cumpliendo WCAG 2.4.1 (Bypass Blocks, Nivel A). El enlace SHALL
estar oculto visualmente hasta recibir foco por teclado, y el `<main>` SHALL exponer
un `id` estable usado como destino del enlace.

#### Scenario: El enlace aparece al tabular

- **WHEN** una persona usuaria carga cualquier página y presiona Tab una vez
- **THEN** el primer elemento enfocable es el enlace "Saltar al contenido", visible mientras tiene foco

#### Scenario: Activarlo mueve el foco al contenido

- **WHEN** el enlace "Saltar al contenido" está enfocado y se activa (Enter)
- **THEN** el foco y el punto de lectura pasan al `<main>` (destino `#contenido`), saltando el header y la navegación

#### Scenario: No interfiere con el mouse

- **WHEN** una persona usuaria navega solo con mouse sin dar foco por teclado
- **THEN** el enlace permanece oculto visualmente y no altera el layout

### Requirement: Contraste mínimo de texto

Todo texto de la interfaz SHALL cumplir una relación de contraste ≥ 4.5:1 con su
fondo para texto normal, y ≥ 3:1 para texto grande (≥ 24px, o ≥ 18.66px en negrita),
conforme a WCAG 1.4.3 (Nivel AA). En particular, los usos de color de acento como
texto pequeño sobre fondos `paper`/`paper-deep` SHALL emplear una tonalidad que
alcance el mínimo (p. ej. `forest-deep`, medido 7.48:1), sin depender del token
`forest` (medido 4.38:1 sobre `paper`).

#### Scenario: Etiquetas de acento sobre paper

- **WHEN** se muestra un texto pequeño en color de acento (p. ej. rótulos en mayúsculas como "Noticias" o "Ecosistema") sobre un fondo `paper`/`paper-deep`
- **THEN** su color alcanza ≥ 4.5:1 de contraste con ese fondo

#### Scenario: El token canónico no se degrada

- **WHEN** el color de acento `forest` se usa sobre fondo blanco (`paper-card`), como en botones
- **THEN** conserva su valor canónico, pues ya cumple el mínimo (4.85:1) en ese contexto

### Requirement: Respeto a movimiento reducido

Las animaciones no esenciales SHALL detenerse o suavizarse cuando la persona usuaria
declara `prefers-reduced-motion: reduce`, conforme a la intención de WCAG 2.3.3 /
2.2.2. Esto incluye el spinner de envío de los formularios y el desplazamiento suave
global (`scroll-behavior: smooth`), además del carrusel del hero (ya cubierto).

#### Scenario: Envío de formulario sin animación de giro

- **WHEN** una persona con `prefers-reduced-motion: reduce` envía un formulario (inscripción o contacto)
- **THEN** el indicador de carga no gira continuamente; el estado "enviando" se comunica sin movimiento perpetuo

#### Scenario: Sin scroll animado

- **WHEN** una persona con `prefers-reduced-motion: reduce` activa un enlace ancla interno
- **THEN** el desplazamiento es instantáneo, sin animación de scroll suave

### Requirement: Estructura de encabezados navegable

Los títulos y subtítulos SHALL usar elementos de encabezado (`<h1>`–`<h6>`)
semánticos y descriptivos, de modo que la estructura sea programáticamente
determinable, conforme a WCAG 1.3.1 (Nivel A) y 2.4.6 (Nivel AA). Cuando una página
tenga un título principal claro, ese título SHALL emplear `<h1>` y los títulos de sus
ítems de primer nivel SHALL anidarse sin saltar niveles respecto a él. Saltar niveles
en agrupaciones secundarias (p. ej. rótulos de grupos de filtros o columnas de pie de
página) NO constituye un incumplimiento, pero SHOULD evitarse cuando sea práctico.

#### Scenario: El título principal es h1 y los ítems no saltan nivel

- **WHEN** una página de listado (p. ej. `/comunidad/noticias`) muestra su título y una grilla de ítems
- **THEN** el título es `<h1>` y cada ítem usa `<h2>`, sin saltar de `<h1>` a `<h3>`

#### Scenario: Encabezados descriptivos y semánticos

- **WHEN** una tecnología de asistencia lista los encabezados de cualquier página pública
- **THEN** cada uno es un elemento `<h1>`–`<h6>` real (no texto estilizado) y describe el contenido que encabeza

### Requirement: Etiquetado programático de controles

Todo control de formulario o de búsqueda SHALL exponer un nombre accesible mediante
`<label>` asociado, `aria-label` o `aria-labelledby`, conforme a WCAG 3.3.2 / 4.1.2
(Nivel A). En particular, el campo de texto del buscador general del catálogo
(`/busqueda`) SHALL tener label programático aunque su etiqueta visual sea un ícono o
placeholder.

#### Scenario: Campo de búsqueda con nombre accesible

- **WHEN** un lector de pantalla enfoca el campo de texto del buscador de `/busqueda`
- **THEN** anuncia un nombre descriptivo del propósito del campo (p. ej. "Buscar especies"), no solo "cuadro de edición"

