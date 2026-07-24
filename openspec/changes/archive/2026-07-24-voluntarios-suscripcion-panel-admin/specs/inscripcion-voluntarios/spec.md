## MODIFIED Requirements

### Requirement: Persistencia de la inscripción como fuente de verdad

El servicio SHALL persistir cada inscripción válida en la colección Firestore `voluntarios_inscripciones` con al menos `nombre`, `correo`, `telefono`, `jornada`, `acompanantes`, `consentimiento`, el timestamp del consentimiento, el timestamp de creación (server timestamp), y `suscrito` = `true`. Firestore SHALL ser la fuente de verdad: el éxito de la request SHALL depender de la persistencia, no del envío de correo. El campo `suscrito` SHALL solo aplicarse a inscripciones creadas a partir de este cambio — las inscripciones existentes previas a este cambio NO se modifican retroactivamente.

#### Scenario: Se persiste con evidencia de consentimiento
- **WHEN** se acepta una inscripción válida
- **THEN** el documento en `voluntarios_inscripciones` incluye el consentimiento y su timestamp

#### Scenario: Fallo de persistencia
- **WHEN** la escritura en Firestore falla
- **THEN** la respuesta es `5xx` y no se promete que la inscripción quedó guardada

#### Scenario: Inscripción nueva queda suscrita
- **WHEN** se persiste una inscripción nueva válida
- **THEN** el documento incluye `suscrito: true`
