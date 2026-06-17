## Why

El formulario de contacto (#48) ya captura datos personales (PII) y enlaza a `/privacidad` tanto desde su casilla de consentimiento como desde el Footer del ecosistema, pero la página **no existe**: ambos enlaces caen en 404. El ADR-0012 exige un aviso de privacidad para tratar PII bajo la LFPDPPP, y la Fase 4 (inscripción de voluntarios) reusará el mismo aviso. Falta publicar la página.

## What Changes

- Nueva ruta estática `/privacidad` en `apps/sitio` (Server Component, mismo molde que `/aliados`).
- Nuevo contenido `content/landing/privacidad.md`: aviso redactado desde cero sobre el marco del ADR-0012 (LFPDPPP), en formato markdown con secciones (patrón `lucha.md`, parser de secciones por `## H2`, **sin dependencias nuevas**).
- Responsable = colectivo **Comunidad Chirimoyo** (no hay figura legal individual) + email **contacto@chirimoyo.org**.
- Aviso marcado como **borrador** (`estado: borrador`) hasta revisión con criterio legal; no se presenta como texto definitivo.
- Nueva función `getAviso()` en `apps/sitio/lib/landing.ts` (reusa la mecánica de `getLucha`).
- Sin cambios de cableado: Footer ([Footer.tsx:14](apps/sitio/components/layout/Footer.tsx)) y el checkbox de consentimiento ([ContactoForm.tsx:285](apps/sitio/components/contacto/ContactoForm.tsx)) ya apuntan a `/privacidad`; solo se valida que dejen de dar 404.

## Capabilities

### New Capabilities
- `aviso-privacidad`: página estática `/privacidad` como única fuente de verdad del aviso de privacidad del proyecto, servida a los formularios de contacto y (a futuro) de voluntariado vía enlace. Cubre contenido legal mínimo (responsable, datos, finalidad, resguardo, derechos ARCO, no transferencia, vigencia) y su renderizado desde `content/`.

### Modified Capabilities
<!-- Ninguna. No cambia comportamiento del backend; el API no se toca. -->

## Impact

- **Sub-dominios afectados:** `sitio` (chirimoyo.org). No toca `comunidad`, `aves`, `voluntarios` (Fase 4 reusará vía enlace), `api` ni `foundation`.
- **Código:** nuevo `apps/sitio/app/privacidad/page.tsx`, nueva `getAviso()` en `apps/sitio/lib/landing.ts`, nuevo `content/landing/privacidad.md`.
- **Dependencias:** ninguna nueva (opción A confirmada en explore: parser de secciones, sin librería de markdown).
- **API / Firestore:** sin cambios. El aviso solo **describe** el manejo de PII ya implementado (no se loguea, acceso restringido), no lo modifica.
- **No-goals:** no se añade markdown inline (links/listas tipográficas) ni componente embebible reutilizable; no se redacta el aviso de voluntariado de Fase 4 (solo se deja la página lista para enlazarla); no se da el texto por jurídicamente definitivo.
- **ADR:** no se requiere uno nuevo — la página implementa lo que el ADR-0012 ya decidió; no rompe ninguna convención.
