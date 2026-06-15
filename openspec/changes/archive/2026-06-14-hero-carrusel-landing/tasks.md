## 1. Datos de los slides (page.tsx)

- [x] 1.1 Definir `HERO_SLUGS` ordenado: `botaurus-lentiginosus`, `megaceryle-alcyon`, `egretta-thula`, `dendrocygna-autumnalis`.
- [x] 1.2 En `app/page.tsx`, derivar `slides[]` = por cada slug, su ficha → `{ src: fotoUrl(slug, fotos[0].archivo, "web"), alt: fotos[0].alt, nombre: nombreComun }`, omitiendo slugs sin ficha/foto.
- [x] 1.3 Pasar `slides` al `<Hero />` (reemplaza los props `img`/`alt`).

## 2. Carrusel CSS en Hero.tsx

- [x] 2.1 Cambiar la firma a `Hero({ slides })`; mantener el marco visual (aspect ratio responsivo, ring, overlay del pie) y que el Hero siga siendo Server Component (sin `"use client"`).
- [x] 2.2 Apilar las 4 imágenes en la misma celda (grid/absolute) con `object-cover`; la 1ª con carga prioritaria, el resto normal.
- [x] 2.3 Apilar los 4 pies de foto en el overlay, uno por especie.

## 3. Animación CSS (globals.css)

- [x] 3.1 Definir keyframes de opacidad para ciclo de 16 s (4×4 s) con fundido de 0.8 s; aplicar a imágenes con `animation-delay` escalonado negativo y `iteration-count: infinite`.
- [x] 3.2 Aplicar el mismo ciclo/delays a los pies para que el nombre quede sincronizado con la foto activa (usar variables CSS para no divergir periodo/delays).
- [x] 3.3 Añadir `@media (prefers-reduced-motion: reduce)`: anular animaciones, mostrar la 1ª foto y su pie fijos (resto `opacity: 0`).

## 4. Verificación

- [x] 4.1 `npm run typecheck` en `apps/catalogo` sin errores.
- [x] 4.2 `npm run build` + preview: las 4 fotos rotan en bucle con crossfade, el pie cambia sincronizado, no hay "salto" al reiniciar el ciclo.
- [x] 4.3 Verificar `prefers-reduced-motion` (emular en el preview): no autoanima, muestra avetoro fijo.
- [x] 4.4 Verificar viewport móvil (~380px) y que el H1 sigue siendo único.

## 5. Cierre

- [x] 5.1 Commit + PR.
