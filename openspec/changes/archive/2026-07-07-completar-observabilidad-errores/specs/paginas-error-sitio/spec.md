## MODIFIED Requirements

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
