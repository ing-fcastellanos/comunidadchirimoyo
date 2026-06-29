## Why

El API de inscripción de voluntarios ya existe (`POST /api/voluntarios`, #21, en main), pero `/voluntarios` sigue siendo un placeholder de scaffold: no hay forma pública de inscribirse. Este cambio (#22a, épica #22, Fase 4) añade el **formulario de inscripción**, espejo del formulario de contacto ya en producción, para que la gente pueda sumarse a las jornadas. Captura **datos personales** → cumple ADR-0012 (consentimiento, sin loguear PII).

## What Changes

- **`lib/inscripcion-validacion.ts`**: reglas de validación (cliente + revalidación server), espejo del backend (#21): `nombre` req ≤120, `correo` req con formato, `telefono` opc (formato laxo), `jornada` opc str ≤160, `acompanantes` opc entero `0..20`, `consentimiento` req. Tipos `CamposInscripcion`/`ErroresInscripcion`, `VALORES_VACIOS`, honeypot `website`.
- **`lib/api.ts`**: añadir `voluntariosEndpoint()` = `${API_URL}/api/voluntarios` (API_URL solo server-side).
- **`app/actions/inscripcion.ts`** (Server Action): `enviarInscripcion(valores)` revalida y hace `POST` al endpoint; mapea `201/200 → ok`, `400 → validacion`, `5xx/red → servidor` (espejo de `enviarContacto`). La URL del API nunca llega al cliente; no se loguea PII.
- **`components/voluntarios/InscripcionForm.tsx`** (Client Component): 4 estados (idle · submitting · success · error), validación accesible (`aria-*`), honeypot, campos del esquema, `jornada` como texto **opcional**, `acompanantes` como `number`, consentimiento con enlace a `/privacidad`.
- **`app/voluntarios/page.tsx`**: intro real (quita el copy de "andamiaje"), una **sección de jornadas** con enlace al **Google Calendar** (`jornadas.calendarioUrl` de `enlaces.json`), y el formulario.

## No-goals

- **No** se construye el **listado curado de jornadas** (`content/jornadas/`): es #22b futuro (necesita las fechas/datos). Aquí la jornada es texto libre y el calendario es el de Google ya existente.
- **No** se construyen las **donaciones** (épica #23) ni se toca el API (#21 ya hecho).
- **No** se crea la página `/privacidad` (#56/#44): el enlace de consentimiento apunta a ella y cae en 404 hasta entonces — **igual que el formulario de contacto actual**.
- **No** se introduce dependencia nueva ni v0.dev.

## Capabilities

### New Capabilities
- `inscripcion-voluntarios-frontend`: formulario público de inscripción de voluntarios en `/voluntarios` que valida en cliente, envía vía Server Action al API (#21) con consentimiento y honeypot, y muestra estados de éxito/error; además la página presenta las jornadas con enlace al calendario.

### Modified Capabilities
<!-- ninguna: el API (#21) no cambia; /voluntarios no tenía spec de página propia -->

## Impact

- **Sub-dominio afectado:** voluntarios (`apps/sitio`).
- **Código (`apps/sitio`):** `lib/inscripcion-validacion.ts`, `lib/api.ts` (+endpoint), `app/actions/inscripcion.ts`, `components/voluntarios/InscripcionForm.tsx`, `app/voluntarios/page.tsx`.
- **Datos/PII:** la inscripción contiene PII; se envía al API (que persiste en Firestore, #21) con consentimiento. El frontend **no** loguea ni almacena PII (ADR-0012).
- **Config:** depende de `API_URL` (server-side) ya usada por contacto; en local cae a `localhost:8080`.
- **Dependencias:** ninguna nueva.
- **Sin** cambios en esquema ni convenciones → **no requiere ADR** (ADR-0006/0012 ya lo enmarcan).
