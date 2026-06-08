# Sistema de diseño — Comunidad Chirimoyo

Fuente de verdad del diseño del proyecto. Estética **naturalista y editorial** para una guía de campo digital; la paleta nace del **logotipo de la Comunidad Chirimoyo** (verdes de humedal). Derivado del handoff de v0.dev del catálogo de aves. Aplica a **ambas apps** (`sitio` y `catalogo`). Ver [ADR-0011](../decisions/0011-diseno-i18n.md) y [ADR-0013](../decisions/0013-tokens-compartidos-por-copia.md).

## Contenido

| Archivo | Qué es |
|---|---|
| [`tokens.css`](./tokens.css) | **Canónico.** Bloque `@theme` de Tailwind v4 (color, tipografía, sombra) + reglas base |
| [`fonts.ts`](./fonts.ts) | Configuración `next/font` (Cormorant Garamond + Source Sans 3) |
| [`primitives/`](./primitives) | Componentes de referencia: `Badge`, `Section`, `SectionTitle`, `Icon` |

## Cómo lo consume una app (en el scaffold #5/#6)

1. Ejecutar `node scripts/sync-design-tokens.mjs` → copia `tokens.css` a `apps/<app>/app/tokens.css`.
2. En `app/globals.css`: `@import "tailwindcss";` y luego `@import "./tokens.css";`
3. Copiar `fonts.ts` a la app y aplicar las variables en el root layout:
   `<html lang="es" className={\`${serif.variable} ${sans.variable}\`}>`
4. Copiar `primitives/*` a `components/ui/` y añadir la dependencia `lucide-react`.

> **No** editar las copias en `apps/*/app/tokens.css` a mano. Editar este canónico y re-sincronizar.

## Color

~**90% verdes**; los acentos cálidos (ámbar/terra/teal) **solo** en señales de estado (badges). Nunca un acento como fondo de sección.

| Token | Hex | Uso |
|---|---|---|
| `forest` / `forest-deep` / `forest-soft` | `#15824c` / `#0c5a36` / `#2f9d6a` | Títulos, acciones, nombre científico |
| `pine` / `pine-deep` | `#073d24` / `#052e1b` | Bloques inmersivos (canto, lightbox) |
| `mint` / `mint-soft` / `mint-deep` / `mint-wash` | `#8ed8c0` / `#cdeedd` / `#46b08c` / `#e4f3ec` | Acentos, insignias, fondos de icono |
| `paper` / `paper-card` / `paper-deep` | `#eef5ef` / `#ffffff` / `#e1eee5` | Fondo, tarjetas, footer |
| `ink` / `ink-soft` | `#143226` / `#3a5547` | Texto |
| `ochre` · `terra` · `teal` | `#b08a2e` · `#b5543a` · `#2f8d77` | Badges: «Rara» · NOM-059 · «Nativa» |

## Tipografía

| Rol | Familia | Tamaño | Peso |
|---|---|---|---|
| Nombre común (H1) | Cormorant Garamond | 46–82px | 600 |
| Título de sección (H2) | Cormorant Garamond | 34px | 600 |
| Subtítulo / tarjeta (H3) | Cormorant Garamond | 22–24px | 600 |
| Nombre científico | Cormorant Garamond *itálica* | 22–30px | 400 |
| Cuerpo | Source Sans 3 | 16–17px | 400 (interlineado 1.6–1.75) |
| Etiqueta / kicker | Source Sans 3 · versalitas | 11–12px | 700 |
| Pie de foto | Monoespaciada (sistema) | 12–13px | 400 |

## Forma y ritmo

- **Radios** suaves: `rounded-lg / xl / 2xl / full`. Nunca esquinas puntiagudas.
- **Sombras** verdosas (no grises): `shadow-card`, `shadow-soft`.
- **Ritmo**: ancho `max-w-6xl`, padding lateral `px-6`, aire vertical `py-12→16`, gap de tarjetas `gap-4→6`.

## Iconografía

`lucide-react`, trazo ~2px, verde sobre `mint-wash` en contenedores de icono. Glifos SVG propios **solo** en controles interactivos que se re-renderizan (carrusel, lightbox, play).

## Voz y tono

**Hacer:**
- Español divulgativo, claro y preciso; tono de guía de campo.
- Nombre científico en *itálica*; comillas angulares «...».
- Cifras con rango y unidad: «59–70 cm».
- Señalar incertidumbre cuando las fuentes difieren.

**Evitar:**
- Lenguaje comercial o de marketing; datos sin fuente.
- Emojis, gradientes llamativos, neón, glassmorphism.
- Afirmar reproducción local cuando no la hay.

## Accesibilidad (WCAG AA)

- [ ] Contraste AA: texto sobre crema y sobre pino oscuro.
- [ ] HTML semántico real: `header`, `section`, `article`, `figure`, `table`.
- [ ] `alt` en imágenes; `aria-label` en mapas y controles.
- [ ] Navegación por teclado (lightbox: ←/→/Esc) y **foco visible**.

## Compartición de tokens (decisión)

Los tokens se comparten **por copia desde este canónico** (`tokens.css`) hacia cada app vía `scripts/sync-design-tokens.mjs`. **No** hay paquete compartido ni workspaces (respeta [ADR-0001](../decisions/0001-monorepo-layout.md)). Detalle y alternativas en [ADR-0013](../decisions/0013-tokens-compartidos-por-copia.md).

## Validación visual (diferida a los scaffolds)

Cuando exista una app, importar `tokens.css` y comprobar en una página de prueba que las utilidades generadas (`bg-forest`, `text-ink-soft`, `shadow-card`, `font-serif`) coinciden con la guía de estilo del handoff (`pages/guia-de-estilo.html`).
