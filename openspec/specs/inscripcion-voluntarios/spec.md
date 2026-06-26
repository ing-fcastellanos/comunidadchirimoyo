# inscripcion-voluntarios Specification

## Purpose
TBD - created by archiving change inscripcion-voluntarios. Update Purpose after archive.
## Requirements
### Requirement: Endpoint de inscripción de voluntarios

El servicio SHALL exponer `POST /api/voluntarios` que reciba una inscripción de voluntario con los campos `nombre`, `correo`, `telefono` (opcional), `jornada`, `acompanantes` (opcional) y `consentimiento`. El endpoint SHALL persistir la inscripción en Firestore y notificar por correo. El endpoint NO SHALL requerir autenticación y SHALL respetar los orígenes CORS configurados (subdominios de `apps/sitio`).

#### Scenario: Inscripción válida se acepta
- **WHEN** se hace `POST /api/voluntarios` con `nombre`, `correo` válidos y `consentimiento` = `true`
- **THEN** la inscripción se persiste en Firestore y la respuesta es `201`

#### Scenario: Método no permitido
- **WHEN** se hace `GET /api/voluntarios`
- **THEN** el endpoint NO crea una inscripción (solo `POST` crea)

### Requirement: Validación del payload de inscripción

El servicio SHALL validar el payload antes de persistir. `nombre` SHALL ser requerido y no vacío; `correo` SHALL ser requerido y tener formato válido; `consentimiento` SHALL ser requerido y verdadero. `telefono` SHALL ser opcional y, si se envía, respetar un formato y largo razonables. `jornada` SHALL aceptarse como texto libre acotado (no se valida contra un catálogo de jornadas). `acompanantes` SHALL ser opcional y, si se envía, un entero no negativo dentro de un tope razonable (default `0`). Ante un payload inválido el servicio SHALL responder `400` con un detalle genérico que NO refleje los datos personales recibidos.

#### Scenario: Falta un campo requerido
- **WHEN** se hace `POST /api/voluntarios` sin `nombre` (o vacío)
- **THEN** la respuesta es `400` y no se persiste nada

#### Scenario: Correo con formato inválido
- **WHEN** se hace `POST /api/voluntarios` con `correo` sin formato válido
- **THEN** la respuesta es `400` y no se persiste nada

#### Scenario: Sin consentimiento no se procesa
- **WHEN** se hace `POST /api/voluntarios` con `consentimiento` ausente o `false`
- **THEN** la respuesta es `400` y no se persiste ni se notifica

#### Scenario: Acompañantes inválido
- **WHEN** se hace `POST /api/voluntarios` con `acompanantes` negativo o no entero
- **THEN** la respuesta es `400` y no se persiste nada

### Requirement: Persistencia de la inscripción como fuente de verdad

El servicio SHALL persistir cada inscripción válida en la colección Firestore `voluntarios_inscripciones` con al menos `nombre`, `correo`, `telefono`, `jornada`, `acompanantes`, `consentimiento`, el timestamp del consentimiento y el timestamp de creación (server timestamp). Firestore SHALL ser la fuente de verdad: el éxito de la request SHALL depender de la persistencia, no del envío de correo.

#### Scenario: Se persiste con evidencia de consentimiento
- **WHEN** se acepta una inscripción válida
- **THEN** el documento en `voluntarios_inscripciones` incluye el consentimiento y su timestamp

#### Scenario: Fallo de persistencia
- **WHEN** la escritura en Firestore falla
- **THEN** la respuesta es `5xx` y no se promete que la inscripción quedó guardada

### Requirement: Notificación por correo best-effort de la inscripción

El servicio SHALL enviar, tras persistir, un aviso interno a la bandeja de voluntarios (`VOLUNTARIOS_INBOX`) y una confirmación al voluntario, mediante el servicio de correo reutilizable basado en la configuración SMTP del servicio. El envío SHALL ser best-effort: si la persistencia tuvo éxito pero el envío de correo falla, la respuesta SHALL seguir siendo `201` y el fallo SHALL registrarse sin PII.

#### Scenario: Aviso interno y confirmación
- **WHEN** se persiste una inscripción válida y el SMTP está disponible
- **THEN** se envía un aviso a `VOLUNTARIOS_INBOX` y una confirmación al voluntario

#### Scenario: SMTP falla pero la inscripción se guardó
- **WHEN** la persistencia tiene éxito y el envío de correo falla
- **THEN** la respuesta es `201` y se registra el fallo de correo sin datos personales

### Requirement: Anti-spam por honeypot

El servicio SHALL aplicar una defensa anti-spam por honeypot: un campo señuelo que un humano no rellena. Si el campo señuelo llega con valor, el servicio SHALL descartar la petición como spam — NO SHALL persistir ni notificar — y SHALL responder con un éxito aparente (`2xx`) sin revelar que fue rechazada. El servicio NO SHALL implementar rate-limiting ni captcha.

#### Scenario: Bot rellena el honeypot
- **WHEN** se hace `POST /api/voluntarios` con el campo señuelo no vacío
- **THEN** no se persiste ni se notifica, y la respuesta es un éxito aparente

#### Scenario: Humano deja el honeypot vacío
- **WHEN** se hace `POST /api/voluntarios` con el campo señuelo vacío y el resto válido
- **THEN** la inscripción se procesa normalmente (`201`)

### Requirement: Sin PII en logs

El servicio SHALL registrar los eventos de inscripción (recepción, fallo de correo, rechazo por spam, error de persistencia) mediante el helper de logging que descarta campos sensibles, y NUNCA SHALL loguear `nombre`, `correo`, `telefono`, `jornada` ni el cuerpo de la petición (ADR-0012).

#### Scenario: El evento se loguea sin PII
- **WHEN** llega una inscripción de voluntario
- **THEN** los logs registran el evento y metadatos no sensibles (p. ej. `doc_id`), pero nunca los datos personales

### Requirement: Política de retención de inscripciones

El proyecto SHALL definir y documentar una política de retención para `voluntarios_inscripciones` (ADR-0012): las inscripciones se conservan solo mientras sean útiles para organizar las jornadas y se borran pasado un umbral definido tras la jornada. El servicio SHALL proveer un medio de borrado conforme a esa política (un script ejecutable con credenciales de servidor que elimine los documentos vencidos). La automatización del borrado (p. ej. Firestore TTL) NO es parte de este alcance y queda como mejora futura.

#### Scenario: Existe política y medio de borrado
- **WHEN** se revisa la capacidad de inscripción de voluntarios
- **THEN** existe una política de retención documentada y un script de borrado de inscripciones vencidas

#### Scenario: Borrado de inscripciones vencidas
- **WHEN** se ejecuta el script de retención sobre inscripciones cuya antigüedad supera el umbral definido
- **THEN** esos documentos se eliminan de `voluntarios_inscripciones` y los vigentes se conservan

