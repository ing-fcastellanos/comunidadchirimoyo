# Tasks — detalle-noticia

## 1. Utilidad de vecinos

- [x] 1.1 Helper `vecinos(notas, slug)` en `lib/noticias-paginacion.ts` (o util): sobre la lista ordenada desc, devuelve `{ siguiente, anterior }` (siguiente = nota más nueva contigua, anterior = más antigua contigua; null en extremos), tipado con `NoticiaMeta`

## 2. Página de detalle

- [x] 2.1 `app/comunidad/noticias/[slug]/page.tsx` — `export const dynamicParams = false`; `generateStaticParams` = `getAllNoticias().map(n => ({ slug: n.slug }))`; en el componente `const nota = await getNoticia(slug); if (!nota) notFound();`
- [x] 2.2 Cabecera: si `nota.portada`, hero con `next/image` (`aspect` ancho, `object-cover`, `portadaAlt`); kicker "Noticias", título serif, meta (fecha `formatearFecha` + autor)
- [x] 2.3 Cuerpo: `<Markdown>{nota.cuerpo}</Markdown>` dentro de un contenedor de ancho de lectura; reusa `Section`/tokens
- [x] 2.4 Navegación: enlace "Volver a noticias" (`/comunidad/noticias`) + anterior/siguiente con `vecinos()` (omitir el ausente; mostrar título de la nota vecina)
- [x] 2.5 `generateMetadata`: `title`, `description`=resumen, `openGraph` `type:"article"` (`publishedTime`=fecha, `authors` si hay), `twitter` `summary_large_image`, `alternates.canonical`; **sin** `images` (los pone el opengraph-image)

## 3. OG dinámico

- [x] 3.1 `app/comunidad/noticias/[slug]/opengraph-image.tsx` — `size = {width:1200,height:630}`, `contentType = "image/png"`, `generateStaticParams` (mismos slugs); función `default` async que carga `getNoticia(slug)` y devuelve `new ImageResponse(<jsx>, { ...size })`; **runtime Node** (sin `runtime="edge"`)
- [x] 3.2 Diseño del card con estilos inline + colores hex de marca (forest/mint/paper): lockup "Comunidad Chirimoyo · Noticias", título de la nota grande (truncado ~2 líneas), fecha; fallback de card genérico si la nota no existe; **fuente por defecto** de ImageResponse

## 4. Verificación

- [x] 4.1 `npm run typecheck` y `npm run build` en `apps/sitio` sin errores; el build genera la página y el PNG OG por nota publicada (en build prod con 0 publicadas: 0 rutas; el ejemplo es borrador)
- [x] 4.2 Dev (con la nota de ejemplo): `/comunidad/noticias/jornada-de-limpieza-mayo` renderiza cabecera + cuerpo (markdown: encabezados, lista, cita, enlace seguro, imagen); "Volver a noticias" funciona
- [x] 4.3 Metadata: `<head>` con `og:type=article`, título/descr (resumen), canonical; `og:image`/`twitter:image` apuntan al `opengraph-image` del segmento
- [x] 4.4 OG: abrir la ruta `opengraph-image` (o el PNG generado) y confirmar un card 1200×630 con marca + título de la nota; sin errores de `ImageResponse` en Node
- [x] 4.5 Slug inexistente → 404; anterior/siguiente: con N notas de prueba aparecen/omiten en los extremos (revertir las notas de prueba)