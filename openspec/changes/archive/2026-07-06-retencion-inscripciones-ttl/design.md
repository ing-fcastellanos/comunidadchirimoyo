## Context

`POST /api/voluntarios` persiste la inscripción vía `inscripciones_datastore.guardar_inscripcion()` → `db.collection("voluntarios_inscripciones").add(inscripcion.to_firestore())`. El documento sella `creado_en` y `consentimiento_ts` con `firestore.SERVER_TIMESTAMP`. La retención hoy es un **script manual** (`scripts/purgar_inscripciones.py`, umbral `_MESES_DEFAULT = 12`, aproxima meses como `30*meses` días) que borra donde `creado_en < now - umbral`. La spec `inscripcion-voluntarios` ("Política de retención de inscripciones") **excluye TTL explícitamente** como mejora futura. El aviso de privacidad (#44) ya promete borrado temporizado de inscripciones. El proyecto no usa IaC (CLAUDE.md); Firestore se configura a mano.

## Goals / Non-Goals

**Goals:**
- Automatizar el borrado de inscripciones vencidas sin intervención humana, coherente con ADR-0012 y con lo que el aviso promete.
- Fuente única del umbral de retención.
- Registrar la decisión de activar TTL (ADR-0027) y documentar su setup.

**Non-Goals:**
- Automatizar contacto; retirar el script; introducir IaC/Cloud Functions; backfill masivo; cambiar el contrato del endpoint.

## Decisions

**D1 — `expira_en` calculado en Python, no aritmética sobre la sentinela.** Firestore TTL borra un documento cuando un **campo timestamp** queda en el pasado; requiere materializar la fecha. `creado_en` es `SERVER_TIMESTAMP` (sentinela sin valor hasta el commit), así que no se puede hacer `creado_en + ventana`. Se calcula `expira_en = datetime.now(timezone.utc) + timedelta(days=30*RETENCION_MESES)` en `to_firestore()`. La diferencia con el `creado_en` real del servidor es de milisegundos (latencia de commit), irrelevante para una retención de 12 meses. Se mantiene la misma convención de "30 días por mes" que el script, para que ambos coincidan.

**D2 — `RETENCION_MESES` en `app/config.py` como fuente única.** El modelo y el script importan la constante. El script deja de definir `_MESES_DEFAULT` local y usa `RETENCION_MESES` como default de su flag `--meses` (el flag sigue permitiendo overrides puntuales). Un solo número que cambiar.

**D3 — La política TTL es configuración, no código.** No hay IaC; la política se activa a mano:
`gcloud firestore fields ttls update expira_en --collection-group=voluntarios_inscripciones --enable-ttl` (o consola). Se **documenta** en el README y se **registra** en ADR-0027. Ninguna parte del servicio crea la política en runtime.

**D4 — El script manual se conserva como respaldo.** Dos razones concretas: (a) los documentos escritos **antes** de este cambio no tienen `expira_en`, y el TTL de Firestore ignora documentos sin el campo (o con un tipo distinto de timestamp) → nunca los borraría; (b) el TTL es **best-effort**: Firestore borra "dentro de 24 h, típicamente hasta 72 h" tras el vencimiento. El script (que usa `creado_en`) sigue siendo la red de seguridad para ambos casos.

**D5 — Alcance solo inscripciones.** `contacto_mensajes` también guarda PII con `creado_en`, pero el aviso solo promete umbral fijo para inscripciones. Automatizar contacto ampliaría alcance sin obligación; se deja como nota futura.

## Risks / Trade-offs

- **Documentos preexistentes sin `expira_en`** → no los toca el TTL. Mitigación: el script de respaldo los cubre (borra por `creado_en`). Backfill masivo se descarta por volumen bajo.
- **Borrado no inmediato (best-effort ≤72 h)** → un documento puede sobrevivir hasta 3 días tras su vencimiento. Aceptable: el aviso dice "alrededor de un año", no una fecha exacta. El script permite forzar si hiciera falta.
- **Costo del TTL** → cada borrado cuenta como una operación de delete facturable; con el volumen esperado es despreciable. Se nombra en el ADR.
- **Verificación diferida** → el borrado automático real no se puede comprobar en el PR (latencia de Firestore). Se verifica que `expira_en` se escribe bien; el borrado se valida post-deploy (paso manual documentado).

## Migration Plan

1. Merge del código (campo `expira_en` empieza a escribirse en inscripciones nuevas).
2. Deploy del API a Cloud Run.
3. **Paso manual (post-deploy):** activar la política TTL sobre `expira_en` (comando documentado en el README).
4. Validación post-deploy: crear un doc de prueba con `expira_en` en el pasado y confirmar que Firestore lo elimina (dentro de la ventana best-effort); limpiar.

Rollback: revertir el commit deja de escribir `expira_en`; la política TTL sobre un campo ausente es inocua (no borra nada nuevo). El script manual sigue disponible.

## Open Questions

- **Retención de contacto** — si más adelante se quiere un umbral fijo para `contacto_mensajes`, sería un cambio análogo (mismo patrón) con su propia línea en el aviso. Fuera de alcance aquí.
