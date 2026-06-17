## Context

`apps/sitio` y `apps/catalogo` son dos apps Next 15 (App Router) independientes que comparten identidad visual: tokens **idénticos** (`app/tokens.css`), las mismas fuentes (`serif` = Cormorant Garamond, `sans` = Source Sans 3) y el mismo patrón de `layout.tsx` (`<Header/> <main/> <Footer/>`). Ninguna define hoy `not-found.tsx` ni `error.tsx`, así que Next sirve sus pantallas por defecto.

El diseño ya está resuelto en el handoff v0.dev `PantallasError.jsx`, que exporta dos bloques de contenido (`NotFound` y `ErrorScreen({ reset })`) pensados para vivir **dentro** del app shell existente: fondo transparente, centrado vertical, `min-h-[60vh]`, sin header/nav/footer propios. La ilustración es SVG inline (juncos del humedal + ave), sin imágenes externas.

Restricciones del repo relevantes: sin tooling de monorepo ni paquete de UI compartido (ADR-0001); multi-subdominio servido por una sola app sin middleware aún (ADR-0008); colores solo vía tokens (CLAUDE.md); español, estructura lista para i18n (ADR-0011).

## Goals / Non-Goals

**Goals:**
- 404 y error con identidad de marca, navegables y consistentes, en sitio y catálogo.
- Un único diseño genérico, portado fielmente del handoff v0.dev.
- Accesible (un solo `<h1>`, foco visible, contraste AA) y responsive hasta 360px.
- Coherencia con tokens y con Header/Footer heredados del layout.

**Non-Goals:**
- Adaptar el 404 por subdominio (requeriría `headers()` + middleware → otro change/ADR).
- `global-error.tsx` (errores del layout raíz).
- Paquete de UI compartido entre apps.
- Tocar API, contenido o dependencias.

## Decisions

**1. Genérico único = componente duplicado por app (no paquete compartido).**
Cada app recibe sus propios `app/not-found.tsx`, `app/error.tsx` y un componente interno con la ilustración + bloques (p. ej. `components/error/PantallasError.tsx`). Alternativa descartada: extraer a un paquete `packages/ui` → introduciría workspaces, prohibido sin ADR (ADR-0001). La duplicación es intencional y barata; el único delta entre apps son los enlaces (`lib/links.ts`) y, opcionalmente, el copy del 404.

**2. Reparto Server/Client según contrato de Next 15.**
`not-found.tsx` → Server Component (sin estado). `error.tsx` → `"use client"` obligatorio, recibe `{ error, reset }` y cablea el botón "Intentar de nuevo" a `reset()`. La ilustración SVG y el botón pill se factorizan a un módulo compartido por ambas pantallas dentro de la app.

**3. Enlaces genéricos al ecosistema vía `lib/links.ts`.**
404 ofrece: inicio (`/`), guía de aves (`AVES_URL`), comunidad (`COMUNIDAD_URL`). En catálogo, "inicio" es la home del catálogo y se añade el enlace a la comunidad/landing; el prototipo hardcodea URLs absolutas (`https://aves.chirimoyo.org`, `https://comunidad.chirimoyo.org`) → se sustituyen por las constantes de `lib/links.ts` de cada app (en sitio puede faltar `AVES_URL`/`COMUNIDAD_URL`; se reutilizan las existentes, que ya están definidas). Sin lectura de host → la página puede permanecer estática.

**4. Adaptar el prototipo a las convenciones, no copiarlo literal.**
- Pesos de fuente: `font-600`/`font-700` del prototipo → `font-semibold`/`font-bold` (Tailwind estándar).
- Colores hardcodeados (`bg-[#15824c]`, `text-[#0c5a36]`, `#b5543a`…) → clases de token (`bg-forest`, `text-forest-deep`, etc.) cuando exista el token; el acento terracota del error (`#b5543a`, `#f6e1da`, `#8f3c25`) **no** está en `tokens.css` → decisión: añadir tokens `--color-terra*` (ya existe `--color-terra: #b5543a` en catálogo; replicar en sitio) o usar valores arbitrarios acotados al componente de error. Preferencia: usar el token `terra` existente y añadir los que falten, manteniendo la regla "sin colores fuera de tokens".
- `text-pretty`, rings de foco y estructura responsive se conservan tal cual.

**5. Tipado e i18n.**
Componentes en TypeScript; strings en español como constantes locales del componente (no incrustadas de forma que impida i18n futuro, ADR-0011). El copy del 404 puede diferir levemente en catálogo ("Esta ave no está en la guía") — se decide en apply; por defecto se reutiliza el copy del humedal para mantener "genérico único".

## Risks / Trade-offs

- **Duplicación entre apps** → si el diseño cambia, hay que tocar dos sitios. Mitigación: el componente es pequeño y autocontenido; aceptado por ADR-0001.
- **Tokens de terracota ausentes en `apps/sitio`** → riesgo de hardcodear color fuera de `tokens.css`. Mitigación: añadir los tokens `terra` faltantes a `apps/sitio/app/tokens.css` antes de portar.
- **`error.tsx` no captura errores del layout** (Header/Footer) → un fallo ahí mostraría la pantalla por defecto. Mitigación: aceptado (No-goal); el layout es estático y de bajo riesgo.
- **Enlaces absolutos cruzados** (aves↔comunidad) en navegación local → correcto por diseño multi-subdominio (ADR-0008), pero verificar que `lib/links.ts` de cada app expone las constantes necesarias; si falta alguna, añadirla.

## Migration Plan

No aplica migración de datos. Despliegue normal de cada app (build Next → Cloud Run). Rollback = revertir el PR; al no haber `not-found.tsx`/`error.tsx` previos, Next vuelve a sus pantallas por defecto sin efectos colaterales.

## Open Questions

- ¿El copy del 404 en catálogo se diferencia ("Esta ave no está en la guía") o se mantiene idéntico al de sitio? (Por defecto: idéntico.)
- ¿Se aprovecha para añadir `global-error.tsx` mínimo como red de seguridad? (Por defecto: no, fuera de alcance.)
