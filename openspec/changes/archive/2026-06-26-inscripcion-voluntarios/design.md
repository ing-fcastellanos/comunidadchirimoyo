## Context

`services/api` (Flask + Firestore, ADR-0006) ya implementa el flujo de **contacto** con una división limpia `controller → service → datastore → model` + `email_service` reutilizable. El endpoint de **voluntarios** existe pero es un stub: `voluntarios_controller.inscripcion()` devuelve `501`. El blueprint ya está registrado en `/api/voluntarios` (`app/__init__.py`). `firestore.rules` es deny-all y su comentario ya anticipa "futuras inscripciones de voluntarios" (el backend escribe con service account, que bypasea las reglas). La inscripción captura **PII** → aplica ADR-0012 (minimización, consentimiento, sin PII en logs, retención).

El patrón de contacto a espejar:
- `contacto_service.procesar_contacto`: honeypot → validación → `MensajeContacto` → `guardar_mensaje` (propaga si falla) → `_notificar` best-effort. Resultados `OK|SPAM|INVALIDO` que el controller mapea a HTTP `201|2xx|400`.
- `MensajeContacto.to_firestore`: sella `consentimiento_ts` y `creado_en` con `firestore.SERVER_TIMESTAMP`.
- `email_service.enviar_correo` (Flask-Mail) con `responder_a`.

## Goals / Non-Goals

**Goals:**
- `POST /api/voluntarios` real, espejo del flujo de contacto, cumpliendo ADR-0012.
- Esquema minimizado y consentimiento como evidencia persistida.
- Política de retención **definida** (ADR-0012 lo pide para Fase 4) + medio de borrado.

**Non-Goals:**
- Modelo/colección de jornadas (jornada = string libre).
- Automatización de retención con TTL (mejora futura).
- Cambios en `firestore.rules`, frontend (#22), auth/RBAC.

## Decisions

**D1 — Espejo del patrón de contacto, archivos paralelos.** `app/models/inscripcion.py` (`Inscripcion`), `app/datastore/inscripciones_datastore.py` (`guardar_inscripcion`, colección `voluntarios_inscripciones`), `app/services/inscripcion_service.py` (`procesar_inscripcion`, constantes `OK|SPAM|INVALIDO`), y `voluntarios_controller.py` reescrito para llamar al service. Máxima consistencia, mínima sorpresa; nada de framework nuevo.

**D2 — Esquema (ADR-0012, minimización).**
| Campo | Regla |
|---|---|
| `nombre` | requerido, no vacío, ≤120 |
| `correo` | requerido, formato válido (reusar `_EMAIL_RE` del patrón) |
| `telefono` | opcional, ≤40, dígitos/espacios/`+()-` |
| `jornada` | opcional/requerido como **string** ≤160 (etiqueta o fecha; sin validar catálogo) |
| `acompanantes` | opcional, entero `0..N` (tope razonable, p. ej. 20), default 0 |
| `consentimiento` | requerido, debe ser `true` |
| `website` (honeypot) | si llega no vacío → SPAM |

`correo` **obligatorio** (medio principal + habilita la confirmación), `telefono` opcional. `jornada` se acepta como string libre.

**D3 — Persistencia.** `Inscripcion.to_firestore` → colección `voluntarios_inscripciones` con los campos + `consentimiento` + `consentimiento_ts` + `creado_en` (server timestamps) + `origen` (default `"voluntarios"`). Firestore es la fuente de verdad: si la escritura falla, se propaga → `5xx`.

**D4 — Email best-effort.** Tras persistir: aviso interno a **`VOLUNTARIOS_INBOX`** (nueva env, default `voluntarios@chirimoyo.org`) con los datos de la inscripción y `responder_a` el correo del voluntario; y confirmación al voluntario. Un fallo de SMTP **no** cambia el `201` y se loguea sin PII (`enviar_correo` ya envuelve los errores; el service registra `inscripcion_email_fallido`).

**D5 — Sin PII en logs.** Solo eventos (`inscripcion_recibida` con `doc_id`/`origen`, `inscripcion_spam_rechazado`, `inscripcion_email_fallido`, `inscripcion_error_persistencia`) vía `log_event`. Nunca `nombre/correo/telefono/jornada`.

**D6 — Retención documentada + script.** Se documenta la política (p. ej.: las inscripciones se conservan hasta **N meses después de la jornada**, luego se borran). Se provee un **script** (`services/api/scripts/purgar_inscripciones.py` o equivalente) que borra de `voluntarios_inscripciones` los documentos cuyo `creado_en` supere el umbral, ejecutable manualmente con la service account. La automatización (Firestore TTL sobre un campo `expira_en`) se deja como **issue futuro**. *Alternativa descartada:* TTL ahora — más robusto pero añade setup de política TTL e índices; contra "API mínima" para un volumen bajo.

**D7 — Modificar `api-skeleton`.** El requirement "Endpoints de voluntarios y contacto como stub" se ajusta: voluntarios ya **no** es stub (responde la inscripción real). El health y la conexión a Firestore siguen igual.

## Risks / Trade-offs

- **`jornada` sin validación** → podrían llegar etiquetas inconsistentes. Mitigación: es string acotado; cuando exista el modelo de jornadas se endurece (issue futuro). Aceptado para no bloquear #21.
- **Retención manual** → depende de correr el script. Mitigación: política documentada + script versionado; el issue de automatización (TTL) queda anotado. Volumen esperado bajo.
- **`acompanantes` como entero desde JSON** → hay que coaccionar/validar tipo (rechazar negativos / no-enteros / fuera de tope) sin reflejar PII en el detalle. Cubierto en validación.
- **Spam** → mismo honeypot que contacto (sin rate-limit/captcha, por diseño ADR-0006). Aceptado.

## Migration Plan

Sin migración de datos: nueva colección `voluntarios_inscripciones` (se crea al primer documento). Deploy a Cloud Run del `services/api` actualizado. Definir `VOLUNTARIOS_INBOX` (y `MAIL_*` ya existentes) en el entorno de Cloud Run. Rollback = redeploy de la imagen anterior (el endpoint vuelve a `501`, sin pérdida de datos).

## Open Questions

- **Umbral exacto de retención** (¿6, 12 meses tras la jornada?) — se fija un default razonable en la documentación; el organizador puede ajustarlo. No bloquea la implementación.
