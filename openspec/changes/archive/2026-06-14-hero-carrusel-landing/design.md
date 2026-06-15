## Context

Tras `foto-principal-curada`, el Hero (`components/home/Hero.tsx`, Server Component) recibe `img`/`alt` desde `page.tsx`, derivados de la portada curada (`fotos[0]`) de una especie representativa, y los pinta en un `<figure>` con `object-cover`, ring y un `<figcaption>` con el nombre de la especie. El catálogo es export estático (`output: "export"`): cualquier interactividad exige `"use client"`.

Se quiere un carrusel automático de 4 fotos, bucle infinito, 4 s por foto, crossfade 0.8 s, con pie rotativo. Decisión ya tomada en explore: **CSS puro (Opción A)**.

## Goals / Non-Goals

**Goals:**
- Carrusel automático de 4 portadas curadas en bucle, sin interacción.
- Crossfade CSS, **sin JavaScript** → el Hero sigue siendo Server Component.
- Pie de foto sincronizado con la imagen activa.
- Respetar `prefers-reduced-motion`.

**Non-Goals:**
- Controles manuales, dots, swipe, lightbox, pausa-al-hover.
- Client component / timers JS.
- Cambiar el esquema, el bucket o `fotoUrl`.

## Decisions

### D1 — Crossfade con keyframes CSS puro (sin JS)

Las 4 imágenes se apilan en el mismo contenedor (`grid` con todas en la misma celda, o `position: absolute`). Cada una tiene una animación `opacity` con el **mismo periodo** `T = 4 fotos × 4 s = 16 s`, `animation-iteration-count: infinite`, y un `animation-delay` escalonado de 4 s entre ellas. Dentro de cada ciclo, cada imagen está visible su ventana de 4 s con entradas/salidas de 0.8 s.

Reparto de la animación de opacidad (porcentajes sobre 16 s; ventana de 4 s = 25 %, crossfade 0.8 s ≈ 5 %):
```
0%  →  opacity 1        (visible al inicio de su slot)
20% →  opacity 1        (fin de los 4 s útiles, antes del fundido… ver nota)
25% →  opacity 0        (fundido de salida de 0.8 s ≈ 5 %)
95% →  opacity 0        (oculta el resto del ciclo)
100%→  opacity 1        (vuelve a entrar para el bucle)
```
Cada imagen i lleva `animation-delay: -(i × 4s)` (delays negativos para que el patrón ya esté "en fase" al cargar). El stacking-order asegura que el que entra quede sobre el que sale durante el fundido. Los porcentajes exactos se afinan en implementación para clavar 0.8 s de crossfade.

- *Alternativa (Opción B, JS):* `useState` + `setInterval` en un client component. Permite caption trivial y dots futuros, pero añade hidratación y superficie de bug. Descartada en explore para este alcance.

### D2 — Caption rotativo con una segunda animación sincronizada

Los 4 pies se apilan igual que las imágenes y comparten el **mismo** ciclo de 16 s y los mismos delays escalonados, de modo que el nombre visible corresponde siempre a la foto visible. Mismo patrón de keyframes que D1.

### D3 — `prefers-reduced-motion`

Bajo `@media (prefers-reduced-motion: reduce)` se anula `animation` en imágenes y pies: queda visible solo la **primera** foto y su pie (las demás con `opacity: 0`). Sin movimiento, accesible.

### D4 — Datos: 4 slides derivados en build

`page.tsx` define la lista ordenada de slugs (`HERO_SLUGS`), busca cada ficha en `getAllFichas()`, y arma `slides = [{ src: fotoUrl(slug, fotos[0].archivo, "web"), alt, nombre }]`. Se pasa `slides` al Hero. Si un slug no existe o no tiene fotos, se omite ese slide (degradación: el carrusel corre con los que haya). Hardcodea la **lista de slugs**, no archivos.

### D5 — Hero recibe `slides[]` (cambia su firma)

`Hero({ slides }: { slides: { src; alt; nombre }[] })`. Si `slides.length === 1`, no hay animación (una sola foto, equivalente al estado previo). El marco visual (aspect ratio responsivo, ring, overlay del caption) se conserva.

## Risks / Trade-offs

- **Afinado de los keyframes** (clavar exactamente 0.8 s de crossfade y que no se vea "salto" en el bucle) → iterar con preview; el punto 100%→0% del ciclo debe empalmar con el primer slide. Verificar visualmente.
- **Caption desincronizado de la imagen** si los delays/periodos no son idénticos → usar exactamente el mismo `T` y los mismos `animation-delay` en imágenes y pies; encapsular en variables CSS para no divergir.
- **LCP** → la primera imagen es candidata a LCP; cargarla con prioridad (`loading="eager"`/`fetchpriority="high"` en la 1ª, el resto normal).
- **CLS** → reservar el aspecto del contenedor (el `aspect-[…]` ya está) para evitar saltos al cargar.
- **4 descargas** desde el bucket → aceptable; son las portadas ya optimizadas (variante `web`).

## Migration Plan

1. `page.tsx`: derivar `slides[]` de los 4 slugs.
2. `Hero.tsx`: apilar imágenes + pies, aplicar clases de animación; conservar el marco.
3. CSS: keyframes de imagen y caption + regla `prefers-reduced-motion`.
4. `npm run typecheck` + `npm run build` + preview: verificar rotación, sincronía caption↔foto, bucle sin salto, y modo reduced-motion.

**Rollback:** revertir el commit restaura el hero de una sola foto (`foto-principal-curada`). Sin estado ni datos externos.
