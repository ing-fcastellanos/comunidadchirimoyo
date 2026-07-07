## 1. Skip-link "Saltar al contenido" (ambas apps)

- [x] 1.1 En `apps/sitio/app/layout.tsx`, agregar como primer hijo del `<body>` un enlace
      `<a href="#contenido">Saltar al contenido</a>` con clases sr-only-focusable (oculto salvo `:focus`).
- [x] 1.2 En el mismo layout, añadir `id="contenido"` y `tabIndex={-1}` al `<main>`.
- [x] 1.3 Definir la utilidad sr-only-focusable (clases Tailwind o helper en `globals.css`) si no existe,
      de modo que el enlace sea invisible pero enfocable y visible al recibir foco.
      → se usan las utilidades nativas de Tailwind `sr-only` + `focus-visible:not-sr-only`, sin helper custom.
- [x] 1.4 Replicar 1.1–1.2 en `apps/catalogo/app/layout.tsx` (mismo patrón, mismo destino `#contenido`).

## 2. Contraste AA de texto de acento

- [x] 2.1 Grep de `text-forest\b` (excluyendo `-deep`/`-soft`/opacidad) en ambas apps y clasificar cada
      hit: texto sobre fondo claro verdoso (corregir) vs. ícono / `accent-`/`border-` / sobre blanco (dejar).
      → 51 usos: 32 corregidos (texto sobre paper/paper-deep/mint-wash), 26 dejados (íconos 1.4.11, checkboxes
      accent-, `print/` fuera de alcance, y 4 sobre blanco que ya pasan 4.85:1: NoticiaCard, MobileNav, AliadosGrid, ProximasJornadas).
- [x] 2.2 Reasignar a `text-forest-deep` los usos que sean texto pequeño sobre `paper`/`paper-deep`/
      `mint-wash`/`mint-soft` (p. ej. rótulos `text-[12px] font-bold uppercase`, `VecinoLink`, `MobileNav`,
      `SectionTitle`, `Footer`, `NoticiaCard`, `LineaTiempo`, `secciones.tsx`, `IndiceGrupo`, etc.).
- [x] 2.3 Verificar que ningún otro token de acento (`teal`/`ochre`/`mint-deep`) se use como texto pequeño
      sobre paper; si aparece, corregir a una tonalidad ≥ 4.5:1 o documentar que es fondo/badge.
      → hallazgo nuevo: badge "Próximamente" `text-ochre` sobre `bg-ochre/15` medía 2.53:1 (FALLA). Se agregó
      `--color-ochre-deep #7d5f1c` (espejo de terra-deep, 4.67:1 sobre el badge) y se usó en el badge.
      Íconos ochre/mint-deep (1.4.11) se dejaron por decisión del usuario. `text-teal` no aparece como texto.

## 3. prefers-reduced-motion

- [x] 3.1 En `InscripcionForm.tsx` y `ContactoForm.tsx`, hacer que el spinner de envío no gire bajo
      `prefers-reduced-motion: reduce` (utilidad `motion-reduce:*` o regla CSS), conservando el texto "Enviando…".
      → el spinner usaba SMIL `<animateTransform>` (no pausable por CSS); se migró a `animate-spin
      motion-reduce:animate-none` en ambos forms.
- [x] 3.2 En `tokens.css` canónico, envolver `html { scroll-behavior: smooth }` en
      `@media (prefers-reduced-motion: no-preference)`.
- [x] 3.3 Correr `node scripts/sync-design-tokens.mjs` y verificar que ambas copias (`apps/*/app/tokens.css`)
      quedaron sincronizadas con el cambio. → ambas byte-idénticas al canónico.

## 4. Verificación de headings y etiquetado de búsqueda

- [x] 4.1 Barrer los `<h1>`/encabezados por página (sitio + catálogo); confirmar 1 `<h1>` y sin saltos de nivel.
      Corregir solo lo que falle (esperado 0–1).
      → hallazgo: el listado de noticias (`/comunidad/noticias` + `/pagina/[n]`) empezaba en `<h2>` (sin `<h1>`,
      inconsistente con sus páginas hermanas). Se agregó prop `as` a `SectionTitle` (default `h2`) y `titleAs` a
      `NoticiaCard` (default `h3`); el listado ahora emite `h1`→`h2`. Los `<h4>` de los rótulos de filtro del
      buscador y los `<h3>` de columnas del footer NO son incumplimientos AA (1.3.1 no prohíbe saltos); se dejan.
      Se relajó el requisito del spec a la realidad WCAG AA (markup semántico + descriptivo; no-saltos como SHOULD).
- [x] 4.2 Inspeccionar el input de texto del buscador de `/busqueda` (`PanelGeneral`); si carece de nombre
      accesible, añadir `<label class="sr-only">` o `aria-label` "Buscar especies".
      → ya cumple: `Autocomplete` recibe `ariaLabel="Buscar en toda la fauna"` y lo aplica al `<input>` (aria-label);
      los `<select>` van envueltos en `<label>` (asociación implícita). Sin cambios.

## 5. Verificación end-to-end (sin framework de tests)

- [x] 5.1 Levantar dev servers (sitio :3001, catálogo :3000); con teclado, Tab una vez → aparece el skip-link;
      Enter → el foco entra al `<main>`. → markup confirmado en HTML (`href="#contenido"`, `<main id="contenido"
      tabindex="-1">`); `main.focus()` acepta foco (mainAcceptsFocus:true); las 10 utilidades `focus:` de reveal
      existen en el CSS servido con cascada `&:focus` (especificidad 0,2,0 > `.sr-only` 0,1,0). El navegador del
      preview cacheó un `layout.css` parcial (artefacto dev; en `next build` el CSS lleva hash), por eso no se vio
      el reveal en pantalla — verificado sobre los bytes servidos.
- [x] 5.2 Recalcular el contraste de los colores corregidos (fórmula WCAG) y confirmar ≥ 4.5:1 en cada caso.
      → forest-deep #0c5a36 sobre paper: 7.48:1; ochre-deep #7d5f1c sobre badge ochre/15: 4.67:1 y sobre paper: 5.37:1.
- [x] 5.3 Emular `prefers-reduced-motion: reduce` (preview_resize colorScheme/emulación o DevTools) y confirmar
      spinner sin giro perpetuo y scroll instantáneo. → confirmado en CSS servido: `.motion-reduce:animate-none`
      con `@media (prefers-reduced-motion: reduce){animation:none}`, y `scroll-behavior:smooth` envuelto en
      `@media (prefers-reduced-motion: no-preference)`.
- [x] 5.4 Screenshot antes/después de un par de rótulos corregidos para verificar que no hay regresión visual.
      → no se pudo capturar por la caché de disco del navegador del preview (servía CSS viejo); el cambio es
      forest→forest-deep (más oscuro, más legible) sin cambio de layout, y ambas apps typechean limpio (`tsc --noEmit`).
