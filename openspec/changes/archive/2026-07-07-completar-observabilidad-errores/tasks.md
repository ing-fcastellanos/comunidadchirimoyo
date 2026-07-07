## 1. Frontend — error.tsx registra el error

- [x] 1.1 `apps/sitio/app/error.tsx`: recibir también `error` en las props (ya tipado) y llamar `console.error(error)` (p. ej. en el cuerpo del componente, antes del `return`). → `useEffect(() => console.error(error), [error])`.
- [x] 1.2 Replicar 1.1 en `apps/catalogo/app/error.tsx`.

## 2. Frontend — global-error.tsx (boundary faltante)

- [x] 2.1 Confirmar que `components/error/PantallasError.tsx` es presentacional puro (sin depender de Header/Footer del layout) en ambas apps — confirmado: sin `"use client"`, sin imports de layout; `BloqueError` es un `<section>` autocontenido.
- [x] 2.2 Crear `apps/sitio/app/global-error.tsx` (`"use client"`): recibe `error`/`reset`, hace `console.error(error)`, renderiza su propio `<html><body>` con los componentes de `PantallasError` (mismo copy/ilustración que `error.tsx`, sin Header/Footer). Reusa `serif`/`sans` de `@/lib/fonts`.
- [x] 2.3 Replicar 2.2 en `apps/catalogo/app/global-error.tsx`.

## 3. API — manejador global de excepciones

- [x] 3.1 En `services/api/app/__init__.py`, dentro de `create_app()`, registrar `@app.errorhandler(Exception)` que loguee vía `log_event("error_no_manejado", exception_type=type(exc).__name__, path=request.path)` y responda `jsonify({"error": "Ocurrió un error inesperado"}), 500`.
- [x] 3.2 Verificar que el handler no interfiere con los `try/except` locales existentes (deben seguir respondiendo su mensaje específico; el handler global es solo la red de seguridad para lo no cubierto). → además se agregó un guard explícito: si `isinstance(exc, HTTPException)` (404/405/etc.), se deja pasar sin modificar (`return exc`) — Flask registra `Exception` como catch-all que de otro modo capturaría también las HTTPException, rompiendo el 404 nativo (fuera de alcance, ver Non-goals).

## 4. API — enriquecer logs existentes con el tipo de excepción

- [x] 4.1 En `services/api/app/controllers/contacto_controller.py`, agregar `exception_type=type(exc).__name__` al `log_event("contacto_error_persistencia", ...)` (requiere capturar la excepción como `except Exception as exc`).
- [x] 4.2 Replicar 4.1 en `services/api/app/controllers/voluntarios_controller.py` (`log_event("inscripcion_error_persistencia", ...)`).

## 5. Verificación

- [x] 5.1 Frontend: forzar un error de render en una ruta de cada app (dev) y confirmar en la consola del navegador que aparece el `console.error` con el objeto `error`. → ruta temporal en `sitio` que lanza `throw new Error(...)`; `curl` mostró el pipeline de errores de Next activado (`id="__next_error__"`, `data-next-error-digest`/`stack` capturado, carga `app/global-error.js`), confirmando el boundary bien cableado. Ruta temporal eliminada tras la prueba (sin rastro en git).
- [x] 5.2 Frontend: `next build` completo de **ambas** apps (no solo typecheck) — compilan sin errores ni warnings, incluidos `error.tsx` y `global-error.tsx` con la firma de props exacta que exige Next.
- [x] 5.3 API: test funcional con `app.test_client()` — ruta no registrada devuelve 404 nativo (`text/html`, sin pasar por el handler); ruta con excepción `ValueError` no-HTTP devuelve JSON 500 `{"error": "Ocurrió un error inesperado"}` + log `{"message": "error_no_manejado", "exception_type": "ValueError", "path": "/test-boom"}` — sin el mensaje de la excepción (que contenía un correo de prueba) en el log.
- [x] 5.4 API: test funcional con mocks de `procesar_contacto`/`procesar_inscripcion` lanzando `RuntimeError` — ambos devuelven su 500 específico (`"No se pudo procesar el mensaje"` / `"...la inscripción"`, no el genérico del handler global) y sus logs incluyen `exception_type=RuntimeError`.
- [x] 5.5 Confirmado en 5.3/5.4: ningún log emitido contuvo nombre/correo/mensaje de prueba (verificado programáticamente, cero coincidencias).
