# ADR-0022 — Toolchain de Node fijo y compartido (CI = local) para lockfiles reproducibles

- **Estado:** Accepted
- **Fecha:** 2026-06-15
- **Decisores:** @ing-fcastellanos
- **Issue:** recurrente en CI (`npm ci` desincronizado en `sitio` y `catalogo`)

## Contexto

El CI (`.github/workflows/ci-frontend.yml`) instala dependencias con `npm ci`, que
**exige** que `package-lock.json` esté en sync con el árbol que npm deriva de
`package.json`. El workflow fijaba `node-version: 22` (que trae **npm 10.9.8**),
pero el entorno local **no estaba fijado** — un desarrollador en Node 24 usa
**npm 11**.

Distintas versiones de npm resuelven de forma distinta las dependencias
**opcionales/transitivas wasm** — en particular las `@emnapi/*` (fallback de
`eslint` vía su resolver `unrs`, de `tailwindcss` oxide y de `sharp`). Resultado:
al regenerar el lock en local (npm 11) quedaba desincronizado respecto a lo que el
CI (npm 10.9.8) esperaba, y `npm ci` fallaba con
`Missing: @emnapi/...@x.y.z from lock file`. El problema reaparecía en ambas apps
porque la causa no es una dependencia concreta sino la **falta de un toolchain
fijo y compartido**.

## Decisión

Una **única fuente de verdad** para la versión del toolchain, aplicada en CI y en
local:

1. **`.nvmrc`** en la raíz fija la versión de Node (**24.12.0**). El CI la lee con
   `node-version-file: .nvmrc` (en vez de `node-version` hardcodeado), de modo que
   CI y local **no pueden divergir**; subir de versión = editar un archivo. Node
   24.12.0 trae **npm 11.6.2**, que pasa a ser la versión común.
2. **`engines.node` = `>=24.0.0 <25.0.0`** en cada `package.json`, y **`.npmrc`
   raíz con `engine-strict=true`**: si alguien usa otro Node mayor, `npm install`
   **falla en el acto** en vez de generar un lock corrupto en silencio. Ataca el
   problema en el origen.
3. **`overrides`** en cada app fijando `@emnapi/core`, `@emnapi/runtime` y
   `@emnapi/wasi-threads` — endurecimiento extra para ese punto conocido de
   no-determinismo en lockfiles npm (deps wasm opcionales que no se usan cuando hay
   binding nativo).
4. Ambos lockfiles se **regeneran con el toolchain fijo** (Node 24 / npm 11.6.2) y
   se verifican con `npm ci` en limpio.

Estándar **Node 24** (no 22): es la versión que ya usa el equipo en local y es LTS;
se elige alinear "hacia adelante" en vez de obligar a bajar de versión.

## Alternativas consideradas

- **Fijar a Node 22 (igualar al CI actual):** menos cambios en el CI, pero obliga al
  equipo a bajar de versión local. Descartada por fricción; se prefiere 24.
- **Solo `overrides` de `@emnapi` sin fijar el toolchain:** parchea el síntoma de
  hoy, pero otra dep opcional puede driftear mañana con otra versión de npm. No
  resuelve la causa. Se mantiene como endurecimiento, no como solución única.
- **`packageManager` + Corepack para fijar npm exacto:** fija también el parche de
  npm, pero añade un paso (`corepack enable`) y superficie en CI. Fijar Node 24 ya
  acota npm a la familia 11.x; se deja Corepack como opción futura si hiciera falta
  precisión de parche.
- **`engine-strict` solo como advertencia:** no previene generar un lock
  desincronizado. Descartada; se elige estricto.

## Consecuencias

### Positivas

- `npm ci` reproducible entre máquinas y CI: una sola versión de Node/npm en juego.
- El drift se detecta en `npm install` (engine-strict), no en el CI tras el push.
- Aplica a `sitio` y `catalogo` por igual; cubre futuras apps Next del monorepo.
- Subir de versión de Node es un cambio de una línea (`.nvmrc`) que arrastra al CI.

### Negativas

- El equipo debe usar **Node 24** en local (vía `nvm use` / `.nvmrc`); con
  `engine-strict` un Node distinto bloquea `npm install`.
- Los `overrides` de `@emnapi` requieren revisión si una dep sube su rango (poco
  frecuente; son deps wasm de fallback).

### Neutras

- El servicio `services/api` (Python) no se ve afectado; `.nvmrc`/`.npmrc` solo
  aplican a las apps Node.

## Plan de revisión

Si en el futuro se necesita precisión de **parche** de npm (no solo el mayor),
adoptar `packageManager` + `corepack enable` en el CI. Reconsiderar la versión de
Node cuando 24 deje de ser LTS (editar `.nvmrc` y regenerar locks).

## Referencias

- [ADR-0009](0009-ci-checks-deploy-manual.md) (CI de checks + deploy manual),
  [ADR-0001](0001-monorepo-layout.md) (cada app se construye independiente).
- `.nvmrc`, `.npmrc`, `.github/workflows/ci-frontend.yml`,
  `apps/{sitio,catalogo}/package.json`.
