## Context

La sección de donaciones informativas ya existe y funciona en el landing: `getDonaciones()` (en `lib/landing.ts`) lee `content/landing/donaciones.json`, y el Server Component `components/landing/Donaciones.tsx` recibe `data` y pinta las tarjetas (transferencia con CLABE/beneficiario, Spin by OXXO como enlace, en especie como `mailto:`), todo informativo y sin pasarela (ADR-0007). El landing (`app/page.tsx`) ya lo renderiza. La página `/voluntarios` (`app/voluntarios/page.tsx`) hoy compone: intro + `ProximasJornadas` + `InscripcionForm`, con `revalidate = 86400` (ISR). No muestra donaciones, aunque ADR-0007 enmarca el apoyo económico en el contexto de voluntarios.

## Goals / Non-Goals

**Goals:**
- Mostrar la sección de donaciones informativas también en `/voluntarios`, reutilizando el componente existente.
- Cerrar la épica #23 sin UI nueva, sin dependencias, sin tocar el contenido ni el ADR.

**Non-Goals:**
- QR real de Spin; pasarela o registro de donaciones; modificar `Donaciones.tsx`, `donaciones.json` o el landing.

## Decisions

**D1 — Reutilizar el componente, no duplicar UI.** En `app/voluntarios/page.tsx` se importa `Donaciones` (`@/components/landing/Donaciones`) y `getDonaciones` (`@/lib/landing`), se añade `getDonaciones()` al `Promise.all` existente, y se renderiza `<Donaciones data={donaciones} />` como última sección, tras el formulario de inscripción. Es el mismo componente data-driven que usa el landing; cero UI nueva.

**D2 — Ubicación: al final, tras la inscripción.** El orden queda *intro → próximas jornadas → inscripción → donaciones*, que lee como un cierre natural ("súmate a las jornadas… inscríbete… y si además quieres apoyar, aquí van las formas de donar"). No se antepone a la inscripción para no competir con el CTA principal de la página (sumar voluntarios).

**D3 — `id="donaciones"` duplicado entre páginas es inofensivo.** El componente usa `<Section id="donaciones">`. Landing y `/voluntarios` son documentos distintos, así que no hay colisión de `id` en una misma página. Además habilita enlaces con ancla (`/voluntarios#donaciones`, `/#donaciones`) si se quisieran a futuro.

**D4 — Sin tocar ISR.** `revalidate = 86400` ya cubre la página; `donaciones.json` es contenido estático leído en build/revalidación, coherente con las jornadas. No hace falta cambiar la estrategia de render.

## Risks / Trade-offs

- **Donaciones aparece en dos páginas (landing y /voluntarios).** Es intencional: el mismo componente data-driven, una sola fuente (`donaciones.json`). Editar el JSON actualiza ambas. No hay duplicación de contenido ni de UI, solo dos puntos de entrada. Aceptado.

## Migration Plan

Cambio de una sola página (composición). Sin migración de datos, sin deploy especial; la página se re-renderiza con la sección añadida. Rollback = revertir el commit.

## Open Questions

- Ninguna. (El QR real de Spin queda fuera de alcance; si se retoma, sería un cambio aparte con su asset o ADR de dependencia.)
