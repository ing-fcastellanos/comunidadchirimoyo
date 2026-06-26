## MODIFIED Requirements

### Requirement: Endpoints de voluntarios y contacto como stub

El servicio SHALL registrar los blueprints `voluntarios` (`/api/voluntarios`) y `contacto` (`/api/contacto`). Ambos handlers SHALL implementar su comportamiento real y por tanto NO SHALL responder `501`: `contacto` según la capability `contacto` (recepción, validación, persistencia y notificación) y `voluntarios` según la capability `inscripcion-voluntarios` (inscripción de voluntarios a jornadas). El nombre histórico de este requisito ("como stub") se conserva por trazabilidad, pero ya ningún endpoint del servicio es un stub.

#### Scenario: Voluntarios ya no es stub
- **WHEN** se hace `POST /api/voluntarios` con un payload válido
- **THEN** NO responde `501`; procesa la inscripción según la capability `inscripcion-voluntarios`

#### Scenario: Contacto ya no es stub
- **WHEN** se hace `POST /api/contacto` con un payload válido
- **THEN** NO responde `501`; procesa el mensaje según la capability `contacto`
