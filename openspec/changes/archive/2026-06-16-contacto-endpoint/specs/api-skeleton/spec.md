## MODIFIED Requirements

### Requirement: Endpoints de voluntarios y contacto como stub

El servicio SHALL registrar los blueprints `voluntarios` (`/api/voluntarios`) y `contacto` (`/api/contacto`). El handler de `voluntarios` SHALL responder `501 Not Implemented` indicando que su lógica se implementa más adelante; su lógica real (validación, escritura en Firestore, email, privacidad) NO SHALL implementarse en este alcance. El handler de `contacto` SHALL implementar su comportamiento real, definido en la capability `contacto` (recepción, validación, persistencia y notificación), y por tanto NO SHALL responder `501`.

#### Scenario: Stub de voluntarios visible
- **WHEN** se hace una petición a `/api/voluntarios`
- **THEN** responde `501` con un mensaje que indica que está pendiente

#### Scenario: Contacto ya no es stub
- **WHEN** se hace `POST /api/contacto` con un payload válido
- **THEN** NO responde `501`; procesa el mensaje según la capability `contacto`
