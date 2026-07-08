## Context

Hoy noticias (`content/noticias/*.md`) y jornadas (`content/jornadas/jornadas.json`) son contenido en repo, leído en build por loaders `node:fs` (`apps/sitio/lib/noticias.ts`, `lib/jornadas.ts`). [ADR-0028](../../../docs/decisions/0028-noticias-jornadas-dinamicas-firestore.md) los mueve a Firestore con acceso **server-side vía Firebase Admin SDK**; el API Flask no se toca ([ADR-0006](../../../docs/decisions/0006-api-minima.md) preservado) y las reglas siguen `deny-all` ([ADR-0012](../../../docs/decisions/0012-privacidad-datos-voluntarios.md)).

Estado actual verificado:
- Firestore: proyecto `chirimoyo`, base `(default)`, northamerica-south1. Acceso Python por **ADC sin llave JSON** (`getDbClient`, lazy singleton).
- **Node nunca ha usado Firebase**; no hay `firestore.indexes.json`; el sitio corre en Cloud Run **us-central1** (ADR-0015) y su SA runtime **no** tiene acceso a Firestore.

Este cambio es el cimiento de datos de la Fase 6 (issue #134): contrato + capa de acceso, sin migrar datos (#135) ni tocar páginas (#136/#137) ni el admin (#138+).

## Goals / Non-Goals

**Goals:**
- Definir el contrato de las colecciones `noticias` y `jornadas` como fuente de verdad (capability OpenSpec `contenido-dinamico`).
- Estrenar la capa de acceso server-only con `firebase-admin` (init ADC lazy singleton, lecturas + escrituras básicas).
- Provisionar la infra: `firestore.indexes.json`, IAM (`roles/datastore.user`), Firestore emulator para dev.
- Poder verificar la capa (smoke write/read/delete) sin depender del seed.

**Non-Goals:**
- Migrar/seed de datos (#135), adaptar el sitio o ISR (#136/#137), crear el admin o CRUD (#138–#141).
- Tocar el API Flask, las reglas `deny-all`, o introducir workspace/paquete compartido.

## Decisions

- **D1 — Cada app declara su slice.** Sin tooling de monorepo (ADR-0001): el contrato del documento vive una vez en el spec `contenido-dinamico`, y cada app espeja tipos + acceso en su propio `lib/`. El sitio migrará el *interior* de sus loaders conservando su API pública (de `fs`+`gray-matter` a Firestore) en #136/#137; el admin tendrá el suyo. Sin tipos compartidos en compile-time (deuda aceptada, como los tokens por copia, ADR-0013). *Alternativa descartada:* paquete `packages/` compartido → exige workspace tooling que ADR-0001 prohíbe.

- **D2 — `firebase-admin` como cliente Node.** El admin necesita verificar ID tokens de Firebase Auth (ADR-0029), que vienen del mismo SDK; se unifica en `firebase-admin` en ambas apps por consistencia. Init **lazy singleton** por ADC, con guarda contra el hot-reload de Next (`globalThis`), espejando el patrón de `getDbClient`. *Alternativa:* `@google-cloud/firestore` (más ligero, solo Firestore) para el sitio → se descarta por no unificar el patrón y no cubrir Auth en el admin.

- **D3 — Modelo de `jornadas` en una colección con `kind`.** Un solo `jornadas/{slug}` con discriminador `kind: "recurrente"|"evento"` en vez de dos colecciones: más simple para el CRUD del admin (una lista/formulario) y el front ya fusiona ambas en ocurrencias. La expansión de recurrencia (`proximasJornadas`) se queda en el front; Firestore guarda solo la regla. *Alternativa:* dos colecciones → más superficie para el admin sin beneficio.

- **D4 — doc ID = `slug`.** Clave natural, estable, preserva URLs y evita duplicados. `noticias.fecha` es fecha editorial (ISO date, la que el autor fija y se muestra); `createdAt`/`updatedAt`/`publishedAt` son Timestamps de sistema (orden/auditoría del admin), separados de la fecha editorial.

- **D5 — Dev local con Firestore emulator.** No hay ambiente QA (ADR-0003). Leer prod desde localhost es inocuo para el sitio (solo lee), pero las escrituras del admin no deben tocar prod → emulator en dev. La capa de acceso resuelve el host del emulator por env (`FIRESTORE_EMULATOR_HOST`) cuando está presente.

- **D6 — Alcance = contrato + infra + acceso.** Este cambio entrega el spec, el módulo de acceso (init + reads + writes básicos), `firestore.indexes.json`, los pasos de IAM/emulator para el runbook, y un smoke. La adopción en páginas (ISR/revalidación) y el CRUD viven en issues posteriores.

- **Índices.** El listado público filtra `estado == "publicado"` y ordena por `fecha desc` → índice compuesto `(estado ASC, fecha DESC)` en `firestore.indexes.json` (archivo nuevo, enganchado al deploy de Firebase). Jornadas se leen completas y se filtran/expanden en memoria → sin índice compuesto.

## Risks / Trade-offs

- **Chicken-egg de verificación** → El smoke (write→read→delete de un doc efímero) valida la capa sin datos reales; la verificación con contenido real espera al seed (#135).
- **IAM nuevo (fácil de olvidar)** → Sin `roles/datastore.user` en el SA runtime, el sitio/admin fallan en prod con permiso denegado aunque en local (emulator/ADC) funcionen. Se documenta explícito en el runbook como paso de deploy.
- **Drift del contrato entre apps** (D1) → cada app re-declara tipos; el spec `contenido-dinamico` es el ancla. Riesgo aceptado y acotado (mismo patrón que la copia de tokens y del componente Analytics).
- **Cold-start** → el sitio escala a cero (min-instances=0); el primer lector paga init de `firebase-admin`. Lazy singleton lo acota a una vez por instancia.
- **Emulator ≠ prod** → el emulator no valida reglas/índices reales; el smoke contra prod (o el seed) cubre esa brecha antes de exponer.
