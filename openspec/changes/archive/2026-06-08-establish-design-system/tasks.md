<!-- Fuente visual: handoff de v0.dev en
     C:\Users\Frank\Downloads\chirimoyo-handoff\guia-aves-chirimoyo\project\
     (theme.js, styles.css, components/_shared.jsx, pages/guia-de-estilo.html) -->

## 1. Tokens canónicos

- [x] 1.1 Crear `docs/design-system/tokens.css` con `@import "tailwindcss";` + bloque `@theme` portando la paleta de `theme.js` (familias forest/pine/mint/paper/ink + acentos ochre/terra/teal) a variables `--color-*`
- [x] 1.2 Añadir tokens de tipografía (`--font-serif`, `--font-sans`, `--font-mono`) y de sombra (`--shadow-card`, `--shadow-soft`) en el mismo `@theme`
- [x] 1.3 Añadir reglas base de `styles.css`: `body` con fondo `paper`, `::selection` verde, utilidades `.placeholder-stripes` y `.pull-quote` (comillas «»), `scroll-behavior: smooth`
- [x] 1.4 Verificar fidelidad: cada hex en `tokens.css` coincide exactamente con `theme.js` del handoff

## 2. Fuentes

- [x] 2.1 Crear `docs/design-system/fonts.ts`: snippet `next/font/google` para Cormorant Garamond (400–700 + itálica) y Source Sans 3 (300–700), subset `latin`, `display: 'swap'`, exponiendo variables CSS que alimentan `--font-serif`/`--font-sans`
- [x] 2.2 Documentar que la monoespaciada usa el stack del sistema (sin webfont) y que el nombre científico va en serif itálica

## 3. Primitivas de referencia

- [x] 3.1 Crear `docs/design-system/primitives/Badge.tsx` con tones `forest`/`ochre`/`terra`/`teal` (mapeados de `_shared.jsx`), tipado TypeScript
- [x] 3.2 Crear `docs/design-system/primitives/Section.tsx` y `SectionTitle.tsx` (con `kicker` e `icon` opcionales)
- [x] 3.3 Crear `docs/design-system/primitives/Icon.tsx` como wrapper de `lucide-react`
- [x] 3.4 Asegurar que las primitivas son Server Components (sin `"use client"`) y no usan colores hardcodeados fuera de los tokens

## 4. Guía documentada

- [x] 4.1 Crear `docs/design-system/README.md` con: paleta y regla de uso (~90% verdes; acentos solo en estado), escala tipográfica, radios/sombras/ritmo
- [x] 4.2 Añadir sección de voz/tono (español divulgativo, itálica científica, comillas «», rangos con unidad, señalar incertidumbre; evitar marketing/emojis/gradientes/neón/glassmorphism)
- [x] 4.3 Añadir checklist de accesibilidad WCAG AA (contraste, semántica, alt+ARIA, teclado, foco visible)
- [x] 4.4 Documentar cómo consume el sistema un scaffold (importar `tokens.css`, configurar `fonts.ts`, copiar primitivas, añadir `lucide-react`)

## 5. Compartición por copia

- [x] 5.1 Crear `scripts/sync-design-tokens.mjs` (Node): copia `docs/design-system/tokens.css` → `apps/*/app/tokens.css`; idempotente; tolera apps inexistentes
- [x] 5.2 Documentar el script en `scripts/README.md` (uso y cuándo correrlo)
- [x] 5.3 Verificar que la copia generada es byte-idéntica al canónico

## 6. Decisión de compartición

- [x] 6.1 Registrar la decisión "tokens compartidos por copia desde fuente canónica" en `docs/design-system/README.md` (y opcionalmente como ADR cortito en `docs/decisions/`)
- [x] 6.2 Si se crea ADR, actualizar el índice en `docs/adr/_index.md`

## 7. Verificación

- [x] 7.1 Confirmar que `docs/design-system/` contiene `tokens.css`, `fonts.ts`, `README.md` y `primitives/` (Badge, Section, SectionTitle, Icon)
- [x] 7.2 Anotar el plan de validación visual diferido a los scaffolds (#5/#6): importar `tokens.css` y comprobar utilidades (`bg-forest`, `text-ink-soft`, `shadow-card`) en una página de prueba contra la guía de estilo del handoff
