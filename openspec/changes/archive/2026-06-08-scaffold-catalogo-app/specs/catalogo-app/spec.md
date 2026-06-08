## ADDED Requirements

### Requirement: App del catálogo compila a estático

`apps/catalogo` SHALL ser una app Next.js 15 (App Router, TypeScript) configurada con `output: "export"`, de modo que `npm run build` produzca un directorio `out/` con HTML/CSS/JS estático y sin requerir un servidor Node en runtime. La app NO SHALL usar Cloud Run ni Dockerfile.

#### Scenario: Build estático
- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** se genera `out/` con la app estática y el proceso termina sin errores

#### Scenario: Sin servidor en runtime
- **WHEN** se inspecciona la configuración de despliegue
- **THEN** no existe `Dockerfile` ni rewrite a Cloud Run; Firebase Hosting sirve `out/` directamente

### Requirement: Integración del sistema de diseño

La app SHALL consumir el sistema de diseño canónico: `app/globals.css` SHALL importar Tailwind y los tokens (`@import "tailwindcss";` + `@import "./tokens.css";`), donde `app/tokens.css` se genera con `scripts/sync-design-tokens.mjs`. Las fuentes (Cormorant Garamond + Source Sans 3) SHALL cargarse vía `next/font` desde `lib/fonts.ts` y aplicarse en `<html>`. Las primitivas (`Badge`, `Section`, `SectionTitle`, `Icon`) SHALL existir en `components/ui/` y `lucide-react` SHALL ser dependencia.

#### Scenario: Tokens activos
- **WHEN** un componente usa `bg-forest` o `font-serif`
- **THEN** resuelven a los valores del sistema de diseño (paleta del handoff, Cormorant Garamond)

#### Scenario: Primitivas disponibles
- **WHEN** se importa `Badge`, `Section`, `SectionTitle` o `Icon` desde `components/ui/`
- **THEN** compilan en TypeScript y usan los tokens, sin colores hardcodeados ad hoc

### Requirement: Layout y metadata del catálogo

La app SHALL tener un `app/layout.tsx` con `Header` y `Footer` (en `components/layout/`, portados del handoff) y `metadata`/OpenGraph base con `metadataBase` apuntando a `https://aves.chirimoyo.org`. La app SHALL incluir una página de inicio placeholder que renderice usando los tokens y primitivas del sistema de diseño.

#### Scenario: Home placeholder estilizada
- **WHEN** se ejecuta `npm run dev` y se abre la home
- **THEN** se muestra una página que usa la paleta, tipografía y primitivas del sistema de diseño (no estilos por defecto de Next)

### Requirement: Acceso a contenido en build

La app SHALL incluir `lib/content.ts` que resuelva la raíz del contenido del repo (`content/fauna/`) en build, con la ruta por defecto relativa a la raíz del monorepo y override mediante la variable de entorno `CONTENT_DIR`. En el scaffold puede ser un stub tipado (firma + tipos) sin parsear datos reales.

#### Scenario: Loader resuelve la raíz de contenido
- **WHEN** se invoca el loader de contenido en build
- **THEN** resuelve `content/fauna/` desde la raíz del repo (o desde `CONTENT_DIR` si está definido) sin depender de un contexto Docker

### Requirement: Configuración de despliegue estático

La app SHALL incluir `firebase.json` con `"public": "out"` y un único target de hosting `prod` (sin Cloud Run), `.firebaserc` con el proyecto `chirimoyo` y el target del site de `aves.chirimoyo.org`, y un script `deploy_prod` que ejecute `next build` seguido de `firebase deploy --only hosting:prod`.

#### Scenario: Deploy sirve estáticos
- **WHEN** se revisa `firebase.json`
- **THEN** publica el directorio `out/` directamente, sin rewrite a un servicio de Cloud Run

### Requirement: Convenciones del monorepo

La app SHALL seguir las convenciones del proyecto: alias de import `@/*` a la raíz de la app, `cn()` en `lib/utils.ts` (clsx + tailwind-merge), `components.json` de shadcn, scripts `dev`/`build`/`start`/`lint`/`typecheck`, y NO SHALL introducir `packages/` ni workspaces.

#### Scenario: Alias y utilidades
- **WHEN** se importa desde `@/components/...` o se usa `cn(...)`
- **THEN** resuelven correctamente y `npm run typecheck` pasa

#### Scenario: Sin tooling de monorepo
- **WHEN** se revisa la estructura
- **THEN** la app se construye de forma independiente, sin workspaces ni dependencias hacia otras apps
