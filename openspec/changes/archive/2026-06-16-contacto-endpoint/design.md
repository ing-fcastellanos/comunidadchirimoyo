## Context

`services/api` es el backend mínimo (ADR-0006): hoy expone `/health` y dos stubs (`/api/voluntarios`, `/api/contacto`) que responden `501`. La infraestructura ya existe: factory `create_app()` con CORS y security headers, cliente Firestore lazy por ADC (`getDbClient()`), placeholders de SMTP en `config.py`, y un helper `log_event()` que descarta PII. Lo que falta es la lógica de contacto y el primer uso real del correo.

Este change implementa `POST /api/contacto` siguiendo la división `controllers/ → services/ → datastore/ → models/`, y convierte los placeholders de SMTP en un mailer funcional y reutilizable.

## Goals / Non-Goals

**Goals:**
- Recibir, validar, persistir y notificar mensajes de contacto del público.
- Firestore como fuente de verdad; correo como notificación best-effort.
- Mailer reutilizable en `services/` (lo reusará voluntarios después).
- Cumplir ADR-0012: consentimiento persistido, cero PII en logs.
- Frenar el grueso del spam con honeypot stateless.

**Non-Goals:**
- Rate-limiting, captcha, o cualquier defensa con estado/terceros.
- Implementar o modificar el endpoint de voluntarios.
- Auth, RBAC, pagos, o cualquier ampliación del alcance del API.
- Panel de administración para leer los mensajes (se leen en la consola de Firestore por ahora).

## Decisions

### 1. Orden de operaciones: persistir → notificar, con correo best-effort
El handler **primero** escribe en Firestore y **después** envía los correos. Si Firestore falla → `500` (no se perdió nada porque no se prometió nada). Si Firestore tiene éxito pero el SMTP falla → **`201`** igual, y se loguea `contacto_email_fallido` (sin PII). 

*Por qué:* el valor para la comunidad es no perder el mensaje. El correo es conveniencia (aviso rápido). Acoplar el éxito de la request al SMTP haría que un hipo del servidor de correo descarte mensajes legítimos. *Alternativa descartada:* exigir ambos → frágil, peor UX.

### 2. Honeypot como única defensa anti-spam (stateless)
Campo oculto (p. ej. `website`) que el front renderiza fuera de vista. Si llega **no vacío** → es bot → se responde `200` **fingiendo éxito** (no se persiste, no se notifica) para no darle señales al bot, y se loguea `contacto_spam_rechazado`.

*Por qué:* Cloud Run escala a cero → un rate-limit en memoria no es confiable entre instancias efímeras; captcha de terceros choca con la postura de privacidad (ADR-0020) y añade fricción a usuarios no técnicos. El honeypot es gratis, sin estado y sin terceros. *Alternativas (rate-limit, captcha):* fuera de alcance; si aparece spam dirigido, se evalúan en un ADR.

### 3. Mailer reutilizable en `services/`
Un módulo de correo en `services/` (p. ej. `email_service.py`) con una función genérica de envío sobre `smtplib`/Flask-Mail usando los `MAIL_*` de `Config`. La lógica de contacto lo invoca dos veces: aviso interno a `contacto@chirimoyo.org` y confirmación al remitente.

*Por qué:* la inscripción de voluntarios necesitará exactamente lo mismo; construirlo reutilizable evita duplicar y re-decidir después. *Alternativa descartada:* mailer acotado a contacto → deuda garantizada.

### 4. Modelo de datos en `contacto_mensajes`
Documento: `nombre`, `correo`, `asunto`, `mensaje`, `consentimiento` (bool), `consentimiento_ts` (timestamp del consentimiento), `creado_en` (server timestamp), `origen` (p. ej. `"landing"`). ID autogenerado. Sin campos derivados de IP/tracking.

*Por qué:* `consentimiento` + su timestamp son la evidencia exigida por ADR-0012. `origen` deja la puerta abierta a reusar la colección/endpoint desde otros formularios sin ambigüedad.

### 5. Validación y contrato de respuesta
Validación en el controller/service antes de tocar Firestore:
- `nombre`, `asunto`, `mensaje`: requeridos, no vacíos, con límites de longitud razonables.
- `correo`: requerido, formato válido.
- `consentimiento`: requerido y `true` (sin consentimiento no se procesa).
- Campos faltantes/ inválidos → `400` con detalle **genérico** (sin reflejar PII).

Respuestas: `201` éxito · `200` honeypot (spam, silencioso) · `400` validación · `500` fallo de persistencia. CORS ya restringe orígenes a los subdominios del sitio.

### 6. Cero PII en logs (ADR-0012)
Todo logging pasa por `log_event()`, que ya descarta `nombre/correo/mensaje/...`. Solo se loguean eventos y metadatos no sensibles (`contacto_recibido`, `contacto_email_fallido`, `contacto_spam_rechazado`, conteos, latencias).

## Risks / Trade-offs

- **[Honeypot no frena spam dirigido]** → Aceptado: el 99% del spam es genérico/automatizado. Si aparece spam dirigido, ADR para Turnstile (Cloudflare, compatible con la postura de privacidad) u otra medida.
- **[Confirmación al remitente puede convertir el API en relay si un bot pone un correo de víctima]** → Mitigado por el honeypot (descarta el grueso de bots antes de enviar nada) y por el correo best-effort de bajo volumen; sin reintentos agresivos. A vigilar si crece el volumen.
- **[Primer uso real de SMTP — secretos en Cloud Run]** → `MAIL_PASSWORD` nunca en el repo; se inyecta como variable/secret en Cloud Run. Documentar en la guía de deploy. En local, sin credenciales, el envío falla suave (best-effort) y la persistencia sigue funcionando.
- **[PII en Firestore]** → Reglas/IAM de acceso restringido a `contacto_mensajes`; el cuerpo nunca se loguea; aviso de privacidad enlazado desde el form (#48/#56).
- **[SMTP lento bloquea la request]** → Timeout corto en el envío; si excede, se trata como fallo de correo (best-effort) y se responde `201`.
