## Context

`/privacidad` ya existe (`app/privacidad/page.tsx`) y renderiza `content/landing/privacidad.md` vía `getAviso()` + el parser de secciones `## H2`; muestra un banner cuando `estado: borrador`. El Footer enlaza `/privacidad` en `LEGALES`, pero conserva un comentario que afirma que la página no existe (`#56`, "cae en 404"), ahora falso. El aviso cubre todos los temas LFPDPPP salvo **retención**. ADR-0012 exige definir retención; el API (#21) ya tiene un script de borrado (~12 meses). Las inscripciones (PII) se persisten en Firestore (#21).

## Goals / Non-Goals

**Goals:**
- Completar el aviso con la política de retención, coherente con ADR-0012 y el manejo real.
- Eliminar el comentario obsoleto del Footer.

**Non-Goals:**
- Publicar el aviso (quitar `borrador`); tocar la página/loader/banner; reescribir otras secciones.

## Decisions

**D1 — Sección de retención en el markdown.** Se añade una sección `## Cuánto tiempo conservamos tus datos` a `privacidad.md`, ubicada de forma natural (tras "Cómo los resguardamos" y antes de "Tus derechos (ARCO)"). Texto: los datos se conservan **solo mientras son útiles** para responder o organizar las jornadas; las inscripciones se **borran pasado un tiempo razonable** (≈12 meses tras la jornada), y se pueden borrar antes a solicitud (enlaza con ARCO). Coherente con ADR-0012 y el script de retención del API. Lenguaje comprensible, sin jerga.

**D2 — Footer: limpiar el comentario.** En `Footer.tsx`, el comentario sobre `LEGALES` que dice que `/privacidad` no existe / cae en 404 (#56) se reemplaza por uno correcto (la página existe; el aviso está en borrador hasta revisión legal). No cambia el enlace ni el render.

**D3 — Mantener `estado: borrador`.** El banner sigue mostrándose; publicar es decisión legal del usuario. La fecha `actualizado` del frontmatter se actualiza a la de este cambio (refleja la edición).

**D4 — Sin tocar el render.** El parser de secciones ya maneja una sección nueva automáticamente; no hay cambios de componente/loader.

## Risks / Trade-offs

- **Cifra de retención (≈12 meses)** → debe coincidir con el script del API (#21 usa 12 meses por defecto). Se usa lenguaje aproximado ("alrededor de un año") para no atarse a un número exacto que el organizador pueda ajustar. Aceptado.
- **Sigue en borrador** → el aviso no es definitivo hasta revisión legal; el banner lo comunica. Intencional.

## Migration Plan

Edición de un markdown + un comentario. Sin migración, sin deploy especial (la página ya existe; el contenido se re-renderiza). Rollback = revertir el commit.

## Open Questions

- **Umbral exacto de retención** — se expresa de forma aproximada ("alrededor de un año tras la jornada"); el organizador puede precisarlo al revisar legalmente y alinear con el script del API.
