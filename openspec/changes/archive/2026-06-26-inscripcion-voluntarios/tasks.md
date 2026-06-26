# Tasks — inscripcion-voluntarios

## 1. Modelo y persistencia

- [x] 1.1 `app/models/inscripcion.py` — dataclass `Inscripcion` (frozen) con `nombre`, `correo`, `telefono`, `jornada`, `acompanantes`, `consentimiento`, `origen="voluntarios"`; método `to_firestore()` que sella `consentimiento_ts` y `creado_en` con `firestore.SERVER_TIMESTAMP` (espejo de `MensajeContacto`)
- [x] 1.2 `app/datastore/inscripciones_datastore.py` — `guardar_inscripcion(inscripcion) -> str` que escribe en la colección `voluntarios_inscripciones` y devuelve el `doc_id`; propaga la excepción si la escritura falla (Firestore = fuente de verdad)

## 2. Lógica de servicio

- [x] 2.1 `app/services/inscripcion_service.py` — constantes `OK|SPAM|INVALIDO`, honeypot `website`, límites por campo; `procesar_inscripcion(payload)` con orden: honeypot → validación → construir `Inscripcion` → `guardar_inscripcion` (propaga) → `_notificar` best-effort
- [x] 2.2 Validación: `nombre` req/≤120; `correo` req + `_EMAIL_RE`; `telefono` opc/≤40 formato laxo; `jornada` opc string ≤160; `acompanantes` opc entero `0..20` (coacciona y rechaza negativo/no-entero); `consentimiento === true`. Detalle genérico sin PII
- [x] 2.3 `_notificar`: aviso interno a `VOLUNTARIOS_INBOX` (con `responder_a` el correo del voluntario) + confirmación al voluntario; best-effort (captura fallo SMTP → `log_event("inscripcion_email_fallido")`, no cambia el resultado)
- [x] 2.4 Eventos sin PII: `inscripcion_recibida` (doc_id/origen), `inscripcion_spam_rechazado`, `inscripcion_email_fallido` (vía `log_event`)

## 3. Controller

- [x] 3.1 `app/controllers/voluntarios_controller.py` — reemplazar el stub `501` por el handler real: `POST` → `procesar_inscripcion`; mapear `OK→201`, `SPAM→200` (éxito aparente), `INVALIDO→400` (detalle genérico); `except → log_event("inscripcion_error_persistencia")` + `500`. Espejo de `contacto_controller`

## 4. Config

- [x] 4.1 `config.py` — `VOLUNTARIOS_INBOX = os.getenv("VOLUNTARIOS_INBOX", "voluntarios@chirimoyo.org")`
- [x] 4.2 `.env.example` — documentar `VOLUNTARIOS_INBOX` (y confirmar que `MAIL_*` ya cubren el envío)

## 5. Retención (ADR-0012)

- [x] 5.1 Script `services/api/scripts/purgar_inscripciones.py` — borra de `voluntarios_inscripciones` los documentos cuyo `creado_en` supere un umbral (env/arg, default razonable p. ej. 12 meses); usa la service account; imprime cuántos borró; `--dry-run` para listar sin borrar
- [x] 5.2 Documentar la política de retención en `services/api/README.md` (umbral, cómo correr el script, nota de que TTL automático es mejora futura)
- [x] 5.3 Crear issue de seguimiento "Automatizar retención de inscripciones (Firestore TTL)" y enlazarlo

## 6. Verificación

- [x] 6.1 Local: `POST /api/voluntarios` válido → `201` y documento en `voluntarios_inscripciones` con consentimiento + timestamps (emulador o proyecto de prueba)
- [x] 6.2 Inválidos → `400` (falta nombre/correo, correo mal, sin consentimiento, acompanantes negativo); honeypot relleno → `2xx` sin persistir; `GET` no crea
- [x] 6.3 Confirmar que ningún log contiene PII (revisar salida estructurada)
- [x] 6.4 `purgar_inscripciones.py --dry-run` lista candidatos correctamente; el endpoint stub `501` ya no existe
