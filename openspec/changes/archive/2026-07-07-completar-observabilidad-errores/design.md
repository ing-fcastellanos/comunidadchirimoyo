## Context

`error.tsx` existe en ambas apps (`sitio`, `catalogo`) pero destructura solo `{ reset }`,
descartando el `error` que Next ya le pasa — cero log, cero rastro. `global-error.tsx` no existe
en ninguna app: falta el boundary que cubre errores del propio root layout (que `error.tsx` no
puede capturar, porque vive *dentro* del layout).

En el API, `contacto_controller.py` y `voluntarios_controller.py` ya tienen `try/except Exception`
con `log_event("…_error_persistencia")` — deliberadamente sin detalle, según su propio comentario
("sin pistas y sin PII"). Correcto en la intención (ADR-0012), pero sobre-aplicado: el *tipo* de
excepción (`ValueError`, `GoogleAPIError`, etc.) no es PII y hoy se descarta igual. No existe
`@app.errorhandler` global en `create_app()`; cualquier excepción fuera de esos dos `try` cae al
manejo por defecto de Flask.

## Goals / Non-Goals

**Goals:**
- Que ningún error de cliente pase sin dejar rastro en al menos DevTools.
- Cubrir el boundary faltante (`global-error.tsx`) en ambas apps.
- Que el API nunca deje una excepción sin loguear ni sin responder JSON, con el tipo de
  excepción visible para debug, sin tocar el contrato de "nunca PII".
- Cambios acotados, sin nueva infraestructura ni dependencias.

**Non-Goals:**
- Ningún servicio de error tracking (Sentry u otro) — sigue "solo Cloud Logging" (CLAUDE.md).
- Ningún endpoint de reporte de errores de cliente hacia el API (cruzaría ADR-0005 para el
  catálogo, y es alcance no pedido para el sitio).
- `@app.errorhandler(404)` — fuera de alcance, es contrato de rutas, no observabilidad.
- Performance/imágenes/CDN/Lighticidad — la otra mitad de #26, en un change aparte.

## Decisions

### 1. Client: `console.error` puro, sin endpoint de reporte
Se usa el `error` que Next ya inyecta en `error.tsx`/`global-error.tsx`. Es la única opción que no
introduce infraestructura nueva ni cruza ADR-0005. **Límite reconocido explícitamente:** para
`apps/catalogo` (export estático, sin servidor en runtime), esto es el único rastro posible —
nunca llegará a un log server-side observable en producción. Para `apps/sitio` (Cloud Run, SSR),
los errores de **Server Components** ya los loguea Next automáticamente a stdout (capturado por
Cloud Logging) independientemente de este change; `error.tsx`/`global-error.tsx` cubren la parte
de cliente que ese logging automático no ve.

### 2. `global-error.tsx`: UI mínima autocontenida, sin reusar `PantallasError`
Next exige que `global-error.tsx` renderice su propio `<html>`/`<body>` (reemplaza el root
layout completo si este falla) — no puede heredar Header/Footer ni asumir que el layout cargó.
Se implementa como una pantalla mínima con los mismos tokens de color (paper/forest/terra) pero
sin depender de los componentes de `components/error/PantallasError.tsx` si estos asumen contexto
del layout; se verifica caso por caso al implementar.

### 3. API: tipo de excepción sí, mensaje/traceback no
`type(exc).__name__` es información de depuración (p. ej. "ocurrió un `ConnectionError`"), no un
dato personal. El mensaje de la excepción o su traceback sí podrían, en teoría, incluir
fragmentos de un payload mal serializado — se excluyen explícitamente del log para no abrir esa
puerta. Este es el mismo nivel de detalle que ya usa `log_event` para otros eventos (nombre +
metadatos no sensibles), solo se añade un campo.

### 4. `@app.errorhandler(Exception)` no reemplaza los `try/except` existentes
Los `try/except` de los controladores siguen respondiendo su mensaje específico (`"No se pudo
procesar el mensaje"` / `"...la inscripción"`); el handler global es la red de seguridad para
todo lo que esos dos bloques no cubren (rutas futuras, errores en `after_request`, bugs de
routing). Ambos caminos usan `log_event`, así que el formato de log es consistente.

### 5. (descubierto en implementación) El handler global debe dejar pasar `HTTPException`
Flask registra `@app.errorhandler(Exception)` como catch-all: sin guard, también interceptaría
`HTTPException` (404, 405, etc.), reemplazando el 404 nativo por un JSON 500 — justo lo que el
Non-goal de este change prohíbe tocar. El handler comprueba `isinstance(exc, HTTPException)` y,
si lo es, hace `return exc` para que Flask la maneje con su comportamiento normal; solo las
excepciones no-HTTP pasan por el log y el JSON 500 genérico.

## Risks / Trade-offs

- **`console.error` no resuelve observabilidad en producción del catálogo estático:** aceptado y
  documentado como límite arquitectónico, no como bug de este change.
- **`global-error.tsx` con estilos duplicados de `error.tsx`:** pequeña duplicación de marcado,
  aceptada por la misma razón que el resto del proyecto evita un paquete de UI compartido (ADR-0001,
  sin tooling de monorepo) — ya es el patrón establecido en `paginas-error-sitio`.
- **Excepciones con `__str__` que filtran datos vía su tipo (poco común):** el tipo de excepción
  en sí casi nunca es sensible (son nombres de clase, no valores); riesgo residual muy bajo.
