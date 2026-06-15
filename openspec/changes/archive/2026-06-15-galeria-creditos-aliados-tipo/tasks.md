## 1. Galería con next/image (#50)

- [x] 1.1 Añadir `images.remotePatterns` para `storage.googleapis.com` (bucket `comunidad-chirimoyo`) en `apps/sitio/next.config.ts`
- [x] 1.2 `GaleriaGrid.tsx`: reemplazar `<img>` por `next/image` con `width`/`height` por orientación (`w-full h-auto object-cover`) y `sizes` por breakpoint, lazy salvo las primeras (no `fill`: colapsa dentro de CSS `columns`)
- [x] 1.3 Verificar que el lightbox (`<img>`) sigue mostrando la foto a resolución completa sin layout shift

## 2. Créditos de autoría en la galería (#50)

- [x] 2.1 Añadir `credito` y `fecha` (nullable, ISO) al esquema de `content/landing/galeria.json` y a `FotoGaleria`/`FotoResuelta` en `lib/landing.ts` (propagar en `getGaleriaFotos`)
- [x] 2.2 `Lightbox.tsx`: mostrar autoría + fecha en el `figcaption` solo cuando existan
- [x] 2.3 `GaleriaGrid.tsx`: mostrar el crédito de forma sutil en el overlay de la tarjeta cuando exista
- [x] 2.4 Confirmar que fotos sin `credito`/`fecha` no muestran etiquetas vacías

## 3. Carga incremental de la galería (#50)

- [x] 3.0 `Galeria.tsx`: renderizar por lotes de 30 (`visibles` + `fotos.slice`), montar el siguiente lote con `IntersectionObserver` (sentinela, `rootMargin` holgado); lightbox sobre la lista completa; indicador "Mostrando N de Total"

## 4. Tipo de aliado en la tarjeta (#49)

- [x] 4.1 `AliadosGrid.tsx`: mostrar el `tipo` como `Badge`, con un mapa `tipo → etiqueta` legible (colectivo, ONG, académico, gobierno, negocio, medio, independiente)
- [x] 4.2 Tolerar aliados sin `tipo` válido (sin insignia vacía)

## 5. Verificación

- [x] 5.1 `npm run build` + `lint` + `typecheck` en `apps/sitio` en verde
- [x] 5.2 Verificar en preview: `/galeria` (imágenes optimizadas, sin CLS, lightbox con crédito cuando exista) y `/aliados` (badge de tipo); móvil y desktop
- [x] 5.3 Verificar la carga incremental: SSR acota al lote (probado con LOTE=3 → 3 nodos en el HTML inicial; el observer monta el resto); lightbox sobre la lista completa
- [x] 5.4 Confirmar que el render tolera contenido sin `credito`/`fecha`/`tipo`
