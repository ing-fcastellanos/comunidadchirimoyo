## ADDED Requirements

### Requirement: Validación ejecutable del esquema en todos los grupos

El proyecto SHALL proveer un comando de validación (`npm run validate:fichas` en `apps/catalogo`) que recorra **todos** los grupos del catálogo (`aves`, `anfibios`, `reptiles`) y, por cada ficha, **acumule y reporte** sus problemas en vez de abortar al primero. Cada problema SHALL tener una severidad `error` o `warning`. El comando SHALL imprimir un reporte agrupado por ficha (grupo/slug → campo → mensaje) y SHALL terminar con código de salida ≠ 0 si existe al menos un problema de severidad `error`; los `warning` SHALL informarse sin alterar el código de salida.

La lógica de validación SHALL vivir en un **único módulo puro server-only** (`apps/catalogo/lib/fauna-validate.ts`, sin `node:fs`/`node:path`), expuesto como `validarFicha(data, cuerpo, ctx): Problema[]`. Tanto el loader del catálogo (`apps/catalogo/lib/content.ts`) como el script de validación SHALL reusar esa misma función — el loader filtrando los problemas de severidad `error` y lanzando en build (back-compat), el script acumulando todos. NO SHALL existir una segunda lista de reglas de validación duplicada en el loader.

#### Scenario: Validación recorre los tres grupos
- **WHEN** se ejecuta `npm run validate:fichas`
- **THEN** se validan las fichas de `content/fauna/{aves,anfibios,reptiles}/` y se reporta un resumen por ficha

#### Scenario: Acumula problemas por ficha en vez de abortar
- **WHEN** una ficha tiene dos campos inválidos
- **THEN** el reporte lista ambos problemas para esa ficha (no se detiene en el primero)

#### Scenario: Errores rompen el comando
- **WHEN** al menos una ficha tiene un problema de severidad `error`
- **THEN** el comando termina con código de salida ≠ 0

#### Scenario: Solo warnings no rompen el comando
- **WHEN** las fichas únicamente tienen problemas de severidad `warning`
- **THEN** el comando reporta los warnings y termina con código de salida 0

#### Scenario: Una sola fuente de la lógica de validación
- **WHEN** se inspeccionan el loader y el script de validación
- **THEN** ambos invocan `validarFicha` de `lib/fauna-validate.ts` y no replican las reglas de validación

### Requirement: Cobertura de checks del validador

El validador SHALL clasificar como **`error`** (rompen CI) los siguientes incumplimientos:

- **Núcleo y `genero`:** ausencia de cualquier campo obligatorio del esquema (`slug`, `grupo`, `categoria`, `nombreComun`, `nombreCientifico`, `orden`, `familia`, `genero`, `estatusMigratorio`, `gradoOcurrencia`, `estatusDistribucion`, `conservacion.nom059`, `fuentes` con ≥1, `fotos` con ≥1) o ausencia de la sección `## Descripción`. En particular, `genero` SHALL validarse como obligatorio (sin sustituirse silenciosamente por cadena vacía).
- **Enums:** valor fuera de rango en `grupo` (`aves`|`anfibios`|`reptiles`), `estatusMigratorio`, `gradoOcurrencia`, `estatusDistribucion` y `conservacion.nom059`.
- **`categoria` group-aware:** `categoria` que no pertenezca al vocabulario del `grupo` de la ficha (aves → gremios ecológicos; anfibios → `Anuros`|`Salamandras`; reptiles → `Lagartijas`|`Serpientes`|`Tortugas`).
- **Medios:** alguna entrada de `fotos` sin `credito` o sin `alt`.
- **Slug:** `slug` duplicado en todo el catálogo, o `slug` que no coincide con el nombre de su carpeta.
- **Rangos y vocabularios cerrados:** `temporada.meses` con algún valor fuera de 1–12; o un valor fuera de su lista cerrada en `forma`, `tamano`, `colores` o `donde` cuando el campo esté presente.

El validador SHALL clasificar como **`warning`** (informan, no rompen CI): que la portada (`fotos[0]`) no coincida con la foto curada de la ficha en `apps/catalogo/print/photo-selections.json` cuando exista una selección curada (emparejada por *stem*, sin extensión, case-insensitive).

#### Scenario: Categoría ajena al grupo es error
- **WHEN** una ficha de `grupo: reptiles` declara `categoria: Vadeadoras`
- **THEN** el validador reporta un `error` de categoría para esa ficha

#### Scenario: genero ausente es error
- **WHEN** una ficha omite `genero`
- **THEN** el validador reporta un `error` (no se sustituye por cadena vacía)

#### Scenario: Foto sin crédito o alt es error
- **WHEN** una entrada de `fotos` carece de `credito` o de `alt`
- **THEN** el validador reporta un `error` de medios para esa ficha

#### Scenario: Slug duplicado o desalineado es error
- **WHEN** dos fichas resuelven al mismo `slug`, o el `slug` no coincide con el nombre de la carpeta
- **THEN** el validador reporta un `error` de slug

#### Scenario: Mes fuera de rango es error
- **WHEN** `temporada.meses` contiene un valor fuera de 1–12
- **THEN** el validador reporta un `error`

#### Scenario: Vocabulario visual fuera de lista es error
- **WHEN** una ficha declara `colores` con un valor fuera de la lista cerrada
- **THEN** el validador reporta un `error`

#### Scenario: Portada no curada es solo warning
- **WHEN** existe selección curada para la ficha en `photo-selections.json` y `fotos[0]` no casa con ella por *stem*
- **THEN** el validador reporta un `warning` (no rompe CI)

### Requirement: Integración del validador al CI y al deploy

El workflow `.github/workflows/ci-frontend.yml` SHALL ejecutar `npm run validate:fichas` como parte de los checks, restringido al slot `catalogo` de la matriz (no SHALL correr para `sitio`) y solo cuando la app exista en disco. Un problema de severidad `error` en cualquier ficha SHALL hacer fallar el check (ADR-0009: CI de checks, deploy manual). Además, el script `deploy_prod` de `apps/catalogo` SHALL ejecutar `npm run validate:fichas` antes de construir y desplegar, de modo que un deploy manual con fichas inválidas se aborte antes de publicar.

#### Scenario: CI valida las fichas en el slot catalogo
- **WHEN** corre CI Frontend para `apps/catalogo`
- **THEN** se ejecuta `npm run validate:fichas` y el job falla si alguna ficha tiene un `error`

#### Scenario: CI no valida fichas en el slot sitio
- **WHEN** corre CI Frontend para `apps/sitio`
- **THEN** no se ejecuta el validador de fichas

#### Scenario: deploy_prod aborta con fichas inválidas
- **WHEN** se ejecuta `npm run deploy_prod` y alguna ficha tiene un problema de severidad `error`
- **THEN** el validador termina con código ≠ 0 y la cadena de deploy se detiene antes de construir/publicar
