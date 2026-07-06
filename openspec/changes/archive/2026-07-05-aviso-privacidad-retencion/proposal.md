## Why

El aviso de privacidad ya existe y está bien (ruta `/privacidad`, loader, banner de borrador, enlace en el Footer, contenido que cubre responsable, datos, fines, resguardo, ARCO, no-transferencia y vigencia — todo construido en #51). Pero le falta **un tema que pide #44 y exige ADR-0012/LFPDPPP**: la **retención** (cuánto tiempo se conservan los datos). Además, un comentario en el Footer quedó **obsoleto** afirmando que `/privacidad` no existe y cae en 404. Este cambio cierra ambos huecos. (El estado `borrador` se mantiene: publicarlo es una decisión de revisión legal del usuario, fuera de alcance.)

## What Changes

- **Añadir la sección de retención** a `content/landing/privacidad.md`: "## Cuánto tiempo conservamos tus datos" — los datos se conservan **solo mientras son útiles** para responder o organizar las jornadas, y las inscripciones se **borran pasado un umbral** (≈12 meses tras la jornada), coherente con ADR-0012 y el script de retención del API (#21).
- **Limpiar el comentario obsoleto** en `apps/sitio/components/layout/Footer.tsx` que dice que `/privacidad` aún no existe y cae en 404 (ya existe y se sirve).
- **Mantener `estado: borrador`** (el banner sigue; publicar es decisión legal del usuario).

## No-goals

- **No** se publica el aviso (no se quita `estado: borrador`): requiere revisión legal del organizador.
- **No** se toca la página/loader/ruta `/privacidad` ni el banner (ya funcionan, #51).
- **No** se reescriben las demás secciones del aviso (ya cubren lo necesario).
- **No** se añade dependencia ni v0.dev.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `aviso-privacidad`: el "contenido legal mínimo" SHALL incluir además la **política de retención** (cuánto se conservan los datos), coherente con ADR-0012.

## Impact

- **Sub-dominio afectado:** sitio (`apps/sitio`).
- **Contenido:** `content/landing/privacidad.md` (+ sección de retención).
- **Código (`apps/sitio`):** `components/layout/Footer.tsx` (limpiar comentario obsoleto).
- **Dependencias:** ninguna.
- **Sin** cambios en API/esquema → **no requiere ADR** (refuerza ADR-0012).
- **Nota:** el issue cita ADR-0010/Umami para la analítica, pero la analítica real es **ADR-0020 (Cloudflare)**, ya reflejada correctamente en el texto del aviso ("analítica privada y anónima, sin cookies de rastreo").
