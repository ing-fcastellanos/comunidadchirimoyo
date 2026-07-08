## 1. Optimizar el logo compartido

- [x] 1.1 Redimensionar/comprimir `logo-chirimoyo.png` (fuente en `apps/sitio/public/`) a un tamaño adecuado para su mayor uso a 2x (~96–128px de lado), preservando transparencia (RGBA). → 128×128, PIL LANCZOS + `optimize=True, compress_level=9`.
- [x] 1.2 Verificar visualmente que el resultado no perdió fidelidad notoria respecto al original (comparación lado a lado). → confirmado, texto e ilustración nítidos a esa resolución.
- [x] 1.3 Copiar el archivo optimizado a `apps/catalogo/public/logo-chirimoyo.png` (mismo binario en ambas apps, sin symlink).
- [x] 1.4 Confirmar el peso final (`ls -la`) y que sea un orden de magnitud menor que los 830 KB originales. → 22 318 bytes (37.2× más chico).

## 2. Migrar Header/Footer a next/image (ambas apps donde aplica)

- [x] 2.1 `apps/sitio/components/layout/Header.tsx`: reemplazar `<img>` por `next/image` con `width`/`height` explícitos y `priority` (above-the-fold).
- [x] 2.2 `apps/sitio/components/layout/Footer.tsx`: reemplazar `<img>` por `next/image` con `width`/`height` explícitos (sin `priority`, no es above-the-fold).
- [x] 2.3 `apps/catalogo/components/layout/Header.tsx` y `Footer.tsx`: NO se tocan (siguen con `<img>`, solo se benefician del binario más liviano vía 1.3) — confirmado, sin cambio de código.

## 3. Migrar los componentes de fotos reales a next/image (sitio)

- [x] 3.1 `apps/sitio/components/comunidad/LineaTiempo.tsx`: `<img>` → `next/image` con `fill`. Desviación del design: NO tenía contenedor `relative` (era un `<img>` de tamaño fijo suelto, no absolute/fill); se envolvió en un `<div className="relative h-40 w-full max-w-xs ... sm:h-44">` nuevo para habilitar `fill`, con `sizes="(max-width: 640px) 100vw, 320px"`.
- [x] 3.2 `apps/sitio/components/landing/AliadosGrid.tsx`: **REVERTIDO — no migra.** Se probó con `width={48} height={48}` explícitos, pero rompió `/aliados` en runtime: `mediaUrl(aliado.logo)` deja pasar URLs externas arbitrarias (logos de terceros en Facebook/sitios propios), fuera de `images.remotePatterns`; `next/image` lanza excepción en runtime con dominios no listados (confirmado con `preview_console_logs` — `Error: Invalid src prop ... hostname "scontent.fpaz4-1.fna.fbcdn.net" is not configured`). Se dejó `<img>` con comentario explicando la razón (distinta a Lightbox). proposal.md/design.md/spec actualizados.
- [x] 3.3 `apps/sitio/components/landing/ElCaso.tsx`: `fill` dentro del contenedor `relative aspect-[4/3]` existente, `sizes="(max-width: 1024px) 100vw, 45vw"`.
- [x] 3.4 `apps/sitio/components/landing/GaleriaTeaser.tsx`: `fill` dentro del contenedor `relative aspect-square` existente, `sizes="(max-width: 640px) 50vw, 25vw"` (grid 2/4 columnas).
- [x] 3.5 `apps/sitio/components/landing/Hero.tsx`: `fill` dentro del contenedor `relative aspect-[4/3] sm:aspect-[4/5]` existente, `loading`/`fetchPriority` traducidos a `priority={i === 0}`; animación CSS (`hero-slide`, `animationDelay` inline) preservada sin cambios.
- [x] 3.6 Comentarios `eslint-disable-next-line @next/next/no-img-element` eliminados en los 4 componentes migrados (LineaTiempo, ElCaso, GaleriaTeaser, Hero); AliadosGrid conserva el suyo, con la razón actualizada.

## 4. Documentar la exclusión deliberada de Lightbox

- [x] 4.1 `apps/sitio/components/landing/Lightbox.tsx`: ampliar el comentario `eslint-disable` existente explicando por qué se excluye de esta migración (tamaño dinámico `max-h-[72vh] w-auto`, sin contenedor de aspect-ratio fijo). Sin cambio de comportamiento.

## 5. Verificación

- [x] 5.1 `npm run build` de `apps/sitio`: confirmar que compila sin errores/warnings de `next/image` (dimensiones faltantes, contenedor sin `position: relative`, etc.). → compiló limpio (13/13 páginas estáticas), sin warnings.
- [x] 5.2 Confirmar en `apps/sitio/package.json` que no se agregó ninguna dependencia nueva de procesamiento de imágenes. → `git diff apps/sitio/package.json` sin cambios.
- [x] 5.3 Levantar el dev server de `sitio` y revisar en runtime (DOM, `data-nimg`) que Header, Footer, "El caso", galería teaser y hero usan `next/image` sin pantalla de error. → confirmado en `/`, `/comunidad`, `/aliados`: sin `Algo salió mal`, `data-nimg` presente en los 4 migrados + Header/Footer. `LineaTiempo` no tiene fotos en el contenido actual (`logros.json` con `foto: null`) para verificar en runtime; el build validó su JSX. `AliadosGrid` confirmado como `<img>` plano (no `next/image`, por diseño revisado).
- [x] 5.4 Confirmar que la animación del hero (crossfade CSS) sigue funcionando tras la migración a `next/image`. → `getComputedStyle` confirma `animation-name: hero-fade` en los 4 slides.
- [x] 5.5 `npm run build` de `apps/catalogo`: confirmar que sigue compilando (solo cambió el binario del logo, sin cambio de código). → compiló limpio.
- [x] 5.6 Confirmar el peso final servido del logo en ambas apps (`out/`/`.next/` o inspección del archivo en `public/`). → 22 318 bytes en `apps/sitio/public/`, `apps/catalogo/public/` y `apps/catalogo/out/`.
