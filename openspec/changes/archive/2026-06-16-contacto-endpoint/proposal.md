## Why

El formulario de contacto del landing (`chirimoyo.org`, issue #48) necesita un backend al que enviar mensajes. Hoy `POST /api/contacto` es un stub que responde `501`. Sin este endpoint el formulario no puede implementarse: es la pieza que desbloquea el contacto de la comunidad de punta a punta.

**Sub-dominios afectados:** `api` (implementación), `sitio` (consumidor, #48).

## What Changes

- Implementar `POST /api/contacto`: valida el payload, persiste el mensaje en Firestore (colección `contacto_mensajes`) y notifica por correo.
- **Firestore = fuente de verdad; correo = best-effort.** Si la persistencia tiene éxito pero el envío SMTP falla, la respuesta sigue siendo `201` (el mensaje no se pierde; el fallo de correo se loguea sin PII).
- Notificación por correo: aviso interno a **contacto@chirimoyo.org** + **confirmación al remitente**.
- **Mailer reutilizable** en `services/` (lo reusará la inscripción de voluntarios cuando se implemente — primer uso real del SMTP del proyecto, hoy solo placeholders).
- Payload: `nombre`, `correo`, `asunto`, `mensaje` + **consentimiento** (booleano + timestamp), por ADR-0012.
- **Anti-spam: honeypot** stateless (campo oculto). Si viene relleno → se descarta como spam respondiendo `200` sin persistir ni notificar.
- **No loguear PII**: usar el helper `log_event` existente (descarta campos sensibles).

### No-goals

- **No** rate-limiting ni captcha (frágiles en Cloud Run scale-to-zero / chocan con la postura de privacidad ADR-0020). Si llega spam dirigido, se evalúa en un ADR aparte.
- **No** tocar el endpoint de voluntarios (sigue stub `501`; es otro issue).
- **No** auth, RBAC ni pagos (el API se mantiene mínimo, ADR-0006).

## Capabilities

### New Capabilities
- `contacto`: recepción, validación, persistencia y notificación por correo de mensajes de contacto del público, con consentimiento de privacidad y anti-spam por honeypot.

### Modified Capabilities
- `api-skeleton`: el requirement "Endpoints de voluntarios y contacto como stub" cambia — **contacto** deja de ser stub `501` (su comportamiento real vive ahora en la capability `contacto`); **voluntarios** permanece stub.

## Impact

- **Código (`services/api`):**
  - `app/controllers/contacto_controller.py` — implementa el handler (deja de ser stub).
  - `app/services/` — nuevos módulos: lógica de contacto + mailer reutilizable.
  - `app/datastore/` — escritura en Firestore (`contacto_mensajes`).
  - `app/models/` — entidad `MensajeContacto`.
  - `config.py` — el SMTP (placeholders existentes) pasa a usarse de verdad.
- **Configuración / secretos:** requiere `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_DEFAULT_SENDER` reales en el entorno de Cloud Run (nunca en el repo). Buzón destino `contacto@chirimoyo.org`.
- **Privacidad (ADR-0012):** PII en `contacto_mensajes` → nunca loguear cuerpo, persistir consentimiento, acceso restringido en Firestore, aviso de privacidad enlazado desde el form (#48/#56).
- **Dependientes:** desbloquea #48 (formulario de contacto del landing). Sienta el mailer que reusará la inscripción de voluntarios.
