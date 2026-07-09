# Tasks — noticias-dinamicas-sitio (issue #136)

## 1. Swap de fuente (readers de #134)

- [x] 1.1 `app/comunidad/noticias/page.tsx` (listado) — `getAllNoticias → getAllNoticiasDb`.
- [x] 1.2 `app/comunidad/noticias/pagina/[n]/page.tsx` — `getAllNoticiasDb`; **quitar** `generateStaticParams` + `dynamicParams = false`.
- [x] 1.3 `app/comunidad/noticias/[slug]/page.tsx` — `getNoticiaDb`/`getAllNoticiasDb` (metadata, JSON-LD, vecinos); **quitar** `generateStaticParams` + `dynamicParams = false`; conservar `notFound()`.
- [x] 1.4 `app/comunidad/noticias/[slug]/opengraph-image.tsx` — `getNoticiaDb`; **quitar** `generateStaticParams` (OG en runtime).
- [x] 1.5 `app/comunidad/page.tsx` — `getAllNoticiasDb` para el teaser de notas recientes.
- [x] 1.6 `app/sitemap.ts` — `getAllNoticiasDb`; configurar para que **no** se pre-genere contra Firestore en build.

## 2. Modelo de render (build libre de Firestore)

- [x] 2.1 Marcar las superficies sin parámetros (listado, `/comunidad`, sitemap, y las que Next pre-renderizaría) como **dinámicas** (`export const dynamic = "force-dynamic"` o equivalente) para que el build no las pre-genere contra Firestore.
- [x] 2.2 (Caching) Envolver las lecturas en `unstable_cache` con **tags** revalidables (o la knob de Next que cumpla el invariante), de modo que el primer request cachee y la revalidación invalide. Ajustar hasta que el build no toque Firestore.
- [x] 2.3 Revalidación temporal de respaldo (p. ej. `revalidate` por tag/tiempo) por si un disparo on-demand se pierde.

## 3. Revalidación on-demand

- [x] 3.1 `app/api/revalidate/route.ts` (POST) protegido por `REVALIDATE_SECRET` (server-only): revalida listado, `pagina/[n]`, el `[slug]` del body y el `sitemap` (`revalidateTag`/`revalidatePath`). Rechaza (401/403) sin secreto válido.
- [x] 3.2 `REVALIDATE_SECRET` documentado en `apps/sitio/.env.example` (server-only, no `NEXT_PUBLIC`).

## 4. Verificación

- [x] 4.1 **Invariante:** `npm run build` de `apps/sitio` **sin** `FIRESTORE_EMULATOR_HOST` ni ADC → completa sin errores y **sin** llamadas a Firestore (las rutas de noticias quedan dinámicas, no pre-generadas).
- [x] 4.2 Con el emulator sembrado (#135): `dev`/preview → `/comunidad/noticias`, detalle, `pagina/[n]`, OG y sitemap leen de Firestore; el JSON-LD `NewsArticle` y el OpenGraph se preservan.
- [x] 4.3 Borradores: con `NODE_ENV=production` + emulator, una nota `borrador` no aparece en el listado y su slug da 404; en dev sí se ve.
- [x] 4.4 Revalidación: POST a `/api/revalidate` con el secreto revalida; sin el secreto → 401/403. Publicar (cambiar `estado` en el emulator) + revalidar → la nota aparece sin re-build.
- [x] 4.5 `npm run typecheck` en verde. (Deploy del índice compuesto + IAM = ops, runbook #144, fuera de este checklist.)
