## Context

`voluntarios_inscripciones` existe desde Fase 4 como un registro de una sola vía: se escribe al inscribirse, se lee solo por acceso IAM directo, y se borra por TTL (ADR-0027). La exploración (`/opsx:explore`, preguntas sobre recordatorios y panel de admin) confirmó que no existe ningún mecanismo de seguimiento — ni recordatorios automáticos ni UI de administración — y que la lógica de "próximas ocurrencias de jornadas" ya existe en TypeScript (`apps/sitio/lib/jornadas.ts`, `proximasJornadas()`), mientras que el envío de correo vive en Python (`services/api`, Flask-Mail + `plantilla_html()` de #165).

## Goals / Non-Goals

**Goals:**
- Suscripción semanal a un resumen agregado de jornadas/eventos próximos, con desuscripción de un clic.
- Panel en `apps/admin` para ver, filtrar, exportar y dar seguimiento (log de contactos) a los voluntarios inscritos.
- Reusar la lógica de fechas ya existente (`proximasJornadas`) en vez de duplicarla en Python.

**Non-Goals:**
- No se suscriben retroactivamente las inscripciones existentes (D2).
- No hay recordatorios por jornada individual (solo resumen semanal agregado) — evita que alguien reciba varios correos la misma semana.
- No hay rate-limiting/captcha nuevo (mismo criterio que el resto del API, ADR-0006).
- El campo `jornada` sigue siendo texto libre — no se valida contra un catálogo (ya establecido en `inscripcion-voluntarios`).
- No se automatiza el "marcar como contactado" — es una acción manual de staff, sin integración con email/telefonía real.

## Decisions

### D1 — División de responsabilidades: sitio calcula, api envía

```
Cloud Scheduler (semanal, p. ej. lunes 8am)
        │  HTTP + secreto compartido
        ▼
apps/sitio: POST /api/jobs/agenda-semanal-voluntarios
        │  calcula con proximasJornadas() (ya existente) la ventana
        │  de 7 días — jornadas recurrentes expandidas + eventos puntuales
        │  POST { agenda: [...] } + Authorization: Bearer <secreto>
        ▼
services/api: POST /api/voluntarios/notificar-semana
        │  lee voluntarios_inscripciones donde suscrito == true
        │  arma el correo (plantilla_html) con la agenda recibida
        │  envía a cada suscrito, con link de desuscripción por voluntario
        ▼
Voluntario recibe 1 correo semanal con toda la agenda
```

**Alternativa descartada:** portar `proximasJornadas()` (expansión de recurrencia semanal/mensual-ordinal) a Python dentro de `services/api`. Descartada explícitamente por el usuario — duplicar la lógica de fechas en dos lenguajes es frágil (puede desincronizarse silenciosamente si se cambia una sin la otra).

**Autenticación del trigger:** mismo patrón que `REVALIDATE_SECRET` — un secreto compartido nuevo (`NOTIFICAR_VOLUNTARIOS_SECRET`) verificado con comparación en tiempo constante (`timingSafeEqual`, mismo helper que `app/api/revalidate/route.ts`), no IAM invoker de Cloud Run. Se prefiere consistencia con el patrón ya establecido en el proyecto sobre introducir un segundo mecanismo de auth distinto para llamadas internas.

### D2 — Suscripción solo para inscripciones nuevas, no retroactiva

Las inscripciones existentes a la fecha de este cambio se hicieron bajo un aviso de privacidad que no mencionaba correos recurrentes — suscribirlas sin ese consentimiento explícito es delicado bajo ADR-0012. Solo las inscripciones creadas **después** de este cambio reciben `suscrito: true` por default. Las viejas quedan sin el campo (tratado como `false`/no-suscrito en la lógica de envío). Un admin puede suscribir manualmente a un voluntario viejo desde el panel (capability 2) si el propio voluntario lo pide.

**Alternativa descartada:** suscribir a todos los voluntarios existentes de una vez. Descartada por el usuario — consentimiento informado real, no solo técnico.

### D3 — Copy de consentimiento actualizado

El checkbox de privacidad en `InscripcionForm.tsx` pasa de un aviso genérico a mencionar explícitamente: "recibirás un resumen semanal de jornadas y eventos próximos; puedes darte de baja cuando quieras desde el propio correo." Esto es consentimiento informado real para la nueva suscripción, no solo el aviso de privacidad general ya existente.

### D4 — Desuscripción: token = ID de documento de Firestore

`GET /api/voluntarios/desuscribir?id=<docId>` en `services/api`, público, sin auth (se llega desde un link de correo). Los IDs de documento generados por `.add()` ya son aleatorios de 20 caracteres — sirven de token sin necesitar generar uno nuevo. El endpoint pone `suscrito: false`; es idempotente (llamarlo dos veces no falla) y responde una página/mensaje genérico tanto si el ID existe como si no (no confirma ni niega existencia, evita enumeración aunque los IDs ya sean difíciles de adivinar).

### D5 — Log de contactos como subcolección

`voluntarios_inscripciones/{id}/contactos/{contactoId}`, cada documento: `{ quien: string (email del usuario admin autenticado), fecha: Timestamp (server), nota: string }`. Se eligió subcolección (no un array embebido) porque el usuario confirmó que habrá **múltiples contactos por voluntario** en el tiempo — una subcolección no tiene límite práctico de crecimiento ni compite con el tamaño del documento principal (límite de 1MB de Firestore).

### D6 — Panel de admin: lectura + escritura vía Firebase Admin SDK (mismo patrón que noticias/jornadas)

`apps/admin` ya tiene el patrón establecido (ADR-0030, Firebase-native): server actions/route handlers con Admin SDK, sin extender `services/api`. La nueva sección de voluntarios sigue el mismo patrón: `lib/voluntarios/read.ts` (lectura con filtros), `lib/voluntarios/actions.ts` (agregar contacto, alternar `suscrito` manualmente), `lib/voluntarios/export.ts` o un Route Handler para el CSV. El SA de Cloud Run de `admin` ya tiene `roles/datastore.user` — sin IAM nuevo.

**Se agrega:** un toggle manual de `suscrito` desde el panel (no pedido explícitamente en la exploración, pero es el complemento natural de "mostrar el estado" — sin él, el staff no podría dar de baja a alguien que llama por teléfono en vez de usar el link del correo). Mismo patrón que `alternarEstado` de noticias.

### D7 — CSV export respeta filtros activos

`GET /api/export/voluntarios.csv?...filtros` (Route Handler en `apps/admin`), aplica los mismos filtros que la vista (jornada, suscrito, contactado), streaming `Content-Disposition: attachment`. Columnas: `nombre, correo, telefono, jornada, acompanantes, creado_en, suscrito, ultimo_contacto, total_contactos`. **No incluye el texto de las notas de contacto** — mantiene el CSV exportado con lo mínimo necesario (ADR-0012); el detalle de cada nota se ve solo dentro del panel autenticado.

## Risks / Trade-offs

- **[Riesgo] Volumen de correos semanales si hay muchas jornadas activas** — mitigado por ser un solo correo agregado, no uno por jornada (decisión ya cerrada).
- **[Riesgo] El endpoint de desuscripción es público** — mitigado por ser idempotente, sin confirmar/negar existencia del ID, y no exponer ninguna otra acción (`GET`, no permite modificar nada más que el propio flag `suscrito` del documento referenciado).
- **[Trade-off] Suscripción no retroactiva reduce el alcance inicial** — aceptado explícitamente por el usuario (D2); el panel de admin permite suscribir manualmente caso por caso si hace falta.
- **[Riesgo] Secreto nuevo que sincronizar entre sitio y api** (mismo riesgo ya aceptado con `REVALIDATE_SECRET`) — mismo tratamiento: documentado en el runbook de deploy existente (`docs/guias/desplegar-sitio-produccion.md`), a actualizar como parte de las tareas de este cambio.

## Migration Plan

1. Agregar el campo `suscrito` (solo en inscripciones nuevas) y la subcolección `contactos` — sin migración de datos existentes, ambos son aditivos.
2. Configurar `NOTIFICAR_VOLUNTARIOS_SECRET` en `sitio` y `api` (mismo valor en ambos, mismo procedimiento que `REVALIDATE_SECRET`).
3. Crear el Cloud Scheduler semanal apuntando al Route Handler de `sitio`.
4. Desplegar `admin` con la nueva sección de voluntarios.
5. Actualizar `docs/guias/desplegar-sitio-produccion.md` con los pasos de Cloud Scheduler + el nuevo secreto.

## Open Questions

Ninguna — D1-D7 cierran las decisiones discutidas en `/opsx:explore`. D6 agrega un toggle manual de suscripción no solicitado explícitamente pero justificado como complemento directo de "mostrar el estado"; si el usuario prefiere solo lectura, es un ajuste de una tarea, no un cambio de diseño.
