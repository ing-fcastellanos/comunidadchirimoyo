# smoke-catalogo-fauna Specification

## Purpose
TBD - created by archiving change smoke-fauna-e2e. Update Purpose after archive.
## Requirements
### Requirement: Smoke test del catálogo sobre el build estático

El proyecto SHALL proveer un script de smoke test (`apps/catalogo/scripts/smoke-fauna.mts`, ejecutable con `npm run smoke`) que verifique el flujo end-to-end del catálogo **sobre el `out/` ya construido**, sin depender de un servidor en runtime ni de un navegador. El script SHALL terminar con código de salida ≠ 0 si **cualquier** chequeo obligatorio falla, y SHALL emitir un reporte legible con el resultado de cada chequeo (`pass` / `skip` / `fail`). Si `out/index.html` no existe, el script SHALL fallar de inmediato indicando que debe construirse primero. El script NO SHALL introducir dependencias nuevas (usa `tsx`, ya presente, y `fetch` nativo).

#### Scenario: Build sano pasa el smoke

- **WHEN** existe un `out/` recién construido del catálogo y se ejecuta `npm run smoke`
- **THEN** todos los chequeos obligatorios pasan y el script termina con código 0

#### Scenario: Build ausente falla rápido

- **WHEN** se ejecuta el smoke sin un `out/` construido
- **THEN** el script falla (código ≠ 0) indicando que se debe correr `npm run build` primero

### Requirement: Verificación de rutas y enlaces internos

El smoke SHALL afirmar que las **rutas marco** del catálogo existen como artefactos no vacíos en `out/`: el hub (`/`), los índices `/aves`, `/anfibios`, `/reptiles`, la búsqueda `/busqueda`, el buscador de aves `/aves/buscador`, y **al menos un detalle por grupo** (derivado del primer detalle presente de cada grupo, sin hardcodear slugs). El smoke SHALL extraer los **enlaces internos** `/<grupo>/<slug>` del HTML de esas páginas y afirmar que **cada destino resuelve** a un archivo servible en `out/`, respetando `cleanUrls` (`/p` resuelve si existe `out/p.html`, `out/p/index.html` o `out/p`). Enlaces externos, anclas y query strings SHALL ignorarse.

#### Scenario: Todas las superficies cargan

- **WHEN** corre el smoke sobre un `out/` válido
- **THEN** afirma que hub, los tres índices de grupo, la búsqueda, el buscador de aves y un detalle por grupo existen y no están vacíos

#### Scenario: Enlace interno roto falla

- **WHEN** una página marco enlaza a `/<grupo>/<slug>` cuyo archivo no existe en `out/`
- **THEN** el smoke reporta el enlace roto y falla (código ≠ 0)

### Requirement: Integridad de los PDF

El smoke SHALL afirmar que cada guía PDF esperada existe en `out/` (`catalogo-aves-chirimoyo.pdf`, `catalogo-herpetofauna-chirimoyo.pdf`) y es **íntegra**: su contenido comienza con la firma `%PDF` y su tamaño es mayor que cero.

#### Scenario: PDFs presentes e íntegros

- **WHEN** corre el smoke y los dos PDF existen en `out/` empezando con `%PDF`
- **THEN** el chequeo de PDF pasa

#### Scenario: PDF faltante o corrupto falla

- **WHEN** un PDF esperado no existe en `out/` o no empieza con `%PDF`
- **THEN** el smoke reporta el problema y falla (código ≠ 0)

### Requirement: Ausencia de llamadas al API

El smoke SHALL afirmar que **ningún** artefacto servible de `out/` (`.html`, `.js`) referencia una URL del backend, consistente con el catálogo 100% estático (ADR-0005/0006). El patrón de detección SHALL ser configurable y por defecto apuntar al **backend real** (host de Cloud Run, `api.chirimoyo`, o los endpoints `/api/contacto`·`/api/inscripci`), NO al genérico `/api/` —que aparece en el runtime de Next y sería un falso positivo—.

#### Scenario: Catálogo estático sin fugas al API

- **WHEN** corre el smoke sobre el `out/` del catálogo
- **THEN** no encuentra referencias a un API en los artefactos servibles y el chequeo pasa

#### Scenario: Fuga al API falla

- **WHEN** algún `.html`/`.js` de `out/` contiene una URL de API
- **THEN** el smoke reporta el archivo y falla (código ≠ 0)

### Requirement: Verificación opt-in del vanity 301

El smoke SHALL incluir una verificación de red **opt-in** del **vanity** `aves.chirimoyo.org`. Por defecto (sin opt-in) el chequeo SHALL marcarse como **SKIP** —con nota de cómo activarlo— y **NO** SHALL tocar la red, porque el host puede resolver a `200` antes de configurarse el redirect (un auto-intento daría falso fallo). Activado explícitamente (`SMOKE_VANITY=1`), el smoke SHALL hacer una petición HTTP sin seguir redirects y afirmar respuesta **301** con `Location` que empiece por `https://fauna.chirimoyo.org/aves`; cualquier otra respuesta —incluido `200`, un `Location` distinto, o que el host no resuelva/timeout— SHALL **fallar**. El script SHALL liberar limpiamente el timer/recurso de red (terminar con `process.exitCode`, no abortar el proceso con un handle a medio cerrar).

#### Scenario: Vanity no verificado por defecto (no rompe el smoke)

- **WHEN** corre el smoke sin `SMOKE_VANITY=1`
- **THEN** el chequeo del vanity se marca como SKIP con la nota para activarlo, no se toca la red y el smoke no falla por ello

#### Scenario: Vanity configurado correctamente

- **WHEN** con `SMOKE_VANITY=1`, `aves.chirimoyo.org` responde 301 hacia `https://fauna.chirimoyo.org/aves`
- **THEN** el chequeo del vanity pasa

#### Scenario: Vanity mal configurado falla

- **WHEN** con `SMOKE_VANITY=1`, `aves.chirimoyo.org` responde algo distinto del 301 al destino esperado (p. ej. 200) o no resuelve
- **THEN** el smoke reporta la discrepancia y falla (código ≠ 0)

### Requirement: Integración en la cadena de despliegue

El script `smoke` SHALL declararse en `apps/catalogo/package.json` y SHALL engancharse en la cadena `deploy_prod` **después del build y antes del `firebase deploy`**, de modo que un build con superficies rotas, PDF corruptos o fugas al API detenga el despliegue.

#### Scenario: Deploy bloqueado por smoke fallido

- **WHEN** se corre `npm run deploy_prod` y el smoke detecta un fallo obligatorio
- **THEN** la cadena se detiene antes de `firebase deploy`

