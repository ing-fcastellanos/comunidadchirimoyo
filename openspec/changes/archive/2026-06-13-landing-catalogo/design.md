## Context

El catálogo (`apps/catalogo` → aves.chirimoyo.org) es una app Next.js 15 con `output: "export"` (100% estática, búsqueda en cliente, ADR-0005). Hoy `app/page.tsx` es el buscador (`BuscadorAves`). El diseño v0.dev del landing ya está entregado y extraído en `tmp_design/guia-aves-chirimoyo/project/` con cuatro componentes en `components/home/` (`Hero`, `QueHayAqui`, `ElHumedal`, `CierreCTA`), un `inicio.jsx` que los ensambla, y un `Header.jsx` actualizado con enlace al buscador. El diseño reutiliza los tokens, `Section`, `Icon` y fuentes ya presentes en la app.

## Goals / Non-Goals

**Goals:**
- Convertir `/` en el landing y mover el buscador a `/busqueda` sin tocar su lógica.
- Portar los componentes v0 a TSX idiomático del proyecto (Server Components, tokens, sin clases prototipo como `font-600`).
- Derivar el conteo de aves de `getAllFichas()` en build.
- Mantener el export 100% estático y sin llamadas a API.

**Non-Goals:**
- Rediseñar el buscador o sus filtros.
- Redirects de `/` → `/busqueda`.
- Desarrollar el contenido de comunidad.chirimoyo.org.

## Decisions

**1. Mover el buscador creando `app/busqueda/page.tsx` y vaciando `app/page.tsx`.**
El contenido actual de `app/page.tsx` (carga de fichas + encabezado "Guía de Aves" + `<BuscadorAves>`) se traslada tal cual a `app/busqueda/page.tsx`. `app/page.tsx` se reescribe como el landing. Alternativa descartada: route group o renombrar — innecesario, App Router resuelve `/busqueda` con la carpeta. El export genera `out/busqueda/index.html` automáticamente.

**2. Nuevos componentes en `apps/catalogo/components/home/`.**
Se crean `Hero.tsx`, `QueHayAqui.tsx`, `ElHumedal.tsx`, `CierreCTA.tsx` como Server Components, portados 1:1 del diseño v0. Conversión de prototipo → producción:
- `font-700`/`font-600` → `font-bold`/`font-semibold`.
- `window.Icon`/`window.Section` → imports desde `@/components/ui/Icon` y `@/components/ui/Section`.
- Iconos lucide vía la primitiva `Icon` existente (verificar que los nombres usados —`map-pin`, `camera`, `feather`, `leaf`, `book-open-check`, `bird`, `search`, `arrow-right`— estén disponibles; si `Icon` es un wrapper acotado, extender su mapa).
- Enlaces: usar `next/link`. CTA primario y cierre → `/busqueda`. CTA comunidad → URL del sitio de comunidad (constante).

**3. Conteo dinámico.**
El landing (`app/page.tsx`) es async Server Component: llama `getAllFichas()`, filtra por grupo aves para el conteo, y pasa el número a `QueHayAqui` por props. Nada hardcodeado. Para "anfibios y reptiles" y "fuentes" el texto es cualitativo (sin conteo) por ahora.

**4. Header con enlace al buscador.**
Se actualiza `components/layout/Header.tsx` para añadir el enlace "Buscar especies" (píldora `mint-wash` en escritorio `sm:inline-flex`, botón de icono compacto en móvil `sm:hidden`), portado del `Header.jsx` del diseño, usando `next/link` a `/busqueda` y el logo enlazando a `/`.

**5. Imagen del hero.**
`avetoro.png` (~3.4MB en el bundle) se copia a `apps/catalogo/public/` optimizada (objetivo: comprimir/redimensionar a un peso razonable para web; el original es demasiado pesado). Se sirve con `<img>` (coherente con el resto de la app en export estático) o `next/image` si ya se usa en la app. Decisión de optimización concreta queda como tarea.

## Risks / Trade-offs

- **Peso de la imagen del hero (3.4MB)** → Optimizar antes de commitear (redimensionar a ancho de display ~800–1000px y recomprimir); validar que el LCP del landing sea aceptable.
- **Cobertura de iconos en la primitiva `Icon`** → Si `Icon` no expone alguno de los nombres lucide usados, hay que ampliarla; verificar en apply para evitar romper el build.
- **Enlaces de comunidad** → El diseño v0 apunta a `https://chirimoyo.org`; la propuesta menciona `comunidad.chirimoyo.org`. Se centraliza en una constante para ajustar la URL final en un solo lugar.
- **Specs `out/index.html`** → La spec de búsqueda ahora espera `out/busqueda/index.html`; cualquier prueba o doc que asuma el buscador en la raíz debe actualizarse (no hay tests automatizados aún, riesgo bajo).

## Open Questions

- ¿El CTA de comunidad apunta a `chirimoyo.org` (raíz) o a `comunidad.chirimoyo.org`? Se implementa como constante configurable; confirmar destino final en apply.
- ¿Conviene `next/image` para el hero o mantener `<img>` por el export estático? Resolver según lo que ya use la app para imágenes de fichas.
