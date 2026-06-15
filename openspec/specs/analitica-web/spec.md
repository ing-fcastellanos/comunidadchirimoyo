# analitica-web Specification

## Purpose
TBD - created by archiving change analitica-privada-cloudflare. Update Purpose after archive.
## Requirements
### Requirement: Analítica web sin rastreo en las apps públicas

El sistema SHALL integrar analítica web mediante Cloudflare Web Analytics (beacon JS) en las apps de cara al público (`sitio` y `catalogo`). La analítica SHALL registrar únicamente métricas agregadas (p. ej. pageviews) y MUST NOT establecer cookies, MUST NOT recolectar datos personales (PII) y MUST NOT requerir banner de consentimiento.

#### Scenario: Carga del beacon de analítica en producción

- **WHEN** un visitante carga cualquier página de `sitio` o `catalogo` con la configuración de analítica presente
- **THEN** el navegador carga el beacon de Cloudflare Web Analytics vía `next/script`
- **AND** se registra el pageview en el "site" de Cloudflare correspondiente

#### Scenario: Sin cookies ni datos personales

- **WHEN** un visitante navega por las apps con la analítica activa
- **THEN** no se establece ninguna cookie de rastreo ni almacenamiento en el navegador
- **AND** no se recolecta ni transmite ningún dato personal identificable
- **AND** no se muestra ningún banner de consentimiento

### Requirement: Resolución del token por dominio

El sistema SHALL asociar cada dominio público a un token de beacon distinto de Cloudflare (un "site" por dominio), de modo que las estadísticas se revisen por dominio. Los dominios cubiertos SHALL ser `chirimoyo.org`, `comunidad.chirimoyo.org`, `voluntarios.chirimoyo.org` (servidos por `apps/sitio`) y `aves.chirimoyo.org` (`apps/catalogo`).

#### Scenario: Cada subdominio reporta a su propio site

- **WHEN** un visitante carga una página bajo `comunidad.chirimoyo.org`
- **THEN** el pageview se registra con el token configurado para `comunidad.chirimoyo.org`
- **AND** no se mezcla con las métricas de los otros dominios

#### Scenario: Host sin token configurado

- **WHEN** una app se sirve bajo un host que no tiene token asociado (p. ej. preview o localhost)
- **THEN** el beacon de analítica no se carga
- **AND** la página funciona con normalidad sin errores

### Requirement: Configuración por variable de entorno

El sistema SHALL tomar la configuración de analítica (mapa host→token) desde la variable de entorno `NEXT_PUBLIC_CF_BEACON_TOKENS`. La configuración SHALL inyectarse en el build de `catalogo` y en el entorno de Cloud Run de `sitio`. Cuando la configuración esté ausente, la analítica SHALL desactivarse sin romper la app.

#### Scenario: Sin configuración, sin analítica

- **WHEN** la variable de entorno de analítica no está definida
- **THEN** el componente de analítica no inyecta ningún beacon
- **AND** la app se renderiza y funciona con normalidad

#### Scenario: Build de catálogo con configuración

- **WHEN** se construye `catalogo` con `NEXT_PUBLIC_CF_BEACON_TOKENS` definida
- **THEN** el export estático resultante incluye el beacon de Cloudflare con el token de `aves.chirimoyo.org`

### Requirement: Transparencia en el aviso de privacidad

El aviso/página de privacidad de `sitio` SHALL declarar de forma legible que se usa analítica agregada sin rastreo ni datos personales. La declaración MUST ser coherente con ADR-0020 y ADR-0012.

#### Scenario: El visitante puede leer la práctica de analítica

- **WHEN** un visitante abre el aviso/página de privacidad
- **THEN** encuentra una declaración de que se usa analítica agregada sin cookies de rastreo ni recolección de datos personales

