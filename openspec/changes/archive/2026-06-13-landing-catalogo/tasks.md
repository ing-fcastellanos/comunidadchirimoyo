## 1. Mover el buscador a /busqueda

- [x] 1.1 Crear `apps/catalogo/app/busqueda/page.tsx` con el contenido actual de `app/page.tsx` (carga de fichas + encabezado "Guía de Aves" + conteo + `<BuscadorAves>`), sin cambios de lógica.
- [x] 1.2 Verificar en build/dev que el buscador funciona en `/busqueda` (filtros, vistas, orden, enlaces "Ver ficha" a `/aves/<slug>`).

## 2. Activos del landing

- [x] 2.1 Usar la imagen del avetoro **desde el bucket GCP** (ADR-0016): componer la URL con `fotoUrl("botaurus-lentiginosus", "DSCN1632.webp", "web")`. No copiar PNG local ni añadir activos a `public/`.
- [x] 2.2 Confirmar que la primitiva `@/components/ui/Icon` expone los nombres lucide usados (`map-pin`, `camera`, `feather`, `leaf`, `book-open-check`, `bird`, `search`, `arrow-right`); ampliar su mapa si falta alguno.
- [x] 2.3 Definir una constante para la URL del sitio de comunidad (CTA "Conocer la comunidad" / "Conoce la lucha"); confirmar destino (`chirimoyo.org` vs `comunidad.chirimoyo.org`).

## 3. Componentes del inicio (components/home/)

- [x] 3.1 Portar `Hero.tsx` (eyebrow, H1, sub, CTA primario → `/busqueda`, CTA secundario → comunidad, imagen avetoro con alt), Server Component, tokens del sistema, `next/link`, clases producción (`font-bold`/`font-semibold`).
- [x] 3.2 Portar `QueHayAqui.tsx` con 3 tarjetas; el conteo de aves llega por prop (no hardcodeado).
- [x] 3.3 Portar `ElHumedal.tsx` (banda mint-wash, 2 frases, enlace a comunidad).
- [x] 3.4 Portar `CierreCTA.tsx` (banda pine-deep, botón "Ir al catálogo" → `/busqueda`).

## 4. Landing en la raíz

- [x] 4.1 Reescribir `apps/catalogo/app/page.tsx` como async Server Component que llama `getAllFichas()`, calcula el conteo de aves y ensambla `Hero` + `QueHayAqui` (con el conteo) + `ElHumedal` + `CierreCTA`.
- [x] 4.2 Asegurar jerarquía accesible: un único `<h1>` (en Hero) y estados `focus-visible` en los CTAs.

## 5. Header

- [x] 5.1 Actualizar `apps/catalogo/components/layout/Header.tsx` con el enlace "Buscar especies" (píldora en escritorio, botón de icono en móvil) a `/busqueda` vía `next/link`; logo enlaza a `/`.

## 6. Verificación

- [x] 6.1 `npm run build` en `apps/catalogo` genera `out/index.html` (landing) y `out/busqueda/index.html` (buscador) sin errores; `npm run typecheck` y `npm run lint` pasan.
- [x] 6.2 Verificar en preview: landing en `/` comprensible en 10s, responsive a ~380px, CTAs navegan a `/busqueda` y a comunidad; conteo refleja el contenido real; sin errores en consola.
- [x] 6.3 Eliminar `tmp_design/` del repositorio (carpeta temporal del bundle de diseño).
