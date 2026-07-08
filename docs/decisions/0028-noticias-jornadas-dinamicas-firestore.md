# ADR-0028 — Noticias y jornadas dinámicas en Firestore

- **Estado:** Accepted
- **Fecha:** 2026-07-08
- **Decisores:** @ing-fcastellanos
- **Issue:** [#133](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/133)

## Contexto

Hoy las **noticias** (`content/noticias/*.md`) y las **jornadas/eventos** (`content/jornadas/jornadas.json`) son contenido en repo ([ADR-0004](0004-contenido-en-repo.md)): editarlas exige saber git, abrir un PR y esperar un deploy. El equipo comunitario necesita **publicar notas y actualizar jornadas/eventos sin tocar el repo**, desde un panel (ver [ADR-0030](0030-app-admin-firebase-native.md)). Eso obliga a que estos **dos** tipos de contenido tengan su fuente de verdad **fuera del repo** y sean editables en runtime.

El resto del contenido (fichas de fauna, landing, misión/visión) **no** tiene esa necesidad: lo edita el equipo técnico con revisión por PR, y se beneficia de vivir versionado. `sitio` ya corre en **Cloud Run** (no export estático), así que puede leer datos en runtime con SSR/ISR.

## Decisión

Mover **noticias** y **jornadas/eventos** a **colecciones de Firestore** como fuente de verdad. `sitio` las lee **server-side** (ISR con revalidación on-demand al publicar desde el admin). Todo el acceso a Firestore para estos datos es exclusivamente **server-side vía Firebase Admin SDK** (tanto las lecturas del sitio como las escrituras del panel); las **reglas de Firestore permanecen `deny-all`** para el client SDK, preservando la postura de [ADR-0012](0012-privacidad-datos-voluntarios.md).

Esto **refina [ADR-0004](0004-contenido-en-repo.md)** solo para estos dos tipos. Fauna, landing y demás contenido siguen en `content/`. El **API Flask no se toca**: se **preserva [ADR-0006](0006-api-minima.md)**.

## Alternativas consideradas

- **Seguir en repo + editor git-based (Decap/Netlify CMS):** mantiene ADR-0004 intacto y da un panel, pero sigue atado a git/PR + deploy; no es edición en runtime real y suma una capa de CMS.
- **Firestore con acceso vía client SDK + security rules:** menos servidor, pero acopla el navegador al SDK de Firestore y abre superficie de acceso a los datos; rompe la postura `deny-all`. Se prefiere acceso server-side.
- **Base relacional (Cloud SQL / Postgres):** sobredimensionada para el volumen, con costo idle, y rompe "rápido, gratis, a la mano" cuando Firestore ya está en producción.

## Consecuencias

### Positivas

- Edición en **runtime sin deploy** para noticias y jornadas.
- Fuente de verdad única en Firestore; se reusa la infra ya existente.
- Reglas `deny-all` intactas: la superficie pública de Firestore sigue cerrada (PII y seguridad preservadas).
- El API Flask sigue mínimo (ADR-0006 sin cambios).

### Negativas

- ADR-0004 deja de ser universal: dos tipos de contenido ahora viven en DB, no en git (se pierde historial/PR para noticias — mitigable con export/backup periódico).
- `sitio` pasa a depender de Firestore en runtime para estos datos (antes 100% build-time).
- Hay que **migrar** el contenido existente y verificar paridad antes de cortar.

### Neutras

- Los tipos TS de noticias/jornadas pasan a describir documentos Firestore en vez de frontmatter/JSON.
- La expansión de recurrencia de jornadas (`proximasJornadas`) se mantiene en el front; el admin edita las reglas + eventos puntuales.

## Plan de revisión

Reconsiderar si el volumen editorial crece hasta necesitar un workflow más rico (roles, revisión, agenda de publicación), o si el costo/latencia de leer Firestore en runtime no se justifica frente a volver a un build-time con webhook.

## Referencias

- Refina [ADR-0004](0004-contenido-en-repo.md); preserva [ADR-0006](0006-api-minima.md) y [ADR-0012](0012-privacidad-datos-voluntarios.md).
- Relacionado con [ADR-0021](0021-storage-imagenes-comunidad-gcs.md) (imágenes de comunidad), [ADR-0026](0026-renderizador-markdown.md) (markdown editorial), [ADR-0029](0029-auth-admin-firebase-auth.md) y [ADR-0030](0030-app-admin-firebase-native.md).
- Épica [#133](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/133).
