# Tasks — formulario-inscripcion-voluntarios

## 1. Validación + endpoint

- [x] 1.1 `lib/inscripcion-validacion.ts` — `LIMITES` (nombre 120, telefono 40, jornada 160, acompanantesMax 20); tipos `CamposInscripcion` (`nombre, correo, telefono, jornada, acompanantes, consent, website`) y `ErroresInscripcion`; `VALORES_VACIOS`; `validarInscripcion(v)` espejo del backend (#21): nombre req/≤120, correo req+`CORREO_RE`, telefono opc formato laxo/≤40, jornada opc ≤160, acompanantes opc entero `0..20`, consent req
- [x] 1.2 `lib/api.ts` — `export function voluntariosEndpoint() { return ${apiBase()}/api/voluntarios }`

## 2. Server Action

- [x] 2.1 `app/actions/inscripcion.ts` (`"use server"`) — `enviarInscripcion(valores): ResultadoInscripcion` espejo de `enviarContacto`: revalida con `validarInscripcion`; `POST voluntariosEndpoint()` con `{ nombre, correo, telefono, jornada, acompanantes, consentimiento: consent, website }` (trim en strings, `acompanantes` numérico); mapea `201|200 → {ok}`, `400 → {validacion, errores:{}}`, otro/red → `{servidor}`; sin loguear PII

## 3. Formulario (cliente)

- [x] 3.1 `components/voluntarios/InscripcionForm.tsx` (`"use client"`) — estructura de `ContactoForm`: estado `idle|submitting|success|error`, campos controlados, `onSubmit` valida + honeypot (descarta en silencio), `onChange` limpia error del campo, `aria-live`/`aria-invalid`/`aria-describedby`
- [x] 3.2 Campos: nombre (req), correo (req), telefono (opc), jornada (opc, texto, placeholder), acompañantes (`input type=number min=0 max=20`), consentimiento (checkbox + enlace a `/privacidad`)
- [x] 3.3 Estado **success**: confirmación ("Recibimos tu inscripción…"); estado **error**: mensaje genérico + reintentar

## 4. Página /voluntarios

- [x] 4.1 `app/voluntarios/page.tsx` — quitar el copy de "andamiaje/placeholder"; intro real (kicker, h1 "Súmate a las jornadas", lead)
- [x] 4.2 Sección de jornadas: copy + enlace/botón al **Google Calendar** (`(await getEnlaces()).jornadas.calendarioUrl`) con `target="_blank" rel="noopener noreferrer"`; tolerar ausencia de la URL
- [x] 4.3 Montar `<InscripcionForm />` en la página

## 5. Verificación

- [x] 5.1 `npm run typecheck` y `npm run build` en `apps/sitio` sin errores
- [x] 5.2 Dev: `/voluntarios` muestra intro + enlace al calendario + formulario; validación marca campos (falta nombre/correo, correo mal, sin consentimiento, acompañantes fuera de rango); honeypot no rompe
- [x] 5.3 Envío contra el API local (`localhost:8080`, si está corriendo): inscripción válida → estado de éxito y documento en Firestore (o, sin API, error de servidor manejado). Confirmar que la `API_URL` no aparece en el bundle de cliente
- [x] 5.4 Accesibilidad: errores con `aria-invalid`/`aria-describedby`, estado con `aria-live`; el resto del sitio intacto