# ADR-0016 — Storage de imágenes de fauna en GCS, servidas por URL pública del bucket

- **Estado:** Accepted
- **Fecha:** 2026-06-11
- **Decisores:** @ing-fcastellanos
- **Issue:** #10 (migrar catálogo inicial + imágenes)

## Contexto

[ADR-0003](0003-hosting-db-ambientes.md) §5 aplazó explícitamente la decisión de storage
de las imágenes del catálogo "a Fase 1 según el peso total". Ese peso ya se conoce: el
banco inicial de aves son **503 fotos (~2.1 GB de originales)** para 63 especies, y seguirá
creciendo. [ADR-0004](0004-contenido-en-repo.md) mantiene el contenido textual en el repo,
pero versionar 2.1 GB de binarios en git es inviable. [ADR-0014](0014-catalogo-export-estatico.md)
ya anticipó (nota de #10) que las imágenes se servirían pre-generadas en vez de pasar por
el optimizador de `next/image`.

El equipo además quiere **conservar las imágenes crudas** como archivo (respaldo y
reproceso futuro), no solo las versiones servidas.

## Decisión

Las imágenes del catálogo de fauna viven en **Google Cloud Storage**, en el proyecto GCP
`chirimoyo`, en **dos buckets** (no en el repo):

| Bucket | Acceso | Clase | Contenido |
|---|---|---|---|
| `catalogo-aves-chirimoyo` | **público** (lectura) | Standard | `web/<slug>/<archivo>` (WebP ~1600 px, detalle) y `thumb/<slug>/<archivo>` (WebP ~600 px, cards) |
| `catalogo-aves-chirimoyo-raw` | **privado** (public access prevention) | Coldline | `<slug>/<archivo>` — originales sin tocar, archivo/respaldo, **no** se sirve |

Las variantes `web/`/`thumb/` se generan en la **migración** (script de #10, Pillow). Se
sirven con la **URL pública del bucket** directamente
(`https://storage.googleapis.com/catalogo-aves-chirimoyo/...`), **sin Load Balancer, sin
Cloud CDN y sin dominio propio**. La app compone la URL por prefijo (`web`/`thumb`) usando
un único nombre de archivo en `fotos[].archivo`; la base vive en
`NEXT_PUBLIC_FAUNA_CDN_BASE` (default `https://storage.googleapis.com/catalogo-aves-chirimoyo`),
de modo que migrar a un CDN/dominio propio en el futuro no reescribe las fichas.

**Dos buckets, no uno:** GCS con *uniform bucket-level access* **no permite condiciones IAM
en bindings públicos** (`allUsers`), así que no se puede hacer un bucket parcialmente público
por prefijo. Para mantener las crudas privadas se separan en su propio bucket privado.

## Alternativas consideradas

- **Dominio propio + Cloud CDN (Load Balancer HTTPS sobre el bucket):** da URLs de marca,
  HTTPS y caché propia, y mantiene el DNS en Porkbun. Descartada por **costo**: la regla de
  balanceo cobra ~$18 USD/mes de base aunque el tráfico sea bajo, desproporcionado para un
  proyecto vecinal. Se puede reconsiderar si el tráfico crece (la base `CDN_BASE` lo hace un
  cambio sin reescribir contenido).
- **Un solo bucket con `raw/` privada vía IAM condicional:** imposible — GCS rechaza
  condiciones en bindings de `allUsers` (`PublicResourceAllowConditionCheck`).
- **Cloudflare gratis frente al bucket:** $0, pero exige mover los *nameservers* de
  `chirimoyo.org` a Cloudflare (afecta todo el dominio, choca con Porkbun→Firebase de
  ADR-0003/0008). Descartada por fricción.
- **Optimizadas en el repo (decenas de MB curados):** sin infra, pero el equipo quiere
  conservar también las crudas (~2.1 GB), inviable en git. Descartada.
- **Firestore / otra DB para binarios:** fuera de propósito (ADR-0006). Descartada.

## Consecuencias

### Positivas

- El repo se mantiene liviano; el contenido textual sigue versionado (ADR-0004).
- Crudas preservadas en archivo frío (Coldline) + optimizadas públicas → balance peso/calidad/costo.
- **Costo casi nulo:** sin Load Balancer ni CDN administrado; solo almacenamiento + egress.
- Portabilidad vía `CDN_BASE`: migrar a un dominio/CDN propio luego no reescribe fichas.
- Compatible con el export estático del catálogo (ADR-0014): solo son `<img>` a una URL pública.

### Negativas

- Sin dominio de marca para las imágenes (se sirven desde `storage.googleapis.com`) ni caché
  administrada propia; se acepta a cambio de costo casi nulo.
- Dos buckets que administrar (público + archivo privado) e IAM.
- Las imágenes no se versionan junto al texto; su "fuente de verdad" es el bucket + el banco
  local de origen.
- Acoplamiento operativo a GCP para publicar fotos nuevas (se corre el script de migración).

### Neutras

- El esquema de la ficha (#9) se extiende de forma aditiva con `creditoUrl`/`licenciaUrl`
  para cumplir la atribución enlazable de CC BY / CC BY-SA (cambio compatible).

## Plan de revisión

Reconsiderar un dominio propio + Cloud CDN si el tráfico crece y justifica el costo del
balanceador, o si se necesita control de caché/headers o URLs de marca.

## Referencias

- ADR-0003 (§5, aplazamiento que este ADR resuelve), ADR-0004 (contenido en repo),
  ADR-0014 (catálogo estático).
- Change OpenSpec `migrar-catalogo-aves`. `scripts/migrar-fauna.py`,
  `content/fauna/_origen/`, `apps/catalogo/lib/content.ts`.
