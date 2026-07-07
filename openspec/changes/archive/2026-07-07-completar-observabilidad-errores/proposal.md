## Why

Hoy un error no capturado puede pasar silencioso en las tres capas: en el frontend, `error.tsx`
recibe el objeto `error` en ambas apps pero nunca lo usa (ni `console.error`, ni log alguno) y no
existe `global-error.tsx` en ninguna app (el boundary del root layout falta); en el API, los dos
`try/except` existentes (contacto, voluntarios) descartan a propósito el tipo de excepción
("sin pistas", según su propio comentario) —correcto para no filtrar PII, pero deja los logs sin
ninguna pista de *qué* falló— y no existe un `@app.errorhandler` global, así que cualquier
excepción fuera de esas dos rutas cae al manejo por defecto de Flask (HTML, sin pasar por el
logger estructurado). Es la parte de "observabilidad básica" de la épica #26; la de performance
de imágenes/CDN queda para un change aparte.

## What Changes

- **`error.tsx` (sitio + catálogo):** usar el parámetro `error` que ya reciben y llamar
  `console.error(error)`. Sin dependencias nuevas, sin endpoint de reporte.
- **`global-error.tsx` (sitio + catálogo):** crear el boundary del root layout, hoy ausente en
  ambas apps, con el mismo tratamiento (`console.error` + UI mínima, ya que reemplaza el layout
  raíz completo si este falla).
- **API — manejador global de excepciones:** `@app.errorhandler(Exception)` en `create_app()`
  que responde JSON 500 consistente y loguea vía `log_event` con el **tipo** de excepción
  (`type(exc).__name__`), no el mensaje ni el traceback (evita fugas accidentales de PII en los
  argumentos de la excepción).
- **API — enriquecer los `except Exception` existentes** en `contacto_controller.py` y
  `voluntarios_controller.py`: agregar `exception_type` a los `log_event(...)` que hoy solo
  registran el nombre del evento.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `paginas-error-sitio`: `error.tsx` pasa de ignorar `error` a loguearlo con `console.error`; se
  agrega el requisito de `global-error.tsx` (root layout boundary), ausente hasta ahora.
- `api-skeleton`: el requisito de "Logging estructurado sin PII" se amplía con un manejador
  global de excepciones no capturadas y con el tipo de excepción en los logs existentes.

## Impact

- **Sub-dominios afectados:** `sitio`, `catálogo`, `api`.
- **Código:**
  - `apps/sitio/app/error.tsx`, `apps/catalogo/app/error.tsx` (editar).
  - `apps/sitio/app/global-error.tsx`, `apps/catalogo/app/global-error.tsx` (nuevos).
  - `services/api/app/__init__.py` (agregar `@app.errorhandler(Exception)`).
  - `services/api/app/controllers/contacto_controller.py`,
    `services/api/app/controllers/voluntarios_controller.py` (agregar `exception_type` al log).
- **Sin ADR:** no introduce Sentry ni monitoreo formal (sigue "solo Cloud Logging", CLAUDE.md);
  no cambia el contrato HTTP de rutas existentes.

## No-goals

- No se agrega Sentry ni ninguna herramienta de error tracking de terceros.
- No se agrega un endpoint de reporte de errores de cliente (el catálogo no puede llamar al API
  por ADR-0005; para `sitio` sería alcance nuevo no pedido). El límite de que los errores de
  cliente del catálogo estático nunca llegan a un log de servidor es una limitación arquitectónica
  aceptada, no algo que este change resuelva.
- No se agrega `@app.errorhandler(404)` ni se cambia el contrato de rutas inexistentes.
- No se toca performance de imágenes, CDN ni Lighthouse/Core Web Vitals — esa es la otra mitad de
  #26, para un change separado.
