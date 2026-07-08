# ADR-0030 — App de administración `apps/admin` (Next, Firebase-native)

- **Estado:** Accepted
- **Fecha:** 2026-07-08
- **Decisores:** @ing-fcastellanos
- **Issue:** [#133](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/133)

## Contexto

Se necesita una **UI** para que el equipo gestione noticias y jornadas ([ADR-0028](0028-noticias-jornadas-dinamicas-firestore.md)) con login ([ADR-0029](0029-auth-admin-firebase-auth.md)). Hay que decidir **dónde vive** esa UI y, sobre todo, **cómo accede a los datos**: extender el API Flask con CRUD autenticado, o una app dedicada que hable con Firestore de forma nativa.

## Decisión

Crear una app nueva **`apps/admin`** (Next 15, App Router), servida en **`admin.chirimoyo.org`** (Cloud Run `us-central1` + rewrite de Firebase Hosting, como `sitio` por [ADR-0015](0015-sitio-cloud-run-us-central1.md)).

Arquitectura **Firebase-native**: el admin ejecuta las escrituras en **server actions / route handlers usando el Firebase Admin SDK**, tras validar la sesión de Firebase Auth; **no** se extiende el API Flask. Esto **preserva [ADR-0006](0006-api-minima.md)** (API mínima intacta). Reusa los **tokens de diseño por copia** ([ADR-0013](0013-tokens-compartidos-por-copia.md)) y las primitivas/estética del catálogo y el sitio. La subida de imágenes de portada va al **bucket de comunidad** ([ADR-0021](0021-storage-imagenes-comunidad-gcs.md)) por vía server-side.

## Alternativas consideradas

- **Extender `services/api` (Flask) con CRUD + auth:** un solo backend homogéneo, pero **supersede ADR-0006**, duplica tipos y validación en Python, y aleja la lógica de los tipos TS de noticias/jornadas que ya existen en el front.
- **Admin como SPA client-side con Firestore client SDK + security rules:** menos servidor, pero abre acceso client a Firestore (rompe `deny-all`) y mete lógica sensible en el navegador.
- **Sección `/admin` dentro de `apps/sitio`:** acopla el panel al sitio público, mezcla superficies de seguridad y ata sus despliegues.

## Consecuencias

### Positivas

- **API Flask sigue mínima** (ADR-0006 preservado).
- Toda la lógica y los tipos de noticias/jornadas en **TypeScript**, sin duplicar en Python.
- App **aislada**: superficie de seguridad separada del sitio público y deploy independiente ([ADR-0001](0001-monorepo-layout.md)).
- Reusa diseño e infra ya conocidos (tokens, Cloud Run, Hosting).

### Negativas

- Una **app deployable más** (DNS, Hosting, Cloud Run idle, CI checks).
- Introduce **"server actions + Admin SDK"** como segundo patrón de backend junto a Flask.
- Requiere **runbook** de deploy y **security review** propios, y un service account adicional (Admin SDK).

### Neutras

- Vive en el mismo monorepo con build independiente ([ADR-0001](0001-monorepo-layout.md)).
- Solo español, i18n-ready ([ADR-0011](0011-diseno-i18n.md)).

## Plan de revisión

Reconsiderar consolidar el acceso a datos en Flask si el patrón dual (Next server + Flask) genera fricción, o si aparecen más servicios que justifiquen homogeneizar el backend.

## Referencias

- Implementa [ADR-0028](0028-noticias-jornadas-dinamicas-firestore.md) y [ADR-0029](0029-auth-admin-firebase-auth.md); preserva [ADR-0006](0006-api-minima.md).
- Relacionado con [ADR-0013](0013-tokens-compartidos-por-copia.md) (tokens), [ADR-0015](0015-sitio-cloud-run-us-central1.md) (Cloud Run región), [ADR-0021](0021-storage-imagenes-comunidad-gcs.md) (bucket de imágenes), [ADR-0023](0023-fusion-secciones-paths-vanity-redirects.md) (modelo de dominios) y [ADR-0001](0001-monorepo-layout.md) (monorepo).
- Épica [#133](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/133).
