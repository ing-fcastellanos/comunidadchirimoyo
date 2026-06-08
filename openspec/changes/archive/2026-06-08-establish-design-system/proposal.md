## Why

Las apps `sitio` y `catalogo` aún no tienen identidad visual y van a construirse pronto (scaffolds de Fase 0). El handoff de v0.dev del catálogo de aves ya define un sistema de diseño completo y coherente, derivado del logotipo de la Comunidad Chirimoyo. Establecerlo **ahora**, antes de los scaffolds, evita que cada app invente su propio estilo y cumple [ADR-0011](../../../docs/decisions/0011-diseno-i18n.md) (el catálogo marca la pauta visual del proyecto).

**Sub-dominios afectados:** `foundation` (define el sistema), consumido por `sitio` y `aves`.

## What Changes

- Se introduce un **sistema de diseño compartido** como capability nueva: tokens, fuentes, primitivas de UI y guías de voz/tono y accesibilidad.
- **Tokens** (color, tipografía, sombra, radio, ritmo) extraídos del `theme.js` (config Tailwind v3 del handoff) y **portados a `@theme` de Tailwind v4** en `globals.css`.
- **Fuente canónica** de los tokens en `docs/design-system/` que se **copia** al `globals.css` de cada app (sin paquete compartido → respeta [ADR-0001](../../../docs/decisions/0001-monorepo-layout.md)). Incluye un script de sincronización para mantener las copias al día.
- **Fuentes** vía `next/font`: Cormorant Garamond (serif), Source Sans 3 (sans), una mono para pies de foto.
- **Iconos**: `lucide-react`.
- **Primitivas de UI** recreadas como componentes reales y reutilizables: `Badge` (tones forest/ochre/terra/teal para los ejes de estatus), `Section`, `SectionTitle`, wrapper de `Icon`.
- **Guías documentadas** de voz/tono (español divulgativo, comillas «», rangos con unidad, señalar incertidumbre; evitar marketing/emojis/gradientes/neón/glassmorphism) y de accesibilidad (WCAG AA, semántica, alt+ARIA, navegación por teclado, foco visible).

> No rompe ninguna convención documentada (no hay paquete compartido). Se recomienda — opcionalmente — un ADR cortito que registre "tokens compartidos por copia desde una fuente canónica" como la decisión de compartición elegida.

### No-goals

- **No** define el esquema de datos de la ficha de ave → va en la issue de Fase 1 "Definir esquema de la ficha" (#A01).
- **No** construye el mapa de distribución por especie → issue nueva de Fase 1.
- **No** hace los scaffolds de las apps (#5/#6/#7) ni implementa páginas; solo entrega los tokens/fuentes/primitivas/guías que esos scaffolds consumirán.
- **No** introduce `packages/`, workspaces ni tooling de monorepo.

## Capabilities

### New Capabilities

- `design-system`: sistema de diseño compartido del proyecto — tokens (`@theme`), fuentes, primitivas de UI compartidas, y guías de voz/tono y accesibilidad; con un mecanismo de compartición por copia desde una fuente canónica.

### Modified Capabilities

<!-- Ninguna. No hay specs previas cuyo comportamiento cambie. -->

## Impact

- **Nuevos archivos**: `docs/design-system/` (fuente canónica de tokens + guía), y al aplicarse en los scaffolds, `app/globals.css` + componentes de primitivas en cada app.
- **Dependencias nuevas (cuando existan las apps)**: `lucide-react`; fuentes vía `next/font` (Cormorant Garamond, Source Sans 3, mono).
- **Scripts**: utilidad de sincronización de tokens (canónico → apps).
- **Consumidores**: scaffolds `apps/sitio` (#5) y `apps/catalogo` (#6) adoptarán estos tokens/primitivas.
- **Documentación**: posible ADR opcional sobre la compartición de tokens por copia.
- **Sin impacto** en `services/api` ni en datos.
