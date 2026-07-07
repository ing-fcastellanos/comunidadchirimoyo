## Why

Ambas apps (`apps/sitio`, `apps/catalogo`) llegaron al ~90% de WCAG 2.1 AA "por accidente" —
los handoffs v0.dev ya traían focus trap, `aria-*`, gestión de foco y `prefers-reduced-motion`
en el hero. Pero quedan huecos concretos y medibles que impiden afirmar conformidad AA: no
existe skip-link (Nivel A, confirmado: 0 ocurrencias en el repo), y hay usos de `text-forest`
como texto pequeño sobre `paper` que miden **4.38:1**, por debajo del mínimo 4.5:1. Esta es la
parte B diferida de la épica #25; cerrarla nos deja declarar AA con evidencia, no con fe.

## What Changes

- **Skip-link "Saltar al contenido"** en el shell de ambas apps, con `id="contenido"` en el
  `<main>` como destino. Visible solo al recibir foco por teclado (patrón sr-only + focus).
- **Contraste AA (1.4.3):** reasignar los usos de `text-forest` (y variantes de acento) que
  sean **texto pequeño sobre paper** a `forest-deep` (mide 7.48:1), guiado por grep. No se
  modifica el token canónico `--color-forest` (pasa 4.85:1 sobre `paper-card`/blanco, y se usa
  así en botones). Es un cambio de **sitio de uso**, no de sistema de diseño.
- **`prefers-reduced-motion`:** respetarlo en el spinner de envío de los forms
  (`InscripcionForm`, `ContactoForm`) y neutralizar el `scroll-behavior: smooth` global.
- **Verificación de jerarquía de headings (1.3.1):** barrido de páginas para garantizar un
  único `<h1>` y sin saltos de nivel; corregir solo lo que falle.
- **Verificación de etiquetado del buscador (`/busqueda`, catálogo):** el input de texto debe
  tener label programático; corregir si falta.

## Capabilities

### New Capabilities
- `accesibilidad`: requisitos transversales de accesibilidad WCAG 2.1 AA aplicables al shell y
  a los componentes compartidos de ambas apps front (skip-link/bypass blocks, contraste mínimo
  de texto, respeto a `prefers-reduced-motion`, jerarquía de encabezados, etiquetado de
  controles de formulario/búsqueda).

### Modified Capabilities
<!-- Ninguna: el contraste se corrige en el sitio de uso, no en los tokens (design-system).
     La conformidad de forms/nav ya vive implícita en sus specs; aquí se consolida en la nueva
     capability transversal sin alterar los requisitos de comportamiento existentes. -->

## Impact

- **Sub-dominios afectados:** `sitio`, `catálogo` (foundation transversal). No toca `api` ni PII.
- **Código:**
  - `apps/sitio/app/layout.tsx` y `apps/catalogo/app/layout.tsx` — skip-link + `id="contenido"`.
  - Componentes con `text-forest`/acentos como texto chico sobre paper (grep-guiado): p. ej.
    labels en mayúsculas de noticias, `VecinoLink`, `MobileNav` ("Ecosistema").
  - `apps/sitio/components/**/{InscripcionForm,ContactoForm}.tsx` — spinner con reduced-motion.
  - `apps/*/app/tokens.css` (regla base `scroll-behavior`) — envolver en media query.
- **Sin ADR:** no rompe convenciones documentadas; no cambia stack ni tokens canónicos.
- **Sin dependencias nuevas:** todo con Tailwind + CSS; sin librerías de a11y.

## No-goals

- No es una auditoría exhaustiva página-por-página con checklist AAA; alcance = huecos medidos.
- No se altera el token `--color-forest` ni la paleta base del handoff en `design-system`. (Excepción
  aprobada durante la implementación: se **agrega** un token derivado de AA `--color-ochre-deep` —espejo
  del `terra-deep` existente— para el texto del badge "Próximamente", que medía 2.53:1. No modifica
  ningún color base ni tiene otros consumidores.)
- No se agrega tooling de tests de a11y (axe/jest-axe); verificación manual + grep, coherente
  con "sin framework de tests" del proyecto.
- No incluye `apps/catalogo` PDFs de impresión ni el `services/api`.
