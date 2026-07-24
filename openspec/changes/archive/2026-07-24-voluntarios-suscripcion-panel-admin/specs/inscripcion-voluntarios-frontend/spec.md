## MODIFIED Requirements

### Requirement: Formulario de inscripción de voluntarios

`/voluntarios` SHALL ofrecer un formulario público de inscripción que capture `nombre`, `correo`, `telefono` (opcional), `jornada` (opcional, texto), `acompanantes` (opcional) y un **consentimiento** de privacidad obligatorio, además de un campo honeypot anti-spam. El texto del consentimiento SHALL mencionar explícitamente que la inscripción implica recibir un resumen semanal de jornadas y eventos próximos, y que el voluntario puede darse de baja en cualquier momento desde el propio correo. El envío SHALL realizarse mediante un **Server Action** que reenvía la inscripción al API (`POST /api/voluntarios`), de modo que la URL del API permanezca server-side. El frontend NO SHALL loguear ni almacenar los datos personales (ADR-0012).

#### Scenario: Inscripción válida
- **WHEN** el usuario completa nombre y correo válidos, acepta el consentimiento y envía
- **THEN** la inscripción se envía al API y el formulario muestra un estado de éxito (confirmación)

#### Scenario: Sin consentimiento no se envía
- **WHEN** el usuario intenta enviar sin aceptar el consentimiento
- **THEN** el formulario lo señala y no envía la inscripción

#### Scenario: Honeypot descarta bots
- **WHEN** el campo honeypot llega con valor (bot)
- **THEN** el envío se descarta en silencio (no se procesa) y no se muestra error al usuario

#### Scenario: El consentimiento menciona el resumen semanal
- **WHEN** el usuario ve el texto de consentimiento del formulario
- **THEN** el texto menciona el resumen semanal de jornadas/eventos y la opción de darse de baja
