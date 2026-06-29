## Context

El landing (`app/page.tsx`) compone, en orden: `Hero · ElCaso · QueHacemos · LineaTiempo · GaleriaTeaser · Donaciones · AliadosPreview · Linktree · CierreCTA`, cargando datos con `getLucha/getActividades/getLogros/...` (Promise.all). `ElCaso` recibe `secciones`/`fotoUrl`/`fotoAlt` de `lucha`; `QueHacemos` recibe `data={actividades}`; `LineaTiempo` recibe `data={logros}`. `/comunidad` (`app/comunidad/page.tsx`) es async y ya monta el intro + el bloque "Últimas noticias" (#73). Los componentes viven en `components/landing/`. No hay librería compartida (ADR-0001), pero importar entre carpetas del mismo app es libre.

## Goals / Non-Goals

**Goals:**
- `/comunidad` muestra El caso + Qué hacemos + Línea de tiempo + Noticias.
- El landing pierde Qué hacemos/Línea de tiempo y enlaza a `/comunidad`.
- Reuso total; cero contenido/dependencias nuevas.

**Non-Goals:**
- Misión/visión (#19b); tocar noticias; mover el contenido a `content/comunidad/`; rediseñar.

## Decisions

**D1 — Mover dos secciones, duplicar una.** `QueHacemos` y `LineaTiempo` salen del landing y entran a `/comunidad`. `ElCaso` se renderiza en **ambas** (mismo componente, mismos datos de `lucha`). El landing conserva el resto.

**D2 — Componentes: mover los que salen, dejar el compartido.** `git mv components/landing/QueHacemos.tsx` y `LineaTiempo.tsx` → `components/comunidad/`. Actualizar sus imports en `/comunidad`. `ElCaso.tsx` se **queda** en `components/landing/`; tanto `app/page.tsx` como `app/comunidad/page.tsx` lo importan desde ahí. (Alternativa descartada: mover ElCaso a un `components/shared/` — no hay convención de shared y lo usa el landing principalmente.)

**D3 — `/comunidad` compone con los loaders existentes.** La página carga `getLucha`, `getActividades`, `getLogros` (y ya tiene `getAllNoticias`). Orden de render: `intro → ElCaso → QueHacemos → LineaTiempo → Últimas noticias`. (El hueco de Misión/Visión —entre ElCaso y QueHacemos— lo llenará #19b.) `ElCaso` necesita `mediaUrl(lucha.casoFoto)` como en el landing.

**D4 — Teaser en el landing.** Donde estaban `QueHacemos`/`LineaTiempo` (entre `ElCaso` y `GaleriaTeaser`), se inserta un enlace/banda discreta: "Conoce a la comunidad: qué hacemos, nuestra historia y logros → /comunidad". Reusa primitivos/tokens; no es una sección nueva pesada, solo un puente.

**D5 — Limpiar el landing.** Quitar de `app/page.tsx` los imports de `QueHacemos`/`LineaTiempo` y las llamadas `getActividades()`/`getLogros()` del `Promise.all` (ya no se usan ahí). El JSON-LD y el resto quedan igual.

**D6 — Sin v0.dev.** Solo reubicación de componentes existentes; el teaser usa el lenguaje visual existente.

## Risks / Trade-offs

- **Duplicación de "El caso"** en `/` y `/comunidad` → intencional (decisión del usuario); mismo componente y datos, sin divergencia. Riesgo SEO de contenido duplicado: bajo (son dos rutas del mismo sitio con `canonical` propio).
- **Landing más corto** → mitigado por el teaser que mantiene el hilo y dirige a `/comunidad`.
- **Imports cruzados** (ElCaso desde `landing/` usado por comunidad) → aceptable; si en el futuro hay más compartidos, se evalúa un `components/shared/`.
- **`git mv`** preserva historia; verificar que no queden imports colgando a `components/landing/QueHacemos|LineaTiempo`.

## Migration Plan

Mover 2 componentes + editar 2 páginas. Sin migración de datos. Build estático/standalone normal. Rollback = revertir el commit (las secciones vuelven al landing).

## Open Questions

- Ninguna que bloquee. La forma exacta del teaser (banda vs enlace simple) se decide en la implementación; por defecto, una banda discreta con enlace.
