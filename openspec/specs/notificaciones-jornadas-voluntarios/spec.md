# notificaciones-jornadas-voluntarios Specification

## Purpose
TBD - created by archiving change voluntarios-suscripcion-panel-admin. Update Purpose after archive.
## Requirements
### Requirement: Cálculo semanal de la agenda de jornadas
`apps/sitio` SHALL exponer un Route Handler que, al ser invocado, calcule la agenda de jornadas/eventos de los próximos 7 días reusando la lógica de expansión de recurrencia ya existente (`proximasJornadas`), y la envíe a `services/api` para su envío. El endpoint SHALL requerir un secreto compartido (`NOTIFICAR_VOLUNTARIOS_SECRET`) vía header `Authorization: Bearer`, verificado en tiempo constante, con fail-closed si el secreto no está configurado.

#### Scenario: Invocación autorizada calcula y reenvía la agenda
- **WHEN** Cloud Scheduler invoca el Route Handler con el secreto correcto
- **THEN** se calcula la agenda de los próximos 7 días y se reenvía a `services/api` para el envío

#### Scenario: Invocación sin secreto o con secreto incorrecto
- **WHEN** se invoca el Route Handler sin el header `Authorization` o con un valor incorrecto
- **THEN** responde `401` y no calcula ni reenvía nada

### Requirement: Envío del resumen semanal a suscritos
`services/api` SHALL exponer un endpoint que reciba la agenda semanal y envíe un único correo agregado (no uno por jornada) a cada voluntario con `suscrito == true` en `voluntarios_inscripciones`, usando la plantilla HTML de marca ya existente. El endpoint SHALL requerir el mismo secreto compartido que el Route Handler de `sitio`.

#### Scenario: Envío agregado a todos los suscritos
- **WHEN** `services/api` recibe una agenda semanal válida con el secreto correcto
- **THEN** cada voluntario con `suscrito == true` recibe un solo correo con toda la agenda de la semana, ninguno recibe más de un correo

#### Scenario: Sin suscritos no se envía nada
- **WHEN** no hay ningún voluntario con `suscrito == true`
- **THEN** no se envía ningún correo, sin error

### Requirement: Desuscripción de un clic
`services/api` SHALL exponer `GET /api/voluntarios/desuscribir` que reciba el ID del documento de inscripción como parámetro y ponga `suscrito` en `false`. El endpoint NO SHALL requerir autenticación (se accede desde un link de correo), SHALL ser idempotente, y SHALL responder de forma genérica sin confirmar ni negar si el ID existía.

#### Scenario: Desuscripción exitosa
- **WHEN** se hace `GET /api/voluntarios/desuscribir?id=<docId>` con un ID válido y actualmente suscrito
- **THEN** el documento queda con `suscrito: false` y responde una confirmación genérica

#### Scenario: Desuscripción repetida es idempotente
- **WHEN** se llama al endpoint dos veces con el mismo ID
- **THEN** ambas llamadas responden exitosamente sin error, y el estado final es `suscrito: false`

#### Scenario: ID inexistente no revela información
- **WHEN** se llama al endpoint con un ID que no corresponde a ningún documento
- **THEN** responde el mismo mensaje genérico que una desuscripción exitosa, sin indicar que el ID no existía

### Requirement: Cada correo semanal incluye link de desuscripción
Todo correo de resumen semanal SHALL incluir un link de desuscripción específico del voluntario destinatario (basado en su ID de documento), visible en el cuerpo del correo.

#### Scenario: El correo incluye el link
- **WHEN** un voluntario suscrito recibe el resumen semanal
- **THEN** el correo incluye un link de desuscripción que corresponde únicamente a su propia inscripción
