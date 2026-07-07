## MODIFIED Requirements

### Requirement: Resolución del token por dominio

El sistema SHALL asociar cada app pública a un único dominio canónico con su propio "site"
(token) de Cloudflare, de modo que las estadísticas se revisen por app. Los dominios cubiertos
SHALL ser `chirimoyo.org` (servido por `apps/sitio`) y `fauna.chirimoyo.org` (servido por
`apps/catalogo`). Los subdominios vanity que redirigen con 301 (`comunidad.chirimoyo.org`,
`voluntarios.chirimoyo.org` → `chirimoyo.org`; `aves.chirimoyo.org` → `fauna.chirimoyo.org`,
según ADR-0023 y ADR-0024) MUST NOT tener un site propio, porque el redirect ocurre antes de que
cargue el beacon y nunca registraría pageviews. El componente SHALL resolver el token según el
host actual (`window.location.hostname`).

#### Scenario: Cada app reporta a su site canónico

- **WHEN** un visitante carga una página de `chirimoyo.org` (incluidas las rutas `/comunidad` y `/voluntarios`)
- **THEN** el pageview se registra con el token configurado para `chirimoyo.org`
- **AND** un visitante de `fauna.chirimoyo.org` se registra con el token de `fauna.chirimoyo.org`, sin mezclarse

#### Scenario: Host sin token configurado

- **WHEN** una app se sirve bajo un host que no tiene token asociado (p. ej. un subdominio vanity antes del 301, preview o localhost)
- **THEN** el beacon de analítica no se carga
- **AND** la página funciona con normalidad sin errores

### Requirement: Configuración por variable de entorno

El sistema SHALL tomar la configuración de analítica (mapa host→token) desde la variable
`NEXT_PUBLIC_CF_BEACON_TOKENS`. Como las variables `NEXT_PUBLIC_*` se **inlinean en tiempo de
build** (`next build`), la configuración SHALL estar presente durante el build de **ambas** apps
(`sitio` y `catalogo`), no en el entorno de runtime. La configuración SHALL versionarse en un
archivo `.env.production` por app (el token de beacon de Cloudflare es público: viaja en el JS
del navegador, por lo que versionarlo no expone ningún secreto), que Next carga automáticamente
en el build de producción. Cuando la configuración esté ausente, la analítica SHALL desactivarse
sin romper la app.

#### Scenario: Sin configuración, sin analítica

- **WHEN** la variable de entorno de analítica no está definida en el build
- **THEN** el componente de analítica no inyecta ningún beacon
- **AND** la app se renderiza y funciona con normalidad

#### Scenario: Build de producción con configuración versionada

- **WHEN** se construye `sitio` o `catalogo` con su `.env.production` presente
- **THEN** el bundle resultante incluye el beacon de Cloudflare con el token del dominio canónico de esa app (`chirimoyo.org` o `fauna.chirimoyo.org` respectivamente)
