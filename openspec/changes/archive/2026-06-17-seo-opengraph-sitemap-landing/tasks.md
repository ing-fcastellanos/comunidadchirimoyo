## 1. Sitemap y robots

- [x] 1.1 Crear `apps/sitio/app/sitemap.ts` (`MetadataRoute.Sitemap`) con URLs absolutas bajo `https://chirimoyo.org` para `/`, `/comunidad`, `/voluntarios`, `/aliados`, `/galeria`, `/contacto`, `/privacidad`; dejar comentario recordando actualizar el arreglo al agregar secciones públicas
- [x] 1.2 Crear `apps/sitio/app/robots.ts` (`MetadataRoute.Robots`) que permita indexar lo público y declare `sitemap: https://chirimoyo.org/sitemap.xml`
- [x] 1.3 Verificar en dev que `/sitemap.xml` y `/robots.txt` responden XML/texto válido y no incluyen rutas de error

## 2. Canónicos explícitos

- [x] 2.1 Añadir `alternates.canonical: "/"` a la metadata del landing (ver tarea 4.1)
- [x] 2.2 Añadir `alternates.canonical` con su path a la metadata de `/comunidad`, `/voluntarios`, `/aliados`, `/galeria`, `/contacto` y `/privacidad`
- [x] 2.3 Verificar que cada página emite `<link rel="canonical">` hacia `https://chirimoyo.org/<path>`

## 3. Twitter cards

- [x] 3.1 Añadir el bloque `twitter` (`card: "summary_large_image"`, `title`, `description`, `images: ["/og-default.jpg"]`) al `metadata` de `apps/sitio/app/layout.tsx`
- [x] 3.2 Verificar que las páginas heredan `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

## 4. Metadata y datos estructurados del landing

- [x] 4.1 Exportar `metadata` propia en `apps/sitio/app/page.tsx` (título y descripción del landing + `alternates.canonical: "/"`)
- [x] 4.2 Inyectar JSON-LD `Organization` (nombre, URL, logo y, si aplica, `sameAs` desde `content/landing/enlaces.json`) como `<script type="application/ld+json">` en el landing (Server Component, sin cliente)
- [x] 4.3 Verificar que el HTML del landing contiene el `Organization` válido

## 5. Validación y cierre

- [ ] 5.1 Validar OpenGraph/Twitter con un validador (Card Validator / depurador de OG) sobre `/` y al menos una sección — _bloqueada: requiere URL pública; hacer tras el deploy #53_
- [ ] 5.2 Verificar la vista previa real al compartir una URL en WhatsApp/Facebook (forzar re-scrape si hay caché) — _bloqueada: requiere URL pública; hacer tras el deploy #53_
- [x] 5.3 `npm run build` en `apps/sitio` sin errores; confirmar que sitemap/robots se generan en la salida
