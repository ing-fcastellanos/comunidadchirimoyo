## Context

La accesibilidad de ambas apps está en ~90% de WCAG 2.1 AA: los componentes interactivos
(`InscripcionForm`, `ContactoForm`, `MobileNav`, `Lightbox`) ya traen focus trap, `aria-*`,
gestión y restauración de foco, y el hero respeta `prefers-reduced-motion`. Los huecos son
puntuales y ya están medidos (ver exploración de #25-B):

- **Skip-link:** 0 ocurrencias en el repo; `<main>` sin `id` en los dos `layout.tsx`.
- **Contraste (medido con la fórmula WCAG):**
  - `text-forest` #15824c sobre `paper` #eef5ef → **4.38:1** (FALLA texto normal 4.5:1).
  - `text-forest` sobre `mint-wash`/`paper-deep` (aún más claros) → también falla.
  - `text-forest` sobre `paper-card` blanco → 4.85:1 (PASA; así se usa en botones).
  - `forest-deep` #0c5a36 sobre `paper` → 7.48:1 (PASA holgado) → destino del fix.
  - `ink`, `ink-soft`, `terra-deep`/`terra-wash` → todos ≥ 5.88:1 (OK, no se tocan).
- **reduced-motion:** el spinner SVG de los forms (`animateTransform`) y el
  `scroll-behavior: smooth` global (en `tokens.css`) no lo respetan.
- **Headings / label del buscador:** se ven bien; requieren barrido de confirmación.

Grep: ~51 usos de `text-forest` "pelado". La mayoría es el patrón
`text-[12px] font-bold uppercase … text-forest` (rótulos de sección) sobre fondos claros.

## Goals / Non-Goals

**Goals:**
- Cerrar el gap Nivel A confirmado (skip-link) en ambas apps con un patrón idéntico.
- Llevar todo el texto pequeño de acento a ≥ 4.5:1 sin tocar la paleta canónica.
- Respetar `prefers-reduced-motion` en las animaciones no esenciales restantes.
- Confirmar (y corregir si aplica) jerarquía de headings y label del buscador.
- Verificación reproducible sin framework de tests (grep + fórmula WCAG + inspección DOM).

**Non-Goals:**
- Cambiar el token `--color-forest` ni cualquier valor de `design-system`/`tokens.css` de color.
- Auditoría AAA exhaustiva o checklist página-por-página firmado.
- Introducir librerías/tests de a11y (axe, jest-axe).
- Tocar `services/api`, los PDFs de impresión del catálogo, o PII.

## Decisions

### 1. Skip-link: patrón sr-only-focusable en el shell, no por componente
Se agrega, como **primer hijo del `<body>`** en cada `layout.tsx`, un
`<a href="#contenido">` con clases utilitarias que lo mantienen fuera de pantalla salvo al
recibir foco (`sr-only` + override en `:focus`), y se añade `id="contenido"` (+ `tabIndex={-1}`
para que el `<main>` acepte el foco programático) al `<main>`. Va en el shell porque aplica a
todas las páginas; no se duplica por página. Texto: "Saltar al contenido".
**Por qué no un componente compartido entre apps:** las apps no comparten código (sin workspaces,
ADR-0001); se replica el mismo bloque en cada `layout.tsx` (≈5 líneas), coherente con cómo ya
se duplican `Header`/`Footer`.

### 2. Contraste: corregir en el sitio de uso, no en el token
Se reasignan a `text-forest-deep` **solo** los usos de `text-forest` que sean **texto** (no
íconos ni `accent-*`) y estén sobre fondos claros verdosos (`paper`, `paper-deep`, `mint-wash`,
`mint-soft`). Se excluyen: íconos (`<Icon … text-forest />`, cubiertos por 1.4.11 a 3:1),
`accent-forest`/`border-forest` de checkboxes, y `text-forest` sobre `paper-card` blanco (ya PASA).
**Por qué no oscurecer `--color-forest`:** el token pasa 4.85:1 sobre blanco y define la identidad
de marca (botones, acentos); oscurecerlo tendría blast radius global, obligaría a re-sincronizar
`sync-design-tokens.mjs` y sería un cambio de `design-system` (otra capability). El fix en el
sitio de uso es quirúrgico y reversible. Como los rótulos comparten el patrón
`text-[12px] font-bold uppercase … text-forest`, el grep los localiza de forma fiable.

### 3. reduced-motion: media query, no JS
- **Spinner de forms:** envolver la animación de giro para que bajo `prefers-reduced-motion: reduce`
  no gire (el estado "Enviando…" + `aria-live` ya comunican progreso sin movimiento). Se hace con
  una utilidad CSS (`motion-reduce:*` de Tailwind, o regla en `globals.css`), no tocando el SVG por prop.
- **scroll-smooth:** envolver `html { scroll-behavior: smooth }` de `tokens.css` en
  `@media (prefers-reduced-motion: no-preference)` para que sea instantáneo al pedir menos movimiento.
  Se edita `tokens.css` canónico y se re-sincroniza a ambas apps con `sync-design-tokens.mjs`
  (regla base, no token de color → no viola el Non-Goal).

### 4. Headings y label del buscador: verificar, corregir mínimo
Barrido de `<h1>`/`<h2>`/… por página (grep + inspección). Resultado: el label del buscador YA
cumple (`Autocomplete` aplica `aria-label` al input; los selects van en `<label>`). En headings,
el único hueco fue el **listado de noticias sin `<h1>`** (empezaba en `<h2>`, inconsistente con sus
hermanas): se corrige dando nivel configurable a `SectionTitle` (`as`) y `NoticiaCard` (`titleAs`),
quedando `h1`→`h2`. Los `<h4>` de rótulos de filtro del buscador y los `<h3>` de columnas del footer
**no** se tocan: WCAG 1.3.1/2.4.6 no prohíben saltar niveles, y refactorizarlos sería churn en la UX
de búsqueda por una mejora no-normativa. El requisito del spec se relaja de "exactamente un h1 / sin
saltos" (más estricto que AA) a "markup semántico + descriptivo, h1 para el título principal, no-saltos
como SHOULD".

### 5. ochre-deep: token derivado nuevo (revela un 2º fallo de contraste)
Durante la auditoría de contraste (decisión 2) apareció un fallo no previsto: el badge "Próximamente"
de grupos sin fichas usa `text-ochre` sobre `bg-ochre/15` = **2.53:1** (falla texto AA). El design-system
ya tiene el patrón `terra-deep` (texto AA sobre `terra-wash`), pero no un equivalente ochre. Se agrega
`--color-ochre-deep #7d5f1c` al `tokens.css` canónico (4.67:1 sobre el badge, 5.37:1 sobre paper) y se
usa en el badge. **Nota:** esto cruza el Non-goal "no alterar la paleta de design-system", pero con
aprobación explícita del usuario; blast radius ~cero (nada más lo consume) y es consistente con el
precedente `terra-deep`. No requiere delta del spec `design-system` (los derivados AA como `terra-deep`
ya coexisten sin figurar en la enumeración de la paleta base del handoff).

## Risks / Trade-offs

- **Verificación de contraste sin herramienta automatizada:** se mitiga con la fórmula WCAG ya
  aplicada (valores en Context) y grep exhaustivo; el riesgo es omitir un uso con fondo no obvio
  (p. ej. `text-forest` sobre una imagen). Mitigación: revisar cada hit del grep con su contenedor.
- **Regresión visual sutil:** `forest-deep` es más oscuro; en rótulos chicos el cambio es apenas
  perceptible y mejora legibilidad. Riesgo bajo; se revisa con screenshot antes de PR.
- **Duplicar el skip-link en dos apps** implica que un cambio futuro se hace dos veces; aceptado
  por la política de "sin tooling de monorepo" (ADR-0001), consistente con Header/Footer.
- **`sync-design-tokens.mjs`:** editar `tokens.css` sin re-sincronizar dejaría las apps
  desalineadas; la tarea incluye correr el script y verificar el diff en ambas copias.
