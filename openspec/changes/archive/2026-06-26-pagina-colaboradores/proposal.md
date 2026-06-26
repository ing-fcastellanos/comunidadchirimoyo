## Why

El catálogo de fauna lo hicieron posible biólogos que identificaron especies, fotógrafos de la comunidad y quien lo desarrolló. Hoy ese reconocimiento solo existe disperso como `credito` por foto en cada ficha (y mezclado con atribuciones de licencia externas). Falta una página de **colaboradores** que reconozca al equipo del proyecto de forma explícita y agrupada, coherente con el espíritu comunitario (#77). Es contenido, estático, sin API.

## What Changes

- **Nuevo archivo de contenido curado** `content/fauna/colaboradores.json`: personas agrupadas por **rol** (biólogos, fotografía, desarrollo), cada una con `nombre`, `aporte`/grado y `enlace` opcional. Contenido **real y con consentimiento** (los biólogos los aportó el organizador con su enlace; los fotógrafos ya están acreditados en el proyecto).
- **Loader** `apps/catalogo/lib/colaboradores.ts` que lee el JSON en build (patrón `node:fs` como `content.ts`).
- **Ruta `/colaboradores`** (`app/colaboradores/page.tsx`): Server Component **estático**, con las categorías y sus personas, usando los primitivos visuales existentes del catálogo (no requiere v0.dev). No colisiona con la ruta dinámica `[grupo]` (acotada a aves/anfibios/reptiles con `dynamicParams=false`).
- **`generateMetadata`** (title, description, OpenGraph) para la página.
- **Enlace a `/colaboradores`** desde el **Footer** del catálogo.
- **Nota de reconocimiento** a las fuentes externas (atribuciones CC de iNaturalist y grabaciones de xeno-canto) sin listarlas como colaboradores —su crédito vive en cada ficha—.
- **Documentar el esquema** de `colaboradores.json` en el README de contenido.

## No-goals

- **No** se incluye la categoría **comunidad/voluntarios**: ese reconocimiento irá en su propia ficha en la sección `/comunidad` del sitio (decisión del organizador).
- **No** se auto-agregan los créditos de foto: la página es **curada**. Las atribuciones CC externas y los grabadores de audio (xeno-canto) **no** son colaboradores del proyecto; siguen acreditados per-ficha.
- **No** se suben fotos de los colaboradores en esta versión: tarjetas de texto; el esquema deja `foto` opcional para el futuro.
- **No** se toca el esquema de fichas ni se introduce API (catálogo estático, ADR-0005).

## Capabilities

### New Capabilities
- `pagina-colaboradores`: página estática `/colaboradores` del catálogo que reconoce al equipo del proyecto, agrupado por rol, desde contenido curado en `content/`, enlazada desde el Footer, con metadata propia y sin listar atribuciones de licencia externas.

### Modified Capabilities
<!-- ninguna: catalogo-hub-fauna/landing-catalogo no cambian sus requisitos; solo se añade un enlace en el Footer, que no tiene spec propia -->

## Impact

- **Sub-dominio afectado:** aves (catálogo, `fauna.chirimoyo.org`).
- **Contenido:** nuevo `content/fauna/colaboradores.json` (datos públicos de reconocimiento, con consentimiento; no es PII sensible).
- **Código (`apps/catalogo`):** `lib/colaboradores.ts` (loader + tipos), `app/colaboradores/page.tsx` (página + `generateMetadata`), `components/layout/Footer.tsx` (enlace), posible componente de presentación en `components/`.
- **Docs:** `content/README.md` (esquema de colaboradores).
- **Sin** cambios en API, esquema de fichas, ni convenciones documentadas → **no requiere ADR**.
