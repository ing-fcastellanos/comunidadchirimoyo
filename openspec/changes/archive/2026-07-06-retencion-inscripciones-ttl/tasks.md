# Tasks — retencion-inscripciones-ttl

## 1. Umbral centralizado

- [x] 1.1 `services/api/app/config.py` — añadir constante `RETENCION_MESES = 12` (fuente única del umbral de retención, ADR-0012)

## 2. Sellar expira_en

- [x] 2.1 `services/api/app/models/inscripcion.py` — en `to_firestore()`, añadir `expira_en = datetime.now(timezone.utc) + timedelta(days=30*RETENCION_MESES)` (mismo convenio de "30 días/mes" que el script). Importar `RETENCION_MESES` de config
- [x] 2.2 Confirmar que `creado_en`/`consentimiento_ts` siguen como `SERVER_TIMESTAMP` (no se tocan) y que el contrato del endpoint no cambia

## 3. Script de respaldo usa la constante

- [x] 3.1 `services/api/scripts/purgar_inscripciones.py` — importar `RETENCION_MESES` de config y usarlo como default de `--meses`; eliminar el `_MESES_DEFAULT` local. Mantener el script (respaldo). Docstring: aclarar que ahora el borrado principal es TTL y el script es respaldo

## 4. ADR-0027

- [x] 4.1 `docs/decisions/0027-retencion-inscripciones-firestore-ttl.md` — ADR (Accepted): decisión de activar TTL de Firestore sobre `expira_en`; alternativas (script manual solo / Cloud Function / TTL); consecuencias (automatización vs best-effort ≤72 h, docs viejos sin campo, costo de deletes); plan de revisión. Implementa/refuerza ADR-0012 y respeta ADR-0006 (sin infra de código)
- [x] 4.2 `docs/adr/_index.md` — añadir la fila `0027`

## 5. Documentación del setup

- [x] 5.1 `services/api/README.md` — actualizar la sección de retención: `expira_en`, cómo activar la política TTL (`gcloud firestore fields ttls update expira_en --collection-group=voluntarios_inscripciones --enable-ttl` o consola), naturaleza best-effort (24–72 h), el script como respaldo, y el paso de validación post-deploy

## 6. Verificación

- [x] 6.1 Sanity import: el módulo del modelo y el script cargan sin error tras el refactor de la constante (p. ej. `python -c "import app.models.inscripcion; import scripts.purgar_inscripciones"` desde `services/api/`)
- [x] 6.2 Confirmar por inspección que `to_firestore()` produce `expira_en` como `datetime` timezone-aware ~= `creado_en + 12 meses`, sin PII adicional ni cambios en el contrato
- [x] 6.3 Registrar que el borrado automático real se valida **post-deploy** (activar TTL + doc de prueba con `expira_en` en el pasado), fuera del alcance verificable en el PR
