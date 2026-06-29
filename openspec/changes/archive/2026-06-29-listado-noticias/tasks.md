# Tasks — listado-noticias

## 1. Utilidades

- [x] 1.1 Constante `NOTICIAS_POR_PAGINA = 9` y helper `paginar(notas, pagina)` (devuelve `{ slice, totalPaginas }`) en `lib/noticias.ts` (o `lib/noticias-paginacion.ts`)
- [x] 1.2 Helper `formatearFecha(iso)` — `Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" })`; fallback al ISO crudo si el parseo falla (UTC-safe, sin corrimiento de día)

## 2. Componentes

- [x] 2.1 `components/comunidad/NoticiaCard.tsx` — Server Component: enlace (`next/link`) a `/comunidad/noticias/<slug>`; portada con `next/image` en `aspect-[16/9] object-cover` + **fallback** (`mint-wash` + ícono `Newspaper`) si `portada` es null; fecha (`formatearFecha`), título serif, resumen con clamp ~3 líneas; tokens del proyecto
- [x] 2.2 `components/comunidad/PaginacionNoticias.tsx` — `<nav aria-label="Paginación de noticias">` con Anterior (`rel="prev"`) y Siguiente (`rel="next"`); Anterior→`/comunidad/noticias` si la previa es la 1, si no `/pagina/<n-1>`; Siguiente→`/pagina/<n+1>`; omite el control en cada extremo; indicador "Página X de Y"; no renderiza si `totalPaginas <= 1`
- [x] 2.3 `components/comunidad/ListadoNoticias.tsx` — Server Component `{ notas, pagina, totalPaginas }`: encabezado (`SectionTitle` kicker "Comunidad", "Noticias"), grilla responsive (1/2/3 col) de `NoticiaCard`, y `PaginacionNoticias`; si no hay notas en total → **estado vacío** amable (sin error)

## 3. Rutas

- [x] 3.1 `app/comunidad/noticias/page.tsx` — Server Component: `getAllNoticias()`, `paginar(notas, 1)`, render `ListadoNoticias` (página 1); `metadata` (title, description, canonical `/comunidad/noticias`)
- [x] 3.2 `app/comunidad/noticias/pagina/[n]/page.tsx` — `generateStaticParams` (n = 2..totalPaginas) y `dynamicParams = false`; parsea `n`, si está fuera de rango (incl. `n <= 1`) → `notFound()`; render `ListadoNoticias` con el slice; `metadata` por página

## 4. Verificación

- [x] 4.1 `npm run typecheck` y `npm run build` en `apps/sitio` sin errores; `generateStaticParams` resuelve sin romper con 0/1 nota
- [x] 4.2 Dev (con la nota de ejemplo visible): `/comunidad/noticias` muestra la tarjeta con su portada/fallback, fecha en español, enlace a `/comunidad/noticias/jornada-de-limpieza-mayo`
- [x] 4.3 Estado vacío: simular 0 notas (o verificar el render de prod) → mensaje amable, sin error; `/comunidad/noticias/pagina/2` → 404 cuando no hay 2ª página
- [x] 4.4 Paginación: con N+1 notas de prueba, la página 2 existe y la navegación Anterior/Siguiente aparece/oculta correctamente en los extremos (revertir las notas de prueba)
- [x] 4.5 Accesibilidad: `nav` con `aria-label`, enlaces con `rel=prev/next`; la fecha no se corre de día (UTC)