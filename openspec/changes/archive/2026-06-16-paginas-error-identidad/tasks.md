## 1. Preparación y tokens

- [x] 1.1 Revisar el handoff v0.dev `PantallasError.jsx` y confirmar el mapeo de clases del prototipo a las convenciones del repo (pesos `font-600/700` → `font-semibold/bold`; colores hardcodeados → tokens)
- [x] 1.2 Confirmar que `--color-terra` (#b5543a) existe en `apps/sitio` y `apps/catalogo` (ya presente); definir cómo representar los tonos terracota claros del badge de error (`#f6e1da` fondo, `#8f3c25` texto) — añadir tokens `--color-terra-wash`/`--color-terra-deep` a ambos `tokens.css` o acotarlos al componente

## 2. apps/sitio — páginas de error

- [x] 2.1 Crear `apps/sitio/components/error/PantallasError.tsx` con la ilustración SVG del humedal (variantes "vuela"/"enredada"), el botón pill primario y el enlace de texto secundario, tipados en TypeScript y con strings en español
- [x] 2.2 Crear `apps/sitio/app/not-found.tsx` (Server Component): bloque 404 con titular "Esta página voló del humedal", botón "Volver al inicio" (`/`) y enlaces secundarios a `AVES_URL` y `COMUNIDAD_URL` desde `lib/links.ts`
- [x] 2.3 Crear `apps/sitio/app/error.tsx` (`"use client"`, props `{ error, reset }`): bloque de error con titular "Algo salió mal", botón "Intentar de nuevo" → `reset()` y enlace "Volver al inicio"

## 3. apps/catalogo — páginas de error

- [x] 3.1 Portar el mismo componente a `apps/catalogo/components/error/PantallasError.tsx` (diseño idéntico; sin paquete compartido, duplicación intencional por ADR-0001)
- [x] 3.2 Crear `apps/catalogo/app/not-found.tsx`: botón "Volver al inicio" (`/` = home del catálogo) y enlace secundario a `COMUNIDAD_URL` (única constante disponible en su `lib/links.ts`); decidir copy del 404 (por defecto idéntico al de sitio)
- [x] 3.3 Crear `apps/catalogo/app/error.tsx` (`"use client"`) análogo al de sitio

## 4. Accesibilidad, responsividad y coherencia

- [x] 4.1 Verificar un único `<h1>` por pantalla, foco visible (`focus-visible:ring-4`) y contraste AA en ambas apps
- [x] 4.2 Verificar responsividad hasta 360px: la ilustración SVG escala sin desbordar y el contenido queda centrado (`min-h-[60vh]`)
- [x] 4.3 Confirmar que el Header/Footer se heredan del `layout.tsx` y que las páginas no redefinen barra ni pie

## 5. Verificación

- [x] 5.1 Levantar cada app en local y comprobar el 404 visitando una URL inexistente
- [x] 5.2 Forzar un error de render para comprobar `error.tsx` y que "Intentar de nuevo" ejecuta `reset()`
- [x] 5.3 `npm run build` (lint + typecheck) en `apps/sitio` y `apps/catalogo` sin errores
