## Why

`/comunidad` ya reúne "El caso", "Qué hacemos", "Línea de tiempo" y noticias (#19a), pero falta lo único genuinamente nuevo que pedía la épica #19: **Misión y Visión** — quiénes somos y hacia dónde vamos. Este cambio (#19b) añade esa sección. El texto institucional definitivo lo escribirá la comunidad; por ahora se coloca **contenido placeholder** claramente marcado, para dejar la sección montada y lista para llenarse (igual que `logros.json`).

## What Changes

- **Nuevo contenido** `content/landing/mision-vision.json` (curado, **PLACEHOLDER**): `{ mision: { titulo, texto }, vision: { titulo, texto }, valores?: [{ titulo, descripcion, icono }] }`, con textos de relleno marcados como pendientes de redacción.
- **Loader** `getMisionVision()` en `lib/landing.ts` + tipos exportados.
- **Componente** `components/comunidad/MisionVision.tsx` (Server Component): renderiza Misión y Visión (y los valores, si hay) con `Section`/`SectionTitle`/`Icon` y los tokens.
- **Insertar la sección en `/comunidad`** entre **"El caso"** y **"Qué hacemos"** (el slot reservado en #19a).
- **Documentar el esquema** de `mision-vision.json` en el README de contenido.

## No-goals

- **No** se redacta el texto institucional real (lo aporta la comunidad); aquí va placeholder.
- **No** se toca el resto de `/comunidad` (caso, qué hacemos, línea de tiempo, noticias) ni el landing.
- **No** se mueve el contenido a `content/comunidad/` (sigue el patrón de `content/landing/`).
- **No** se añade dependencia ni v0.dev.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `pagina-comunidad`: se añade el requisito de la sección **Misión y Visión** en `/comunidad`, derivada de `content/`.

## Impact

- **Sub-dominio afectado:** comunidad (`apps/sitio`).
- **Código (`apps/sitio`):** `lib/landing.ts` (loader + tipos), `components/comunidad/MisionVision.tsx`, `app/comunidad/page.tsx` (insertar la sección).
- **Contenido:** nuevo `content/landing/mision-vision.json` (placeholder); doc en `content/README.md` o `content/landing/README.md`.
- **Dependencias:** ninguna.
- **Sin** cambios en API, esquema de fauna, ni convenciones → **no requiere ADR**.
