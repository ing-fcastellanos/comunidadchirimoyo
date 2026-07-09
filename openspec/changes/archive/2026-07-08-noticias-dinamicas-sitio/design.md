## Context

#134 dejó los db-readers (`getAllNoticiasDb`/`getNoticiaDb`, mismos tipos que los loaders `fs`) y #135 sembró Firestore. Hoy las noticias del sitio se **pre-generan en build** desde `content/`: el detalle y la paginación con `generateStaticParams` + `dynamicParams = false`, el OG por slug en build, y `sitemap.ts` enumerando `getAllNoticias()`. El sitio es `output: "standalone"` en Cloud Run (ADR-0015) y su **build corre en Docker (`RUN npm run build`) sin credenciales GCP**. Este cambio (#136) mueve las noticias a lectura en runtime.

## Goals / Non-Goals

**Goals:**
- Las páginas de noticias leen Firestore **server-side en runtime**; una nota publicada aparece sin re-build.
- El **build no toca Firestore** (invariante verificable).
- Revalidación **on-demand** (endpoint protegido) + respaldo temporal.
- Preservar JSON-LD `NewsArticle`, OpenGraph, sitemap y el ocultamiento de borradores en prod.

**Non-Goals:**
- Borrar `content/`/loaders `fs`/seed (cleanup tras #137); tocar jornadas (#137); construir el admin (llama al endpoint en #140); cambiar layout/JSON-LD/esquema.

## Decisions

- **D1 — Render en runtime, no en build.** Se quitan `generateStaticParams` y `dynamicParams = false` del detalle, su OG y la paginación. El **invariante** es que `next build` haga **cero** llamadas a Firestore; la implementación se elige para cumplirlo y se **verifica** (build en un entorno sin ADC/emulator debe pasar). *Sutileza clave:* el `revalidate` de ISR **igual pre-renderiza una vez en build**, así que para páginas sin parámetros (listado, sitemap) ISR puro reintroduciría Firestore en build. Por eso el caching es **en runtime**, no por prerender de build.

- **D2 — Caching por revalidación en runtime (no prerender).** Enfoque líder: marcar las superficies sin parámetros como dinámicas (`export const dynamic = "force-dynamic"`) y envolver las lecturas en `unstable_cache` con **tags** revalidables; el detalle `[slug]`/paginación `[n]`, al no tener `generateStaticParams`, ya no se pre-generan. El primer request renderiza (Cloud Run tiene ADC) y el cache/tag sirve el resto. La knob exacta de Next (`force-dynamic` vs `revalidate` vs `unstable_cache`) se **fija y verifica en apply** contra el invariante D1.

- **D3 — Endpoint de revalidación on-demand.** `app/api/revalidate/route.ts` (POST) protegido por `REVALIDATE_SECRET` (comparación server-side; nunca `NEXT_PUBLIC`). Revalida: el listado `/comunidad/noticias`, todas las `pagina/[n]`, el `[slug]` afectado (si el body lo trae) y el `sitemap.xml` — vía `revalidateTag`/`revalidatePath`. El admin lo llama al publicar (#140); aquí queda expuesto y protegido. Respaldo temporal (revalidación periódica) por si un disparo se pierde.

- **D4 — Swap mecánico de fuente.** En las 6 superficies: `getAllNoticias → getAllNoticiasDb`, `getNoticia → getNoticiaDb`. Como los tipos son idénticos, el resto del código (JSX, JSON-LD, `vecinos`, `paginar`, `formatearFecha`) no cambia. Los componentes solo importan el **tipo** (sin cambio).

- **D5 — No borrar el path fs (confirmado).** `lib/noticias.ts` sigue siendo el hogar del tipo `Noticia`/`NoticiaMeta` (lo reusan los readers y los componentes) y la fuente del seed. El borrado físico de `content/` + loaders + relocación del tipo + retiro del seed es un **cleanup atómico tras #137** (el seed migra noticias y jornadas juntas; borrar solo noticias dejaría el seed a medias).

- **D6 — Borradores y el índice.** Los db-readers ocultan borradores cuando `NODE_ENV=production` con `where(estado==publicado).orderBy(fecha desc)`, que exige el **índice compuesto** de `firestore.indexes.json` (#134) **desplegado**. Es un paso de ops (runbook #144), no de código.

## Risks / Trade-offs

- **Build que sí toca Firestore por descuido** → el invariante D1 se **verifica** construyendo sin ADC/emulator; si algo pre-renderiza contra Firestore, el build falla y se corrige (marcar dinámico). Es el riesgo central del cambio.
- **Cold-start + primer request SSR** (min-instances=0) → aceptable a bajo tráfico; el cache/tag amortiza; el ISR de respaldo evita staleness indefinida.
- **Cobertura de revalidación incompleta** → si el endpoint no revalida alguna superficie (p. ej. el sitemap o una `pagina/[n]`), queda stale hasta el respaldo temporal; el diseño enumera explícitamente qué revalidar.
- **En prod la sección sale vacía** (la única nota es `borrador`) → **ya ocurre hoy**; no es regresión. Solo confirmar el empty-state. Contenido real por el admin (#140).
- **Índice no desplegado** → la query de publicadas truena en prod; mitigación: desplegarlo antes del primer deploy que lea prod (runbook).
