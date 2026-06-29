# Tasks — reorganizar-comunidad

## 1. Mover componentes

- [x] 1.1 `git mv apps/sitio/components/landing/QueHacemos.tsx apps/sitio/components/comunidad/QueHacemos.tsx`
- [x] 1.2 `git mv apps/sitio/components/landing/LineaTiempo.tsx apps/sitio/components/comunidad/LineaTiempo.tsx`
- [x] 1.3 Actualizar el comentario/encabezado de cada uno si menciona "landing" (opcional, menor); `ElCaso.tsx` se queda en `components/landing/`

## 2. /comunidad: añadir secciones

- [x] 2.1 `app/comunidad/page.tsx` — cargar `getLucha`, `getActividades`, `getLogros` (junto al `getAllNoticias` ya presente; usar `Promise.all` o awaits)
- [x] 2.2 Render en orden: intro (existente) → `<ElCaso secciones={lucha.secciones} fotoUrl={mediaUrl(lucha.casoFoto)} fotoAlt={lucha.casoFotoAlt} />` → `<QueHacemos data={actividades} />` → `<LineaTiempo data={logros} />` → bloque "Últimas noticias" (existente). Importar `ElCaso` de `components/landing/`, `QueHacemos`/`LineaTiempo` de `components/comunidad/`, `mediaUrl` de `lib/landing`
- [x] 2.3 Conservar el bloque de noticias y el resto del intro; ubicar las secciones nuevas antes del bloque de noticias

## 3. Landing: quitar secciones + teaser

- [x] 3.1 `app/page.tsx` — quitar `<QueHacemos>` y `<LineaTiempo>` del render y sus imports; quitar `getActividades()`/`getLogros()` del `Promise.all` (y las vars `actividades`/`logros`)
- [x] 3.2 Insertar, tras `<ElCaso>`, un **enlace teaser** a `/comunidad` ("Conoce a la comunidad: qué hacemos, nuestra historia y logros"), banda discreta con tokens existentes

## 4. Verificación

- [x] 4.1 `npm run typecheck` y `npm run build` en `apps/sitio` sin errores; sin imports colgando a `components/landing/{QueHacemos,LineaTiempo}`
- [x] 4.2 `/comunidad` (dev): muestra intro → El caso → Qué hacemos (tarjetas) → Línea de tiempo (hitos) → Últimas noticias
- [x] 4.3 `/` (landing): ya NO muestra Qué hacemos ni Línea de tiempo; sí muestra El caso y el **enlace a /comunidad**; el resto (galería, donaciones, aliados, linktree, cierre) intacto
- [x] 4.4 Confirmar que "El caso" se ve igual en ambas páginas (mismo contenido de `lucha.md`)