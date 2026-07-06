# ADR-0027 — Retención automática de inscripciones con Firestore TTL

- **Estado:** Accepted
- **Fecha:** 2026-07-06
- **Decisores:** @ing-fcastellanos
- **Issue:** #111

## Contexto

Las inscripciones de voluntarios (`voluntarios_inscripciones`) contienen datos personales (PII). [ADR-0012](0012-privacidad-datos-voluntarios.md) fijó una política de retención: se conservan solo mientras son útiles para organizar las jornadas y se borran pasados ~12 meses desde su creación. El aviso de privacidad publicado en #44 **promete** a la persona usuaria ese borrado temporizado ("las inscripciones se eliminan alrededor de un año después de la jornada").

Hasta ahora ese borrado dependía de correr **a mano** el script `scripts/purgar_inscripciones.py`. Es frágil: si nadie lo ejecuta, los datos se acumulan indefinidamente, contradiciendo de facto lo prometido. Se necesita automatizar el borrado sin introducir infraestructura de código (el proyecto no usa IaC — CLAUDE.md, [ADR-0006](0006-api-minima.md)) ni ampliar el alcance del API con schedulers o Cloud Functions.

Firestore ofrece **políticas TTL**: se designa un campo timestamp y Firestore borra (best-effort) los documentos cuyo valor quede en el pasado, sin código en runtime. Encaja con la restricción de no añadir infra ejecutable.

## Decisión

Automatizar la retención con una **política TTL de Firestore** sobre un campo `expira_en` que cada inscripción sella al escribirse (`creado_en + RETENCION_MESES`, con `RETENCION_MESES = 12` como fuente única en `app/config.py`). La política TTL se **activa como configuración manual de Firestore** (documentada, no en código) y la decisión queda registrada aquí. El script manual se **conserva como respaldo**.

## Alternativas consideradas

- **Solo script manual (statu quo)**: cero infra nueva, pero requiere disciplina humana recurrente; si nadie lo corre, la promesa del aviso se incumple. Descartada como mecanismo principal (se conserva como respaldo).
- **Cloud Scheduler + Cloud Function que corra la purga**: automatiza sin cambiar el modelo de datos, pero introduce infraestructura ejecutable nueva (una función, un scheduler, sus permisos), justo lo que [ADR-0006](0006-api-minima.md) evita en un API mínima. Descartada por sobrecosto de operación.
- **Firestore TTL sobre `expira_en` (elegida)**: borrado automático sin código en runtime ni servicios nuevos; solo un campo materializado al escribir y una política que se activa una vez. Trade-off: es best-effort (borra dentro de 24 h, típicamente hasta 72 h) y solo aplica a documentos que tengan el campo.

## Consecuencias

### Positivas

- El borrado por retención ocurre **sin intervención humana**, cumpliendo lo que el aviso de privacidad promete y reforzando [ADR-0012](0012-privacidad-datos-voluntarios.md).
- Sin infraestructura ejecutable nueva: coherente con [ADR-0006](0006-api-minima.md). La política TTL es configuración, no código.
- Umbral centralizado (`RETENCION_MESES`): un solo número que ajustar, compartido por el modelo y el script.

### Negativas

- **Best-effort**: un documento puede sobrevivir hasta ~72 h tras su vencimiento. Aceptable — el aviso dice "alrededor de un año", no una fecha exacta.
- **No retroactivo**: los documentos escritos antes de este cambio no tienen `expira_en` y el TTL los ignora. Mitigación: el script de respaldo (que filtra por `creado_en`) los cubre.
- **Paso manual fuera de banda**: activar la política TTL es un comando `gcloud`/consola que no vive en el repo; si se recrea la base hay que reactivarla. Documentado en `services/api/README.md`.
- Cada borrado del TTL es una operación de delete facturable; con el volumen esperado, despreciable.

### Neutras

- Se añade un campo `expira_en` al documento de inscripción. No cambia el contrato del endpoint `POST /api/voluntarios` ni el esquema visible del cliente.

## Plan de revisión

Reconsiderar si: (a) se necesita un borrado más estricto que best-effort (p. ej. obligación legal de fecha exacta) → evaluar un job programado; (b) se quiere aplicar retención análoga a `contacto_mensajes` → nuevo cambio con el mismo patrón y su propia línea en el aviso; (c) el proyecto adopta IaC → mover la activación de la política a código declarativo.

## Referencias

- [ADR-0012 — Privacidad de datos de voluntarios](0012-privacidad-datos-voluntarios.md)
- [ADR-0006 — API mínima: inscripciones + contacto](0006-api-minima.md)
- Cambio OpenSpec: `retencion-inscripciones-ttl` (#111)
- [Firestore TTL policies](https://cloud.google.com/firestore/docs/ttl)
