## Context

El handoff de v0.dev (`Guia aves chirimoyo-handoff.zip`) entrega un sistema de diseño completo y coherente: paleta derivada del logotipo de la Comunidad Chirimoyo, tipografía editorial, primitivas de UI y una guía de estilo documentada. Hoy el repo tiene el andamiaje pero **ninguna app está scaffoldeada todavía** (#5/#6 pendientes), así que este change no puede escribir un `globals.css` dentro de una app que no existe.

Restricciones del proyecto: Tailwind **v4** (config CSS-first con `@theme`, no el `tailwind.config` v3 del handoff), 2 apps Next que se construyen **independientes**, y la prohibición de `packages/`/workspaces sin ADR ([ADR-0001](../../../docs/decisions/0001-monorepo-layout.md)). El idioma es español, estructura i18n-ready.

## Goals / Non-Goals

**Goals:**
- Una **fuente canónica** del sistema de diseño, versionada y reutilizable, que los scaffolds consuman sin reinventar nada.
- Portar los tokens del handoff (Tailwind v3 → `@theme` v4) sin pérdida de fidelidad visual.
- Mecanismo de compartición entre las 2 apps que **no** introduzca tooling de monorepo.
- Primitivas y guías (voz/tono, accesibilidad) listas para copiar/consumir.

**Non-Goals:**
- Esquema de datos de la ficha de ave (#A01), mapa de distribución (issue nueva), scaffolds de apps (#5/#6/#7), e implementación de páginas.
- Webfont para texto monoespaciado (solo se usa en pies de foto pequeños).

## Decisions

### D1 · Fuente canónica + copia (no paquete compartido)

El sistema de diseño vive en **`docs/design-system/`** como fuente de verdad:

```
docs/design-system/
├── README.md            guía: paleta, tipografía, voz/tono, accesibilidad, uso
├── tokens.css           bloque @theme de Tailwind v4 (CANÓNICO)
├── fonts.ts             snippet next/font (Cormorant Garamond + Source Sans 3)
└── primitives/          componentes de referencia (.tsx): Badge, Section, SectionTitle, Icon
```

Cada app, al scaffoldearse, **copia** `tokens.css` a `app/tokens.css` (importado desde `globals.css` con `@import "./tokens.css";`) y copia las primitivas a `components/ui/`. Un script **`scripts/sync-design-tokens.mjs`** (Node, multiplataforma) propaga el canónico a `apps/*/app/tokens.css`.

- **Por qué**: respeta ADR-0001 (sin paquete/workspaces), cada app sigue construyéndose sola, y la duplicación es de ~50 líneas con una fuente de verdad clara.
- **Alternativa descartada — `packages/design`**: eliminaría la duplicación pero introduce workspaces/tooling de monorepo que el proyecto evitó a propósito; requeriría enmendar ADR-0001. No se justifica para 2 apps.
- **Alternativa descartada — duplicar a mano sin canónico**: barato pero los tokens divergen silenciosamente entre apps. El script de sync lo evita.

### D2 · Tokens en `@theme` de Tailwind v4

Se traduce el `theme.js` (v3) a variables `@theme` v4. Mapeo (nombres → utilidades `bg-*`, `text-*`, `font-*`, `shadow-*`, `rounded-*`):

```css
@import "tailwindcss";
@theme {
  /* Color — verdes dominan; ámbar/terra/teal solo en badges de estado */
  --color-forest: #15824c;  --color-forest-deep: #0c5a36;  --color-forest-soft: #2f9d6a;
  --color-pine: #073d24;    --color-pine-deep: #052e1b;
  --color-mint: #8ed8c0;    --color-mint-soft: #cdeedd;  --color-mint-deep: #46b08c;  --color-mint-wash: #e4f3ec;
  --color-paper: #eef5ef;   --color-paper-card: #ffffff; --color-paper-deep: #e1eee5;
  --color-ink: #143226;     --color-ink-soft: #3a5547;
  --color-ochre: #b08a2e;   --color-terra: #b5543a;      --color-teal: #2f8d77;

  /* Tipografía */
  --font-serif: "Cormorant Garamond", Georgia, serif;
  --font-sans:  "Source Sans 3", system-ui, sans-serif;
  --font-mono:  ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;

  /* Sombras verdosas (no grises) */
  --shadow-card: 0 1px 2px rgba(7,61,36,.04), 0 8px 24px -12px rgba(7,61,36,.22);
  --shadow-soft: 0 1px 2px rgba(7,61,36,.06);
}
```

Más reglas base (de `styles.css`): `body { background: var(--color-paper) }`, `::selection { background: forest; color: #fff }`, utilidades `.placeholder-stripes` y `.pull-quote` (comillas «»). Radios y ritmo usan la escala nativa de Tailwind (`rounded-lg/xl/2xl/full`, `max-w-6xl`, `px-6`, `py-12→16`, `gap-4→6`) — no requieren tokens nuevos, se documentan como convención de uso.

### D3 · Fuentes vía `next/font`; mono del sistema

Cormorant Garamond (serif, pesos 400–700 + itálica) y Source Sans 3 (sans, 300–700) se cargan con `next/font/google` (subset `latin`, `display: swap`), exponiendo variables CSS que alimentan `--font-serif`/`--font-sans`. El **monoespaciado** usa el stack del sistema (`ui-monospace…`) — solo aparece en pies de foto pequeños, así que no vale un webfont extra (rendimiento).

- **Alternativa**: añadir JetBrains Mono (como el proyecto hermano Sociedad Salvaje) — descartada por no cargar un webfont para un uso marginal.

### D4 · Iconos con `lucide-react`

El handoff usa Lucide (trazo ~2px, verde sobre `mint-wash`). En las apps se usa `lucide-react` (no el CDN UMD del prototipo). Los controles interactivos con glifos SVG propios del handoff se recrearán cuando se implementen esas piezas (carrusel/lightbox/play) — fuera de este change.

### D5 · Primitivas como componentes de referencia

`Badge` (tones `forest/ochre/terra/teal` para los ejes de estatus), `Section`, `SectionTitle` y un wrapper `Icon` se entregan como `.tsx` de referencia en `docs/design-system/primitives/`, adaptados a React/TS (los originales son JSX babel-in-browser). Los scaffolds los copian a `components/ui/`. Server Components por defecto; `"use client"` solo donde haya interacción.

## Risks / Trade-offs

- **Deriva entre copias de tokens** → Mitigación: `scripts/sync-design-tokens.mjs` como fuente única + (opcional) un check en CI que falle si las copias difieren del canónico.
- **Tailwind v4 `@theme` es relativamente nuevo** → Mitigación: fijar versión de Tailwind en los scaffolds y validar las utilidades generadas (`bg-forest`, etc.) en una página de prueba.
- **Duplicar primitivas por app** → Aceptable para un set chico; si crece el código compartido real, es el disparador para re-evaluar `packages/` (ya previsto en ADR-0001).
- **Fidelidad del color en badges** → algunos chips del handoff usan hex arbitrarios inline (categorías de búsqueda); se documentan pero su tokenización fina se cierra al implementar el buscador (Fase 1), no aquí.

## Migration Plan

1. Crear `docs/design-system/` con `tokens.css`, `fonts.ts`, `primitives/*.tsx`, `README.md`.
2. Añadir `scripts/sync-design-tokens.mjs` (canónico → `apps/*/app/tokens.css`).
3. (Opcional) ADR cortito: "tokens compartidos por copia desde fuente canónica".
4. Consumo posterior (en #5/#6, fuera de este change): cada scaffold importa `tokens.css`, configura `next/font`, copia primitivas y agrega `lucide-react`.

Rollback: borrar `docs/design-system/` y el script; al no existir apps aún, no hay consumidores que romper.

## Open Questions

- ¿Se quiere el ADR opcional de compartición de tokens, o basta documentarlo en `docs/design-system/README.md`? (Recomendación: documentarlo; ADR solo si luego se cuestiona.)
- ¿Check de CI que verifique sincronía de tokens, o confiar en el script + disciplina? (Se puede añadir en #8 "activar CI".)
