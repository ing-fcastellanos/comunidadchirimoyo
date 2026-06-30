## ADDED Requirements

### Requirement: Formulario de inscripción de voluntarios

`/voluntarios` SHALL ofrecer un formulario público de inscripción que capture `nombre`, `correo`, `telefono` (opcional), `jornada` (opcional, texto), `acompanantes` (opcional) y un **consentimiento** de privacidad obligatorio, además de un campo honeypot anti-spam. El envío SHALL realizarse mediante un **Server Action** que reenvía la inscripción al API (`POST /api/voluntarios`), de modo que la URL del API permanezca server-side. El frontend NO SHALL loguear ni almacenar los datos personales (ADR-0012).

#### Scenario: Inscripción válida
- **WHEN** el usuario completa nombre y correo válidos, acepta el consentimiento y envía
- **THEN** la inscripción se envía al API y el formulario muestra un estado de éxito (confirmación)

#### Scenario: Sin consentimiento no se envía
- **WHEN** el usuario intenta enviar sin aceptar el consentimiento
- **THEN** el formulario lo señala y no envía la inscripción

#### Scenario: Honeypot descarta bots
- **WHEN** el campo honeypot llega con valor (bot)
- **THEN** el envío se descarta en silencio (no se procesa) y no se muestra error al usuario

### Requirement: Validación accesible espejo del backend

El formulario SHALL validar en cliente con reglas que espejan el backend (#21): `nombre` requerido (≤120), `correo` requerido con formato, `telefono` opcional con formato, `jornada` opcional acotada, `acompanantes` opcional entero no negativo dentro de un tope, `consentimiento` requerido. Los errores SHALL mostrarse por campo de forma accesible (`aria-invalid`/`aria-describedby`) y el mensaje de estado SHALL anunciarse (`aria-live`). El Server Action SHALL **revalidar** antes de reenviar (un cliente puede saltarse el JS).

#### Scenario: Campo inválido marcado
- **WHEN** se envía con un campo inválido (p. ej. correo mal formado)
- **THEN** ese campo se marca con su mensaje y el formulario no se envía

#### Scenario: Revalidación en el servidor
- **WHEN** llega al Server Action un payload que no cumple las reglas
- **THEN** se responde como inválido sin reenviarlo al API

### Requirement: Estados de envío y manejo de error

El formulario SHALL manejar los estados **idle**, **enviando**, **éxito** y **error**. Una respuesta de éxito (incluida la respuesta honeypot del API) SHALL mostrar confirmación; un fallo del API o de red SHALL mostrar un error genérico que invite a reintentar, sin exponer detalles internos.

#### Scenario: Error de servidor
- **WHEN** el API responde con error o no está disponible
- **THEN** el formulario muestra un mensaje de error genérico y permite reintentar

### Requirement: Página de voluntarios con jornadas

`/voluntarios` SHALL presentar una introducción real (no placeholder de andamiaje), una sección de **jornadas** con un enlace al **calendario** (la URL de calendario de `enlaces.json`, abierta de forma segura), y el formulario de inscripción.

#### Scenario: La página enlaza el calendario
- **WHEN** se abre `/voluntarios`
- **THEN** se muestra la introducción, un enlace al calendario de jornadas y el formulario de inscripción
