# Arquitectura — Visión general

Componentes del sistema a alto nivel. Para decisiones concretas de stack ver los [ADRs](../adr/_index.md).

## Componentes

```
                     ┌──────────────────────────────┐
                     │   Visitantes y voluntarios   │
                     └──────────────────────────────┘
                          │           │           │
            ┌─────────────┘           │           └─────────────┐
            ▼                         ▼                         ▼
   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
   │  chirimoyo.org  │      │   comunidad.*   │      │  voluntarios.*  │
   │    (landing)    │      │ (historia/news) │      │   (jornadas)    │
   └────────┬────────┘      └────────┬────────┘      └────────┬────────┘
            └──────────────── apps/sitio ───────────────────┘
                                  │                          │
                                  │                          ▼ (inscripción / contacto)
   ┌─────────────────┐            │                 ┌─────────────────┐
   │    aves.*       │            │                 │   services/api  │
   │  (apps/catalogo)│            │                 │ (Flask, mínimo) │
   │  100% estático  │            │                 └────────┬────────┘
   └─────────────────┘            │                          ▼
                                  │                 ┌─────────────────┐
                          contenido en repo         │    Firestore    │
                          (Markdown/JSON)           │ (inscripciones) │
                                                    └─────────────────┘
```

## Boundaries y responsabilidades

### apps/sitio

- Sirve un único dominio, `chirimoyo.org`, con las secciones por **path**: landing (`/`), `/comunidad` y `/voluntarios`.
- Contenido (historia, misión, noticias, jornadas) leído de `content/` en build (SSG/ISR).
- Únicas partes dinámicas: el **formulario de inscripción** de voluntarios y el **formulario de contacto**, que hacen POST al `api`.
- Ruteo por paths con el App Router (sin middleware de host). Los subdominios `comunidad.*` y `voluntarios.*` se conservan como **redirects vanity 301**. Ver [ADR-0023](../decisions/0023-fusion-secciones-paths-vanity-redirects.md) (supersede [ADR-0008](../decisions/0008-multisubdominio-una-app.md)).

### apps/catalogo

- Sirve `aves.chirimoyo.org`: catálogo de **aves y anfibios/reptiles** (anfibios es una categoría, no un sitio).
- Listado, buscador/filtros y página de detalle **100% estáticos**: datos en `content/`, búsqueda en cliente.
- Genera el **PDF del catálogo** a partir de los mismos datos.
- No consume el API.

### services/api

- **Mínimo.** Solo dos capacidades: recibir inscripciones de voluntarios y mensajes de contacto.
- Persiste en Firestore. Envía email de confirmación por SMTP.
- Sin auth de usuarios, sin RBAC, sin pagos.

### Datos

- **Firestore**: inscripciones de voluntarios y mensajes de contacto (PII — acceso restringido).
- **Repo (`content/`)**: fichas de fauna, fotos, noticias, historia, jornadas. Fuente de verdad del contenido.
- **Object Storage / repo**: imágenes del catálogo (decidir en Fase 1 si van al repo o a un bucket).

### Servicios externos

- **Email transaccional**: SMTP (confirmaciones).
- **Analítica**: Plausible/Umami (privada, sin cookies). Ver [ADR-0010](../decisions/0010-analitica-privada.md).
- **Donaciones**: informativas (Spin/OXXO, QR, en especie) — sin integración de pago. Ver [ADR-0007](../decisions/0007-donaciones-informativas.md).

## Principios

### Difusión, no transacción

La mayoría del proyecto es contenido. El backend existe solo donde de verdad hace falta (inscripciones, contacto). Esto abarata la operación de un grupo vecinal.

### Datos propios

Las inscripciones de voluntarios viven en nuestra Firestore, no en formularios de terceros. La causa exige soberanía sobre los datos de quienes la apoyan.

### Privacidad por defecto

Analítica sin rastreo personal. Datos personales mínimos, con consentimiento explícito y aviso de privacidad. PII nunca se loguea.

### Contenido versionado

Historia, fichas y noticias viven en git. Cambios revisables, con historial, sin depender de un CMS ni de su disponibilidad.

## Decisiones documentadas

Ver el [índice de ADRs](../adr/_index.md).
