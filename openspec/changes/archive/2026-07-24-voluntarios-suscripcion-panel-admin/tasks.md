## 1. Firestore — campos y subcolección nuevos

- [x] 1.1 Agregar `suscrito: true` a la persistencia de inscripciones nuevas (`inscripcion_service.py`/`inscripciones_datastore.py`) — no migrar las existentes
- [x] 1.2 Definir el esquema de la subcolección `voluntarios_inscripciones/{id}/contactos` (quien, fecha, nota)

## 2. services/api — envío semanal y desuscripción

- [x] 2.1 Endpoint `POST /api/voluntarios/notificar-semana`: recibe la agenda, lee suscritos (`suscrito == true`), arma el correo agregado con `plantilla_html()`, envía
- [x] 2.2 Endpoint `GET /api/voluntarios/desuscribir`: pone `suscrito: false`, idempotente, respuesta genérica sin importar si el ID existe
- [x] 2.3 Autenticación de `notificar-semana` vía `NOTIFICAR_VOLUNTARIOS_SECRET` (comparación en tiempo constante, fail-closed)
- [x] 2.4 Cada correo semanal incluye el link de desuscripción específico del destinatario

## 3. apps/sitio — cálculo de agenda y consentimiento

- [x] 3.1 Route Handler que calcula la agenda de 7 días con `proximasJornadas()` y hace POST a `services/api`
- [x] 3.2 Protege el Route Handler con el mismo secreto compartido, mismo patrón que `app/api/revalidate/route.ts`
- [x] 3.3 Actualiza el texto de consentimiento en `InscripcionForm.tsx` (resumen semanal + darse de baja)

## 4. apps/admin — panel de voluntarios

- [x] 4.1 `lib/voluntarios/read.ts`: lectura de inscripciones con filtros (jornada, suscrito, contactado) vía Admin SDK
- [x] 4.2 Vista de lista en `app/(authed)/voluntarios/page.tsx`: nombre, correo, teléfono, jornada, fecha, estado de suscripción, si fue contactado
- [x] 4.3 Detalle de voluntario: historial completo de la subcolección de contactos + formulario para agregar uno nuevo
- [x] 4.4 Acción para alternar `suscrito` manualmente desde el panel
- [x] 4.5 Route Handler de exportación CSV que respeta los filtros activos, sin incluir texto de notas de contacto
- [x] 4.6 Enlace desde el dashboard a la nueva sección de voluntarios

## 5. Infra y documentación

- [ ] 5.1 Configurar `NOTIFICAR_VOLUNTARIOS_SECRET` en los servicios Cloud Run de `sitio` y `api` (mismo valor en ambos) — acción de deploy real, pendiente hasta que el código esté commiteado y revisado
- [ ] 5.2 Crear el Cloud Scheduler semanal apuntando al Route Handler de `sitio` — misma nota que 5.1
- [x] 5.3 Actualizar `docs/guias/desplegar-sitio-produccion.md` con los pasos del scheduler + el nuevo secreto
