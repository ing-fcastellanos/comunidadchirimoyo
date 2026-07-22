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
                    │                                 │
                    ▼                                 ▼ (inscripción / contacto)
   ┌─────────────────┐                       ┌─────────────────┐
   │    aves.*       │                       │   services/api  │
   │  (apps/catalogo)│                       │ (Flask, mínimo) │
   │  100% estático  │                       └────────┬────────┘
   └────────┬────────┘                                ▼
            ▼                                ┌─────────────────┐
   contenido en repo                          │    Firestore    │
   (Markdown/JSON)                            │ (inscripciones) │
                                               └─────────────────┘

   apps/sitio también lee noticias/jornadas server-side (Firebase Admin
   SDK, ISR con revalidación on-demand) — fuente de verdad escrita por el
   panel admin, no por PR a content/:

   ┌─────────────────┐                       ┌──────────────────────┐
   │     admin.*     │── escribe (Admin SDK)▶│      Firestore        │
   │  (apps/admin)   │                       │ (noticias / jornadas) │
   │ Firebase-native │◀─ login Firebase Auth └───────────┬──────────┘
   └─────────────────┘                                   │
                                             lee (Admin SDK, ISR on-demand)
                                                          │
                                                          ▼
                                                     apps/sitio
```

## Boundaries y responsabilidades

### apps/sitio

- Sirve un único dominio, `chirimoyo.org`, con las secciones por **path**: landing (`/`), `/comunidad` y `/voluntarios`.
- Historia y misión/visión: contenido leído de `content/` en build (SSG). Noticias y jornadas: leídas de **Firestore server-side** vía Firebase Admin SDK, con **ISR y revalidación on-demand** al publicar/editar desde `apps/admin` (ADR-0028) — ya no son build-time puro.
- Únicas partes dinámicas del lado público: el **formulario de inscripción** de voluntarios y el **formulario de contacto**, que hacen POST al `api`.
- Ruteo por paths con el App Router (sin middleware de host). Los subdominios `comunidad.*` y `voluntarios.*` se conservan como **redirects vanity 301**. Ver [ADR-0023](../decisions/0023-fusion-secciones-paths-vanity-redirects.md) (supersede [ADR-0008](../decisions/0008-multisubdominio-una-app.md)).

### apps/admin

- Sirve `admin.chirimoyo.org` (Cloud Run `us-central1` + rewrite de Firebase Hosting, igual que `sitio` — [ADR-0015](../decisions/0015-sitio-cloud-run-us-central1.md)).
- **Firebase-native** ([ADR-0030](../decisions/0030-app-admin-firebase-native.md)): las escrituras corren en server actions/route handlers vía **Firebase Admin SDK**, tras validar la sesión de **Firebase Authentication** (cookie `__session`). **No** extiende `services/api` — preserva [ADR-0006](../decisions/0006-api-minima.md).
- CRUD de las colecciones `noticias`/`jornadas` (las mismas que lee `apps/sitio`); sube portadas de noticias al bucket de comunidad en GCS ([ADR-0021](../decisions/0021-storage-imagenes-comunidad-gcs.md)).
- Sin auto-registro: los usuarios (staff) se provisionan manualmente desde Firebase Console.

### apps/catalogo

- Sirve `fauna.chirimoyo.org`: catálogo de **fauna** con grupos por path (`/aves`, `/anfibios`, `/reptiles`; un grupo = un path, ADR-0024). `aves.chirimoyo.org` es un vanity 301 → `/aves`.
- Hub (`/`) con grupos + especies destacadas + acceso a búsqueda; buscador general en `/busqueda`; detalle en `/<grupo>/<slug>`.
- Hub, listado, buscador/filtros y detalle **100% estáticos**: datos en `content/`, búsqueda en cliente.
- Genera **dos PDFs** (aves + herpetofauna) a partir de los mismos datos.
- No consume el API.

### services/api

- **Mínimo.** Solo dos capacidades: recibir inscripciones de voluntarios y mensajes de contacto.
- Persiste en Firestore. Envía email de confirmación por SMTP.
- Sin auth de usuarios, sin RBAC, sin pagos.

### Datos

- **Firestore**: inscripciones de voluntarios y mensajes de contacto (PII — acceso restringido); **y** las colecciones `noticias`/`jornadas` (sin PII, ADR-0028) — escritas por `apps/admin`, leídas server-side por `apps/sitio`. Reglas `deny-all` para el client SDK en ambos casos.
- **Repo (`content/`)**: fichas de fauna, fotos, historia, misión/visión. Fuente de verdad de ese contenido — **ya no** incluye noticias ni jornadas (ver arriba).
- **Object Storage / repo**: imágenes del catálogo (decidir en Fase 1 si van al repo o a un bucket).

### Servicios externos

- **Email transaccional**: SMTP (confirmaciones).
- **Analítica**: Plausible/Umami (privada, sin cookies). Ver [ADR-0010](../decisions/0010-analitica-privada.md).
- **Donaciones**: informativas (Spin/OXXO, QR, en especie) — sin integración de pago. Ver [ADR-0007](../decisions/0007-donaciones-informativas.md).
- **Firebase Authentication**: login del panel `apps/admin` (staff, sin auto-registro). Ver [ADR-0029](../decisions/0029-auth-admin-firebase-auth.md).

## Principios

### Difusión, no transacción

La mayoría del proyecto es contenido. El backend existe solo donde de verdad hace falta (inscripciones, contacto). Esto abarata la operación de un grupo vecinal.

### Datos propios

Las inscripciones de voluntarios viven en nuestra Firestore, no en formularios de terceros. La causa exige soberanía sobre los datos de quienes la apoyan.

### Privacidad por defecto

Analítica sin rastreo personal. Datos personales mínimos, con consentimiento explícito y aviso de privacidad. PII nunca se loguea.

### Contenido versionado

Historia y fichas viven en git. Cambios revisables, con historial, sin depender de un CMS ni de su disponibilidad. Noticias y jornadas son la excepción deliberada (ADR-0028): viven en Firestore para poder editarse en runtime desde `apps/admin`, sin deploy.

## Decisiones documentadas

Ver el [índice de ADRs](../adr/_index.md).
