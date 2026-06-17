## ADDED Requirements

### Requirement: Endpoint de contacto

El servicio SHALL exponer `POST /api/contacto` que reciba un mensaje de contacto del público con los campos `nombre`, `correo`, `asunto`, `mensaje` y `consentimiento`. El endpoint SHALL persistir el mensaje en Firestore y notificar por correo. El endpoint NO SHALL requerir autenticación y SHALL respetar los orígenes CORS configurados (subdominios de `apps/sitio`).

#### Scenario: Mensaje válido se acepta
- **WHEN** se hace `POST /api/contacto` con `nombre`, `correo`, `asunto`, `mensaje` válidos y `consentimiento` = `true`
- **THEN** el mensaje se persiste en Firestore y la respuesta es `201`

#### Scenario: Método no permitido
- **WHEN** se hace `GET /api/contacto`
- **THEN** el endpoint NO procesa un mensaje (solo `POST` crea)

### Requirement: Validación del payload

El servicio SHALL validar el payload antes de persistir. `nombre`, `asunto` y `mensaje` SHALL ser requeridos y no vacíos; `correo` SHALL ser requerido y tener formato de correo válido; `consentimiento` SHALL ser requerido y verdadero. Ante un payload inválido el servicio SHALL responder `400` con un detalle genérico que NO refleje los datos personales recibidos.

#### Scenario: Falta un campo requerido
- **WHEN** se hace `POST /api/contacto` sin `mensaje` (o vacío)
- **THEN** la respuesta es `400` y no se persiste nada

#### Scenario: Correo con formato inválido
- **WHEN** se hace `POST /api/contacto` con `correo` que no tiene formato válido
- **THEN** la respuesta es `400` y no se persiste nada

#### Scenario: Sin consentimiento no se procesa
- **WHEN** se hace `POST /api/contacto` con `consentimiento` ausente o `false`
- **THEN** la respuesta es `400` y no se persiste ni se notifica

### Requirement: Persistencia como fuente de verdad

El servicio SHALL persistir cada mensaje válido en la colección Firestore `contacto_mensajes` con al menos `nombre`, `correo`, `asunto`, `mensaje`, `consentimiento`, el timestamp del consentimiento y el timestamp de creación (server timestamp). Firestore SHALL ser la fuente de verdad: el éxito de la request SHALL depender de la persistencia, no del envío de correo.

#### Scenario: Se persiste con evidencia de consentimiento
- **WHEN** se acepta un mensaje válido
- **THEN** el documento en `contacto_mensajes` incluye el consentimiento y su timestamp

#### Scenario: Fallo de persistencia
- **WHEN** la escritura en Firestore falla
- **THEN** la respuesta es `5xx` y no se promete que el mensaje quedó guardado

### Requirement: Notificación por correo best-effort

El servicio SHALL enviar, tras persistir, un aviso interno a `contacto@chirimoyo.org` y una confirmación al remitente, mediante un servicio de correo reutilizable basado en la configuración SMTP del servicio. El envío SHALL ser best-effort: si la persistencia tuvo éxito pero el envío de correo falla, la respuesta SHALL seguir siendo `201` y el fallo SHALL registrarse sin PII.

#### Scenario: Aviso interno y confirmación
- **WHEN** se persiste un mensaje válido y el SMTP está disponible
- **THEN** se envía un aviso a `contacto@chirimoyo.org` y una confirmación al remitente

#### Scenario: SMTP falla pero el mensaje se guardó
- **WHEN** la persistencia tiene éxito y el envío de correo falla
- **THEN** la respuesta es `201` y se registra el fallo de correo sin datos personales

### Requirement: Anti-spam por honeypot

El servicio SHALL aplicar una defensa anti-spam por honeypot: un campo señuelo que un humano no rellena. Si el campo señuelo llega con valor, el servicio SHALL descartar la petición como spam — NO SHALL persistir ni notificar — y SHALL responder con un éxito aparente (`2xx`) sin revelar que fue rechazada. El servicio NO SHALL implementar rate-limiting ni captcha.

#### Scenario: Bot rellena el honeypot
- **WHEN** se hace `POST /api/contacto` con el campo señuelo no vacío
- **THEN** no se persiste ni se notifica, y la respuesta es un éxito aparente

#### Scenario: Humano deja el honeypot vacío
- **WHEN** se hace `POST /api/contacto` con el campo señuelo vacío y el resto válido
- **THEN** el mensaje se procesa normalmente (`201`)

### Requirement: Sin PII en logs

El servicio SHALL registrar los eventos de contacto (recepción, fallo de correo, rechazo por spam) mediante el helper de logging que descarta campos sensibles, y NUNCA SHALL loguear `nombre`, `correo`, `mensaje` ni el cuerpo de la petición (ADR-0012).

#### Scenario: El evento se loguea sin PII
- **WHEN** llega un mensaje de contacto
- **THEN** los logs registran el evento y metadatos no sensibles, pero nunca los datos personales del mensaje
