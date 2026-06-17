# sitio-contacto Specification

## Purpose

La página `/contacto` del sitio (`chirimoyo.org`): un formulario accesible con sus estados (idle / submitting / success / error), validación que espeja el backend, honeypot anti-spam y consentimiento de privacidad (ADR-0012). El envío pasa por un Server Action de Next que reenvía al endpoint de contacto del API ocultando la URL del backend al navegador. Incluye los puntos de entrada hacia `/contacto` desde el linktree del landing y el footer.

## Requirements

### Requirement: Página /contacto con formulario

La app de sitio SHALL servir la ruta `/contacto` con un formulario de contacto para el público, con los campos `nombre`, `correo`, `asunto` y `mensaje`, un checkbox de consentimiento y un campo honeypot. El formulario SHALL ser un Client Component que reusa los tokens y primitivas del sistema de diseño y SHALL ser legible y operable en un viewport móvil (~380px).

#### Scenario: La página existe y muestra el formulario
- **WHEN** el visitante navega a `/contacto`
- **THEN** ve el formulario con los campos nombre, correo, asunto, mensaje y el checkbox de consentimiento

#### Scenario: Campos alineados con el API
- **WHEN** se inspeccionan los campos del formulario
- **THEN** incluyen exactamente los que el endpoint de contacto requiere (nombre, correo, asunto, mensaje, consentimiento) más el honeypot

### Requirement: Envío vía Server Action sin exponer el API

El formulario SHALL enviarse mediante un Server Action de Next que reenvía la petición a `POST /api/contacto`. La URL base del API SHALL leerse solo en el servidor (variable de entorno, no `NEXT_PUBLIC_*`) y NO SHALL exponerse al navegador. El navegador NO SHALL llamar directamente al API.

#### Scenario: La URL del API no llega al cliente
- **WHEN** se inspecciona el bundle/HTML entregado al navegador
- **THEN** no contiene la URL base del API; el envío pasa por el Server Action

#### Scenario: El Server Action reenvía al endpoint de contacto
- **WHEN** el usuario envía un formulario válido
- **THEN** el Server Action hace `POST` al endpoint de contacto del API con el payload del formulario

### Requirement: Validación accesible que espeja el backend

El formulario SHALL validar en cliente con las mismas reglas que el backend: `nombre`, `asunto` y `mensaje` requeridos (largos máximos coherentes con el API), `correo` con formato válido, y `consentimiento` obligatorio. El Server Action SHALL revalidar antes de reenviar al API. Los errores SHALL mostrarse de forma accesible: mensajes por campo asociados con `aria-describedby`, un resumen con `role="alert"` que recibe foco, y los campos requeridos marcados.

#### Scenario: Validación bloquea envío inválido
- **WHEN** el usuario intenta enviar con un campo requerido vacío o un correo con formato inválido
- **THEN** no se llama al API y se muestran los errores por campo más un resumen accesible

#### Scenario: Consentimiento obligatorio
- **WHEN** el usuario intenta enviar sin marcar el consentimiento
- **THEN** el envío se bloquea y se indica que debe aceptar el aviso de privacidad

#### Scenario: Revalidación en el servidor
- **WHEN** llega al Server Action un payload que no cumple las reglas
- **THEN** el Server Action no reenvía al API y devuelve un resultado de error de validación

### Requirement: Estados del formulario y mapeo de respuestas

El formulario SHALL reflejar los estados idle, submitting, success y error. SHALL mapear las respuestas del API así: `201` y `200` (honeypot) → éxito; `400` → error de validación con detalle por campo; `5xx` o fallo de red → error genérico con opción de reintentar. En éxito SHALL mostrar una confirmación anunciada por una región `aria-live`; durante el envío SHALL indicar progreso y evitar envíos duplicados.

#### Scenario: Éxito confirma al usuario
- **WHEN** el API responde `201` (o `200` por honeypot)
- **THEN** el formulario muestra una confirmación accesible de que el mensaje fue recibido

#### Scenario: Error de servidor permite reintentar
- **WHEN** el API responde `5xx` o la red falla
- **THEN** el formulario muestra un mensaje de error genérico y permite reintentar el envío

#### Scenario: Sin envíos duplicados
- **WHEN** el envío está en curso (submitting)
- **THEN** el botón de envío queda deshabilitado hasta que se resuelva

### Requirement: Anti-spam por honeypot en cliente

El formulario SHALL incluir el campo honeypot `website` oculto de forma accesible (fuera de pantalla, `aria-hidden`, `tabindex=-1`, `autocomplete=off`) que un humano no rellena. El valor del honeypot SHALL reenviarse al API para que aplique su decisión anti-spam; el formulario NO SHALL revelar al bot que fue descartado.

#### Scenario: Honeypot oculto para humanos
- **WHEN** un usuario con lector de pantalla o teclado recorre el formulario
- **THEN** el campo honeypot no es alcanzable ni visible

#### Scenario: Honeypot relleno se trata como éxito aparente
- **WHEN** el honeypot llega relleno y el API responde con éxito aparente (`200`)
- **THEN** la UI muestra éxito sin delatar el descarte

### Requirement: Consentimiento enlaza al aviso de privacidad

El checkbox de consentimiento SHALL enlazar al aviso de privacidad en `/privacidad`. El formulario SHALL incluir además una nota breve que tranquilice sobre el uso de los datos (ADR-0012).

#### Scenario: Enlace al aviso de privacidad
- **WHEN** el usuario revisa el consentimiento
- **THEN** encuentra un enlace a `/privacidad` junto a la casilla

### Requirement: Puntos de entrada a /contacto

El sitio SHALL ofrecer un punto de entrada a `/contacto` desde el linktree del landing y desde el footer, en lugar de ofrecer el contacto únicamente como enlace `mailto:`.

#### Scenario: Enlace a /contacto en linktree y footer
- **WHEN** el visitante revisa el linktree o el footer
- **THEN** encuentra un enlace que lleva a la página `/contacto`
