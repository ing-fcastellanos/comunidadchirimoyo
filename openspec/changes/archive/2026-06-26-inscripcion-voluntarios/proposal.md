## Why

`services/api` ya recibe mensajes de contacto, pero el endpoint de **inscripción de voluntarios** sigue siendo un stub que responde `501` ("pendiente Fase 4"). Sin él, las jornadas de limpieza no tienen forma de captar inscripciones en infraestructura propia (ADR-0006). Este cambio implementa ese flujo, cerrando el grueso de la épica #21 y desbloqueando el frontend de voluntarios (#22). Como captura **datos personales**, debe cumplir ADR-0012 (minimización, consentimiento, sin PII en logs, retención).

## What Changes

- **Implementar `POST /api/voluntarios`** (hoy stub `501`) como **espejo 1:1 del patrón de contacto**: `controller` → `inscripcion_service` → `inscripciones_datastore` (colección `voluntarios_inscripciones`) → modelo `Inscripcion` (sella `consentimiento_ts` y `creado_en` con `SERVER_TIMESTAMP`).
- **Esquema minimizado (ADR-0012):** `nombre` (req), `correo` (req — medio principal y habilita la confirmación), `telefono` (opc), `jornada` (string libre; aún no hay modelo de jornadas), `acompanantes` (int opc, default 0), `consentimiento` (bool, debe ser `true`), y honeypot `website` (anti-spam).
- **Validación** de payload con detalle genérico (sin reflejar PII), **anti-spam por honeypot** (descarte silencioso), **persistencia en Firestore como fuente de verdad**, **email best-effort** (aviso interno a `VOLUNTARIOS_INBOX` + confirmación al voluntario; un fallo de SMTP no cambia el resultado), y **sin PII en logs**.
- **Config:** nueva env `VOLUNTARIOS_INBOX` (default razonable), análoga a `CONTACTO_INBOX`.
- **Retención (ADR-0012):** documentar la política de retención/borrado y proveer un **script de borrado** manual; la automatización (Firestore TTL) queda como mejora futura con su propio issue.

## No-goals

- **No** se crea un modelo/colección de **jornadas**: `jornada` se guarda como string libre. Validar contra un catálogo de jornadas es trabajo futuro.
- **No** se automatiza la retención con TTL en este cambio (solo política documentada + script).
- **No** se toca `firestore.rules`: el deny-all vigente ya cubre `voluntarios_inscripciones` (el backend escribe con service account, que bypasea las reglas; el comentario de las reglas ya lo contempla).
- **No** se construye el frontend de voluntarios (#22) ni cuentas de usuario ni RBAC (ADR-0006).
- **No** se reescribe el flujo de contacto (ya funciona); solo se reutiliza su `email_service` y sus patrones.

## Capabilities

### New Capabilities
- `inscripcion-voluntarios`: endpoint de inscripción de voluntarios a jornadas — esquema minimizado, validación, anti-spam, persistencia como fuente de verdad, email de confirmación best-effort, consentimiento y retención, sin PII en logs.

### Modified Capabilities
- `api-skeleton`: el requirement "Endpoints de voluntarios y contacto como stub" deja de aplicar a **voluntarios** (ahora es un endpoint real); contacto ya dejó de ser stub previamente.

## Impact

- **Sub-dominio afectado:** api (`services/api`).
- **Código nuevo:** `app/models/inscripcion.py`, `app/datastore/inscripciones_datastore.py`, `app/services/inscripcion_service.py`; `app/controllers/voluntarios_controller.py` (quitar el `501`, conectar el service); `config.py` (`VOLUNTARIOS_INBOX`); `.env.example` (documentar la env); script de retención en `services/api/` (p. ej. `scripts/`).
- **Datos:** nueva colección Firestore `voluntarios_inscripciones` (PII, acceso por IAM, ADR-0012).
- **Dependencias:** ninguna nueva (Flask, Flask-Mail, `google-cloud-firestore` ya presentes).
- **Privacidad:** captura PII → aplica ADR-0012; **rompe** la convención "el API es solo contacto" solo en el sentido previsto por ADR-0006/#21 (no requiere ADR nuevo: ya estaba contemplado).
