# design-system Specification

## Purpose
TBD - created by archiving change establish-design-system. Update Purpose after archive.
## Requirements
### Requirement: Fuente canónica del sistema de diseño

El proyecto SHALL mantener una única fuente de verdad del sistema de diseño en `docs/design-system/`, que contenga como mínimo: el bloque de tokens (`tokens.css`), la configuración de fuentes (`fonts.ts`), las primitivas de referencia (`primitives/`) y una guía (`README.md`). Ninguna app SHALL definir tokens de marca por su cuenta; SHALL consumir copias derivadas de esta fuente.

#### Scenario: La fuente canónica existe y es completa
- **WHEN** se inspecciona `docs/design-system/`
- **THEN** existen `tokens.css`, `fonts.ts`, `README.md` y `primitives/` con al menos `Badge`, `Section`, `SectionTitle` e `Icon`

#### Scenario: Una app no redefine tokens de marca
- **WHEN** se revisa el `globals.css` de cualquier app
- **THEN** los tokens de color/tipografía provienen de un `tokens.css` copiado del canónico, no de valores hardcodeados ad hoc

### Requirement: Paleta de color tokenizada

El sistema SHALL exponer la paleta del handoff como tokens `@theme` de Tailwind v4, generando utilidades `bg-*` / `text-*` / `ring-*`. La paleta SHALL incluir las familias `forest`, `pine`, `mint`, `paper`, `ink` y los acentos `ochre`, `terra`, `teal`, con los valores hex exactos del handoff. La guía SHALL establecer que los verdes dominan (~90% de la superficie) y los acentos cálidos se usan solo en señales de estado.

#### Scenario: Los tokens generan utilidades
- **WHEN** una app importa `tokens.css` y usa la clase `bg-forest` o `text-ink-soft`
- **THEN** Tailwind v4 resuelve el color al hex correspondiente del handoff (`#15824c`, `#3a5547`)

#### Scenario: Fidelidad de la paleta
- **WHEN** se comparan los hex de `tokens.css` con `theme.js` del handoff
- **THEN** coinciden exactamente para todas las familias y acentos

### Requirement: Tipografía editorial

El sistema SHALL definir tres roles tipográficos: serif (Cormorant Garamond) para títulos, nombres y citas; sans (Source Sans 3) para cuerpo y etiquetas; y monoespaciada para pies de foto. Las fuentes serif y sans SHALL cargarse vía `next/font` (subset `latin`). El nombre científico SHALL renderizarse en serif itálica.

#### Scenario: Roles tipográficos disponibles
- **WHEN** una app aplica `font-serif`, `font-sans` o `font-mono`
- **THEN** resuelven a Cormorant Garamond, Source Sans 3 y el stack monoespaciado del sistema respectivamente

#### Scenario: Carga optimizada de fuentes
- **WHEN** se construye una app que consume el sistema
- **THEN** Cormorant Garamond y Source Sans 3 se cargan vía `next/font` (no por `<link>` a un CDN) y la monoespaciada usa el stack del sistema sin webfont adicional

### Requirement: Sombras, radios y ritmo

El sistema SHALL definir sombras verdosas (`shadow-card`, `shadow-soft`) como tokens y SHALL documentar las convenciones de radio (`rounded-lg/xl/2xl/full`, nunca esquinas puntiagudas) y de ritmo de layout (`max-w-6xl`, `px-6`, `py-12→16`, `gap-4→6`).

#### Scenario: Sombras tokenizadas
- **WHEN** una app usa `shadow-card`
- **THEN** aplica la sombra verdosa exacta del handoff, no una sombra gris por defecto

### Requirement: Compartición por copia desde la fuente canónica

El sistema SHALL proveer un script (`scripts/sync-design-tokens.mjs`) que copie `docs/design-system/tokens.css` a `apps/*/app/tokens.css`. El proyecto NO SHALL introducir `packages/` ni workspaces para compartir el diseño. Tras correr el script, las copias en las apps SHALL ser idénticas al canónico.

#### Scenario: Sincronización produce copias idénticas
- **WHEN** se ejecuta `node scripts/sync-design-tokens.mjs` con apps existentes
- **THEN** cada `apps/<app>/app/tokens.css` es byte-idéntico a `docs/design-system/tokens.css`

#### Scenario: Sin tooling de monorepo
- **WHEN** se revisa la solución de compartición
- **THEN** no existe `packages/`, ni configuración de workspaces, ni dependencia entre apps (se respeta ADR-0001)

### Requirement: Primitivas de UI compartidas

El sistema SHALL proveer como componentes de referencia (TypeScript/React): `Badge` con tonos `forest`, `ochre`, `terra` y `teal` (uno por eje de estatus), `Section`, `SectionTitle` (con kicker e icono opcional) y un wrapper `Icon`. Las primitivas SHALL ser Server Components salvo que requieran interacción del navegador.

#### Scenario: Badge cubre los ejes de estatus
- **WHEN** se renderiza `<Badge tone="terra">` y `<Badge tone="teal">`
- **THEN** aplican los estilos del handoff para conservación (terra) y distribución (teal) respectivamente

#### Scenario: Primitivas consumibles por los scaffolds
- **WHEN** un scaffold copia las primitivas a `components/ui/`
- **THEN** compilan en TypeScript y usan los tokens del sistema sin colores hardcodeados

### Requirement: Iconografía

El sistema SHALL estandarizar `lucide-react` como librería de iconos, con trazo ~2px, presentados en verde sobre fondo `mint-wash` en contenedores de icono. La guía SHALL indicar usar glifos SVG propios solo en controles interactivos que se re-renderizan.

#### Scenario: Librería de iconos definida
- **WHEN** una app necesita un icono decorativo
- **THEN** usa `lucide-react`, no el CDN UMD del prototipo

### Requirement: Guías de voz/tono y accesibilidad

El sistema SHALL documentar en `docs/design-system/README.md` las reglas de voz/tono (español divulgativo, nombre científico en itálica, comillas angulares «», cifras con rango y unidad, señalar incertidumbre cuando las fuentes difieren; evitar marketing, emojis, gradientes llamativos, neón y glassmorphism) y las bases de accesibilidad (contraste WCAG AA, HTML semántico, `alt` y `aria-label`, navegación por teclado, foco visible).

#### Scenario: Guías presentes y accionables
- **WHEN** un implementador consulta `docs/design-system/README.md`
- **THEN** encuentra reglas concretas de voz/tono y un checklist de accesibilidad WCAG AA aplicables a sitio y catálogo

