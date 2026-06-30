## Context

El formulario de contacto ya implementa el patrón completo en `apps/sitio`: `lib/contacto-validacion.ts` (reglas compartidas cliente/server), `lib/api.ts` (`contactoEndpoint()`, `API_URL` solo server-side), `app/actions/contacto.ts` (Server Action `enviarContacto` → `POST` al API → `{ok|validacion|servidor}`), y `components/contacto/ContactoForm.tsx` (Client Component, 4 estados, `aria-*`, honeypot). El API #21 (`POST /api/voluntarios`) ya espera `{ nombre, correo, telefono?, jornada?, acompanantes?, consentimiento, website }` y responde `201` (ok), `200` (honeypot, éxito aparente), `400` (inválido), `5xx`. `/voluntarios` es placeholder; `enlaces.json` tiene `jornadas.calendarioUrl` (Google Calendar).

## Goals / Non-Goals

**Goals:**
- Formulario de inscripción funcional, accesible, con consentimiento, contra el API #21.
- `/voluntarios` con intro real + jornadas (calendario) + formulario.

**Non-Goals:**
- Listado curado de jornadas (#22b); donaciones (#23); página `/privacidad` (#56); tocar el API.

## Decisions

**D1 — Espejo 1:1 del patrón de contacto.** Cuatro piezas paralelas: `inscripcion-validacion.ts`, `voluntariosEndpoint()`, `app/actions/inscripcion.ts`, `InscripcionForm.tsx`. Máxima consistencia, cero invención.

**D2 — Esquema/validación (espejo del backend #21).**
| Campo | Regla cliente |
|---|---|
| `nombre` | requerido, ≤120 |
| `correo` | requerido, formato `CORREO_RE` |
| `telefono` | opcional; si viene, formato laxo (`[0-9 +()-]`), ≤40 |
| `jornada` | opcional, texto ≤160 |
| `acompanantes` | opcional, entero `0..20` (coacciona; rechaza negativo/no entero) |
| `consent` | requerido `true` |
| `website` | honeypot (vacío en legítimos) |
`ErroresInscripcion` por campo; el server **revalida** (un cliente puede saltarse el JS) antes de reenviar.

**D3 — Server Action `enviarInscripcion`.** Igual que `enviarContacto`: revalida → `POST voluntariosEndpoint()` con `{ nombre, correo, telefono, jornada, acompanantes, consentimiento: consent, website }` (trim en strings) → `201|200 → {ok}`, `400 → {validacion, errores:{}}`, otro/red → `{servidor}`. `API_URL` nunca sale al cliente.

**D4 — `InscripcionForm.tsx` (cliente).** Reusa la estructura de `ContactoForm`: estado `idle|submitting|success|error`, campos controlados, validación en `onSubmit` + `onChange` que limpia el error del campo, honeypot que descarta en silencio, mensajes `aria-live`, foco/`aria-invalid`/`aria-describedby`. Campos: nombre, correo, teléfono (opc), jornada (opc, texto, placeholder "p. ej. la próxima jornada o una fecha"), acompañantes (`<input type="number" min=0 max=20>`), consentimiento (checkbox + enlace a `/privacidad`). Estado **success**: mensaje de confirmación ("Recibimos tu inscripción…").

**D5 — Página `/voluntarios`.** Server Component: intro (kicker real, h1 "Súmate a las jornadas", lead) → **sección Jornadas** (copy + botón/enlace al Google Calendar `jornadas.calendarioUrl` vía `getEnlaces()`, con `rel="noopener noreferrer" target="_blank"`) → **`<InscripcionForm/>`**. Se elimina el copy de "andamiaje/placeholder".

**D6 — Consentimiento → `/privacidad` (404 temporal).** Igual que contacto: el enlace existe y cae en 404 hasta #56. Aceptado por consistencia; se resolverá al crear la página de privacidad.

**D7 — Sin v0.dev.** El formulario reusa el lenguaje del de contacto; la sección de jornadas usa primitivos.

## Risks / Trade-offs

- **Enlace de privacidad 404** hasta #56 → mismo estado que contacto; aceptado, anotado.
- **`acompanantes` desde input number** → puede llegar string/empty; se coacciona y valida (`0..20`), espejo del backend que ya lo maneja.
- **API caído / sin `API_URL` en prod** → el form muestra error de servidor (degradación clara); la persistencia depende del API (#21), no del front.
- **Jornada como texto libre** → entradas heterogéneas; aceptable hasta el modelo de jornadas (#22b), donde se vuelve selección.

## Migration Plan

Sin migración: solo código de frontend que consume un API existente. Deploy normal del sitio. Requiere `API_URL` en el entorno de Cloud Run (ya necesaria para contacto). Rollback = revertir el commit (vuelve el placeholder).

## Open Questions

- Ninguna que bloquee. Si la comunidad quiere que `jornada` sea obligatoria, se ajusta una línea de validación; por defecto es opcional.
