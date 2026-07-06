## Why

La **épica #23 (donaciones informativas)** ya está entregada en su mayor parte: existe `content/landing/donaciones.json` (transferencia SPEI/CLABE, Spin by OXXO, en especie), el componente `components/landing/Donaciones.tsx` (informativo, sin pasarela — ADR-0007), la spec (`landing-sitio` → "Sección de donaciones informativas") y el ADR-0007. Todo eso se **renderiza en el landing** (`app/page.tsx`).

Falta un hueco: **`/voluntarios` no muestra donaciones**. El ADR-0007 enmarca la invitación a apoyar económicamente/en especie precisamente en el contexto de *voluntarios* ("voluntarios.chirimoyo.org invita a apoyar…"), pero hoy quien entra directo a `/voluntarios` (jornadas + inscripción) no ve ninguna vía para donar. Este cambio cierra la épica surfaciendo las donaciones también en `/voluntarios`, **reutilizando el componente existente** (sin UI nueva, sin dependencias, sin pasarela).

## What Changes

- **Renderizar la sección de donaciones en `/voluntarios`** (`apps/sitio/app/voluntarios/page.tsx`) reutilizando el componente `Donaciones` y el loader `getDonaciones()`, tras el formulario de inscripción — completando el flujo *jornadas → inscríbete → apóyanos también*.
- **Sin cambios** en el componente `Donaciones.tsx`, en `donaciones.json`, ni en el landing (que ya lo muestra).
- **Reconocer** que la funcionalidad base de #23 ya existía; este cambio es el puente que faltaba desde `/voluntarios`.

## No-goals

- **No** se agrega QR real de Spin (opción B descartada: requeriría un asset PNG o una dependencia nueva con ADR).
- **No** se introduce pasarela de pago ni registro de donaciones (ADR-0007 se mantiene: informativa).
- **No** se toca `donaciones.json`, `Donaciones.tsx` ni la sección de donaciones del landing.
- **No** se añade dependencia ni v0.dev.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `inscripcion-voluntarios-frontend`: la página `/voluntarios` SHALL incluir además una **sección de donaciones informativas** (derivada de `donaciones.json`, ADR-0007), reutilizando el componente existente.

## Impact

- **Sub-dominio afectado:** sitio (`apps/sitio`).
- **Código (`apps/sitio`):** `app/voluntarios/page.tsx` (importar `Donaciones` + `getDonaciones`, renderizar la sección).
- **Contenido:** ninguno (reutiliza `content/landing/donaciones.json`).
- **Dependencias:** ninguna.
- **Sin** cambios en API/esquema → **no requiere ADR** (refuerza ADR-0007).
