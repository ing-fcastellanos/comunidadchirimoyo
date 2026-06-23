## 1. Split de grupo (tipo + loader)

- [x] 1.1 Cambiar `type Grupo` a `"aves" | "anfibios" | "reptiles"` en `apps/catalogo/lib/fauna-schema.ts`
- [x] 1.2 Actualizar `GRUPOS` en `apps/catalogo/lib/content.ts` a `["aves", "anfibios", "reptiles"]` (el loader ya tolera carpetas inexistentes con `continue`)
- [x] 1.3 Verificar que `getAllFichas()` sigue devolviendo solo aves sin error (anfibios/reptiles sin carpeta) y que `npm run typecheck` pasa

## 2. Ruta generalizada de detalle `app/[grupo]/[slug]`

- [x] 2.1 Mover `app/aves/[slug]/page.tsx` a `app/[grupo]/[slug]/page.tsx`, leyendo `grupo` y `slug` de params
- [x] 2.2 Actualizar `generateStaticParams` para devolver pares `{ grupo, slug }` de `getAllFichas()` (mantener `dynamicParams = false`); validar que ningún slug sea `buscador`
- [x] 2.3 Repuntar `href` en `apps/catalogo/lib/search.ts` (`fichaToBird`) de `/aves/${slug}` a `/${f.grupo}/${slug}`
- [x] 2.4 Repuntar el enlace de relacionadas en `apps/catalogo/components/ficha/secciones.tsx` (RelacionadasNav) a `/${grupo}/${slug}`
- [x] 2.5 Verificar en build que se generan `out/aves/<slug>/index.html` y que "Ver ficha" / relacionadas navegan correctamente

## 3. Mover landing y buscador de aves a `/aves`

- [x] 3.1 Crear `app/[grupo]/page.tsx` que ramifique por grupo: `aves` → landing rico (Hero, QueHayAqui, ElHumedal, CierreCTA, conteo en build); `anfibios`/`reptiles` → placeholder "próximamente"
- [x] 3.2 Trasladar el contenido del landing actual (`app/page.tsx`) a la rama `aves`, sin pérdida de funcionalidad
- [x] 3.3 Crear `app/[grupo]/buscador/page.tsx`: `aves` monta `BuscadorAves` (lo de `app/busqueda`); otros grupos → `notFound()`
- [x] 3.4 Actualizar CTAs del landing a `/aves/buscador`: `components/home/Hero.tsx` y `components/home/CierreCTA.tsx`
- [x] 3.5 Ajustar el H1/título del landing y del buscador para nombrar el grupo "aves" (no el catálogo completo)
- [x] 3.6 Verificar build: `out/aves/index.html` (landing) y `out/aves/buscador/index.html` (buscador) con la funcionalidad intacta; confirmar que `/aves/buscador` resuelve al buscador y no colisiona con `[slug]`

## 4. Hub de fauna en `/` y stubs "próximamente"

- [x] 4.1 Reescribir `app/page.tsx` como hub de fauna: carrusel (portadas curadas de aves vía data-layer, respeta `prefers-reduced-motion`), tres tarjetas de grupo (aves activa con conteo; anfibios/reptiles "próximamente") y acceso a `/busqueda`
- [x] 4.2 Crear el componente de placeholder "próximamente" reutilizable (tokens y primitivas del sistema de diseño, con salida de regreso al hub/aves)
- [x] 4.3 Crear el stub de `/busqueda` (`app/busqueda/page.tsx` reconvertido a placeholder "próximamente")
- [x] 4.4 Asegurar que `/anfibios` y `/reptiles` rinden el placeholder (vía la rama de `app/[grupo]/page.tsx`)
- [x] 4.5 Verificar build: `out/index.html` (hub), `out/anfibios/index.html`, `out/reptiles/index.html`, `out/busqueda/index.html`; ninguno devuelve 404 ni se ve vacío

## 5. Rename a `fauna.chirimoyo.org` y SEO

- [x] 5.1 Cambiar `metadataBase` y constantes de base URL a `https://fauna.chirimoyo.org` en `app/layout.tsx`/metadata
- [x] 5.2 Regenerar `sitemap` (hub, `/aves`, `/aves/buscador`, fichas `/<grupo>/<slug>`) y `robots` sobre el nuevo dominio
- [x] 5.3 Actualizar `.firebaserc`/`firebase.json` al target del site de `fauna.chirimoyo.org`
- [x] 5.4 Neutralizar strings "aves" como nombre del catálogo completo en `components/layout/Header.tsx` (y Footer/títulos), presentándolo como guía de fauna; preparado para i18n
- [x] 5.5 Repuntar el enlace de búsqueda del `Header` (×2: escritorio y móvil) a `/busqueda` (stub)

## 6. Verificación final

- [x] 6.1 `npm run typecheck` y `npm run lint` pasan en `apps/catalogo`
- [x] 6.2 `npm run build` genera `out/` completo sin errores, con todas las rutas nuevas presentes
- [x] 6.3 Revisión en preview: hub, `/aves`, `/aves/buscador`, una ficha `/aves/<slug>`, y los tres stubs; navegación y enlaces internos correctos
- [x] 6.4 Confirmar que no quedan enlaces colgando a `/busqueda` (como buscador de aves) ni a `/aves/${slug}` hardcodeados
- [x] 6.5 Anotar en el PR los pasos de infra manuales pendientes (rename del site en Firebase, DNS Porkbun, vanity 301 — este último es #86)
