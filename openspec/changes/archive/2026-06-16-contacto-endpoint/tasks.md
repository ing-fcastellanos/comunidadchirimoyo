## 1. Modelo y configuración

- [x] 1.1 Crear `app/models/mensaje_contacto.py` con la entidad `MensajeContacto` (nombre, correo, asunto, mensaje, consentimiento, consentimiento_ts, creado_en, origen)
- [x] 1.2 Verificar/ajustar en `config.py` que `MAIL_*` y `contacto@chirimoyo.org` (destino interno) estén disponibles; documentar que `MAIL_PASSWORD` se inyecta en Cloud Run (nunca en repo)

## 2. Datastore (Firestore)

- [x] 2.1 Crear `app/datastore/contacto_datastore.py`: guardar un `MensajeContacto` en la colección `contacto_mensajes` usando `getDbClient()`, con server timestamp en `creado_en`
- [x] 2.2 Asegurar que un fallo de escritura propague un error (para responder `5xx`) y nunca loguee el cuerpo

## 3. Mailer reutilizable

- [x] 3.1 Crear `app/services/email_service.py`: función genérica de envío sobre SMTP usando `Config.MAIL_*`, con timeout corto, reutilizable por contacto y (futuro) voluntarios
- [x] 3.2 Manejar fallos de envío de forma no fatal (lanzar/retornar señal capturable por el caller para tratarlo como best-effort)

## 4. Lógica de contacto

- [x] 4.1 Crear `app/services/contacto_service.py`: validar payload (nombre/asunto/mensaje requeridos no vacíos, correo válido, consentimiento=true), detectar honeypot
- [x] 4.2 Orquestar: honeypot → descartar silencioso; válido → persistir (datastore) → enviar aviso interno a `contacto@chirimoyo.org` + confirmación al remitente (best-effort)
- [x] 4.3 Registrar eventos con `log_event` (`contacto_recibido`, `contacto_email_fallido`, `contacto_spam_rechazado`) sin PII

## 5. Controller / endpoint

- [x] 5.1 Implementar `app/controllers/contacto_controller.py`: `POST /api/contacto` que llame a `contacto_service` y mapee resultados a códigos (`201` éxito, `200` honeypot, `400` validación, `5xx` persistencia)
- [x] 5.2 Quitar el stub `501`; mantener el blueprint y el registro en `app/__init__.py` sin tocar el de voluntarios
- [x] 5.3 Asegurar que las respuestas de error sean genéricas (sin reflejar PII) y respeten CORS ya configurado

## 6. Verificación

- [x] 6.1 Probar manualmente con `curl`/cliente: payload válido (`201`), honeypot relleno (`2xx` sin persistir), campos faltantes/correo inválido/sin consentimiento (`400`)
- [x] 6.2 Verificar en Firestore que el documento incluye consentimiento + timestamps; verificar que los logs no contienen PII
- [x] 6.3 Verificar que con SMTP no disponible (local sin credenciales) la persistencia sigue dando `201` (best-effort)
- [x] 6.4 `openspec validate "contacto-endpoint" --strict` en verde

## 7. Privacidad y cierre

- [ ] 7.1 Confirmar acceso restringido a `contacto_mensajes` en Firestore (IAM/reglas) — ADR-0012 — _pendiente de infra (Frank)_
- [ ] 7.2 Anotar en la guía de deploy las variables SMTP requeridas en Cloud Run — _pendiente: la guía de deploy del sitio se crea en #53_
