## Why

El endpoint de contacto (`POST /api/contacto`) ya existe (#46), pero el público no tiene cómo usarlo: el "contacto" del landing es hoy un `mailto:` en el linktree y el footer. #48 entrega la **página `/contacto`** con un formulario accesible que envía mensajes al API y confirma al usuario. Es la pieza que cierra el flujo de contacto de punta a punta y **el primer uso de API de `apps/sitio`** (hoy 100% estático), así que también sienta el patrón de cómo el sitio habla con el backend.

**Sub-dominios afectados:** `sitio`.

## What Changes

- Nueva ruta **`/contacto`** en `apps/sitio` que portea el handoff de diseño v0.dev (`Contacto.jsx`) a TypeScript + tokens del proyecto. Client Component con **4 estados** (idle / submitting / success / error), validación accesible y honeypot `website`.
- **Server Action (decisión B2):** el envío va `navegador → server de Next → services/api`. La URL del API vive **solo en el servidor** (env, p. ej. `API_URL`); el cliente nunca la ve y no hay dependencia de CORS desde el browser.
- **Validación cliente que espeja el backend** (nombre ≤120, correo con formato, asunto ≤160, mensaje ≤5000 con mínimo razonable, consentimiento obligatorio). El Server Action revalida antes de reenviar al API.
- **Mapeo de respuestas del API:** `201` éxito · `200` honeypot (tratar como éxito) · `400` error de validación · `5xx` error genérico.
- **Consentimiento (ADR-0012):** checkbox obligatorio que enlaza a `/privacidad` (#56, aún no existe — se enlaza y se continúa).
- **Puntos de entrada:** el linktree y el footer dejan de ofrecer el contacto solo como `mailto:` y enlazan a `/contacto`.

### No-goals

- **No** se reimplementa la lógica del backend (validación final, persistencia, correo, anti-spam viven en el API, #46).
- **No** se construye la página `/privacidad` (#56) ni el aviso de privacidad completo — solo se enlaza.
- **No** `fetch` directo del cliente al API ni exposición de la URL del API al browser (se descartó B1).
- **No** se toca la inscripción de voluntarios (reusará este patrón después, fuera de alcance).

## Capabilities

### New Capabilities
- `sitio-contacto`: la página `/contacto` del sitio — formulario accesible con sus estados, validación espejo, honeypot, consentimiento, y el Server Action que reenvía al API de contacto ocultando la URL del backend. Incluye los puntos de entrada (linktree/footer) hacia `/contacto`.

### Modified Capabilities
<!-- Ninguna. El linktree/footer ya enlazan "contacto" derivado de enlaces.json (spec landing-sitio); apuntar ese enlace a /contacto es un cambio de contenido/wiring, no de comportamiento speceado. La discoverability de /contacto se cubre como requirement de la nueva capability sitio-contacto. -->

## Impact

- **Código (`apps/sitio`):**
  - `app/contacto/page.tsx` — nueva ruta (envoltura + metadata; el formulario es Client Component).
  - `components/contacto/` — formulario porteado (campo reutilizable, estados, honeypot) desde el handoff.
  - `app/actions/contacto.ts` (o equivalente) — **Server Action** que valida y reenvía a `services/api`.
  - `components/landing/Linktree.tsx` y `components/layout/Footer.tsx` — enlace a `/contacto`.
  - `lib/` — helper de configuración del API (lee `API_URL` server-side).
- **Configuración:** nueva env **server-side** para la URL base del API (`API_URL` / endpoint de contacto) en `.env.example` y `.env.local`; en prod se inyecta en el Cloud Run del sitio. **No** `NEXT_PUBLIC_*` (no se expone al cliente).
- **Contenido:** posible ajuste de `content/landing/enlaces.json` para el destino del enlace de contacto.
- **Dependencias:** consume `POST /api/contacto` (#46, ya desplegable). Enlaza a `/privacidad` (#56, pendiente). Establece el patrón de plumbing del API que reusará la inscripción de voluntarios.
- **Diseño:** handoff v0.dev preservado en `openspec/changes/contacto-form-landing/design-assets/Contacto.jsx`.
