## 1. Contenido (#45) — validar y completar

- [x] 1.1 Validar que los JSON de `content/landing/` parsean y cumplen el esquema de `README.md` (campos esperados, fechas ISO, iconos válidos en lucide)
- [ ] 1.2 Pulir textos de `actividades.json` y revisar/aprobar el relato de `lucha.md` con la comunidad (tono, qué se afirma públicamente) — _requiere comunidad_
- [ ] 1.3 Cargar `logros.json` con hitos y fechas reales (quitar entradas `PLACEHOLDER`) — _requiere comunidad_
- [ ] 1.4 Cargar `aliados.json` con ≥8 aliados reales (quitar `PLACEHOLDER`; logo/url donde existan) — _requiere comunidad_
- [ ] 1.5 Confirmar datos vigentes de contacto, redes, donación (CLABE/Spin) en `enlaces.json` y `donaciones.json` — _requiere comunidad_

## 2. Diseño v0.dev — solo elementos nuevos (#54)

- [x] 2.1 Generar prompt(s) v0.dev partiendo de `content/landing/` y la pauta visual del catálogo (`apps/catalogo/components/home/*`, tokens de `tokens.css`) — _en `v0-prompts.md`_
- [x] 2.2 Diseñar en v0.dev: línea de tiempo de logros
- [x] 2.3 Diseñar en v0.dev: bloque linktree
- [x] 2.4 Diseñar en v0.dev: galería (grid masonry + lightbox)
- [x] 2.5 Handoff: exportar y documentar los 3 componentes nuevos para portarlos a `apps/sitio`

## 3. Data-layer del landing

- [x] 3.1 Crear `apps/sitio/lib/landing.ts` que lea y tipe `lucha.md` (frontmatter + cuerpo) y los JSON (`actividades`, `logros`, `enlaces`, `donaciones`, `aliados`) en build
- [x] 3.2 Definir tipos TS de cada estructura de contenido; tolerar campos nulos y entradas `PLACEHOLDER`
- [x] 3.3 Verificar que ninguna ruta de imagen ni texto de contenido quede hardcodeado en componentes

## 4. Almacenamiento de fotos de comunidad (bucket GCS)

- [x] 4.1 Redactar `docs/decisions/0021-storage-imagenes-comunidad-gcs.md` (bucket propio, separado del de fauna ADR-0016) y actualizar `docs/adr/_index.md`
- [x] 4.2 Bucket de GCS `comunidad-chirimoyo` público (`allUsers→roles/storage.objectViewer`, verificado 200) y convención de rutas: `galeria/comunidad/<archivo>`; base en `NEXT_PUBLIC_COMUNIDAD_CDN_BASE` (default `https://storage.googleapis.com/comunidad-chirimoyo`)
- [~] 4.3 Subir el set de fotos: 20 de **muestra** ya en el bucket (nombres originales de WhatsApp). _Pendiente el set real curado con nombres limpios_
- [x] 4.4 Definir el origen de la lista de galería resuelto en build: manifiesto `content/landing/galeria.json` (slug, archivo, alt, pie, orientación, `hero`); orden = orden del array. Data-layer `getGaleria()`/`getHeroSlides()`
- [x] 4.5 Foto-ancla del hero y foto de "El caso" referenciadas desde el bucket (hero rota las `hero:true` de `galeria.json`; `casoFoto` apunta al bucket). Retirado el interino de `public/landing/`

## 5. Landing `/` — ensamblaje de secciones

- [x] 5.1 Reemplazar `apps/sitio/app/page.tsx` (quitar placeholder) por el landing como Server Component que consume el data-layer
- [x] 5.2 Hero: layout dos columnas (patrón catálogo) con título/resumen de `lucha.md` y foto-ancla; alt descriptivo; un solo `<h1>`
- [x] 5.3 Sección "El caso" desde el cuerpo de `lucha.md` (qué es / amenaza / qué pedimos) + foto panorámica opcional
- [x] 5.4 Sección "Qué hacemos": grid de tarjetas desde `actividades.json` (reuso del patrón `QueHayAqui`)
- [x] 5.5 Línea de tiempo de logros desde `logros.json` (componente portado de v0.dev; tolera `foto: null`/`PLACEHOLDER`; orden cronológico) — `LineaTiempo.tsx`
- [x] 5.6 Linktree desde `enlaces.json` (componente portado de v0.dev; iconos lucide; distinto del Header) — `Linktree.tsx`
- [x] 5.7 Sección de donaciones informativas desde `donaciones.json` (grid + CLABE/QR/contacto; sin pasarela, ADR-0007)
- [x] 5.8 Preview de aliados (subconjunto de `aliados.json`) con enlace a `/aliados`
- [x] 5.9 Cierre CTA (patrón `pine-deep` del catálogo)

## 6. Subpáginas `/aliados` y `/galeria`

- [x] 6.1 `apps/sitio/app/aliados/page.tsx`: rejilla completa desde `aliados.json` (tolera logo/url nulos); `metadata.title`
- [x] 6.2 `apps/sitio/app/galeria/page.tsx`: rejilla de fotos (orientaciones mixtas, lazy-load) desde `galeria.json` + lightbox (cliente, portado de v0.dev); `metadata.title`. _Fotos interinas en `public/`; mover al bucket sin tocar componentes_
- [x] 6.3 Verificar accesibilidad del lightbox (teclado, foco, cierre) — verificado en preview: Escape/←/→, focus-trap, scroll-lock, `role=dialog aria-modal`

## 7. Componentes nuevos al sistema de diseño

- [x] 7.1 Portar timeline, linktree y galería a `apps/sitio/components/landing/` usando solo tokens existentes (sin colores hardcodeados fuera de `tokens.css`)
- [x] 7.2 Evaluar si timeline/linktree/galería deben vivir en `docs/design-system/primitives` — _por ahora en `components/landing/` (específicos del landing); promover a primitivas solo si otra app los reusa_

## 8. Verificación

- [x] 8.1 `npm run build` en `apps/sitio` sin errores; el landing y subpáginas renderizan con contenido real
- [x] 8.2 Verificar en preview: `/`, `/aliados`, `/galeria` (móvil ~380px y desktop); hero multifoto y lightbox funcionando
- [x] 8.3 Comprobar jerarquía de encabezados (un `<h1>`), foco visible y alt en imágenes
- [x] 8.4 Confirmar que editar `content/landing/` cambia el render sin tocar componentes
- [x] 8.5 Lint/typecheck del sitio en verde
