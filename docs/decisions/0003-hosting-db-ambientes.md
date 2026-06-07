# ADR-0003 — Hosting, base de datos, storage y ambientes

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

Hay que definir dónde corre cada pieza, qué base de datos se usa, cómo se sirven los subdominios y cómo se separan ambientes. El dominio `chirimoyo.org` está comprado en Porkbun. Sociedad Salvaje ya usa GCP (Cloud Run + Firestore + Firebase Hosting).

## Decisión

1. **Proyecto GCP nuevo y dedicado** para Chirimoyo (no reusar el de Sociedad Salvaje), con su propia facturación, Firestore y Firebase.
2. **Cloud Run** para las apps Next y el API, región **`northamerica-south1`** (Querétaro, la más cercana a Veracruz).
3. **Firestore** como base de datos (solo inscripciones de voluntarios y contacto; ver ADR-0006).
4. **Firebase Hosting** con rewrites a Cloud Run para servir los subdominios sobre el dominio de Porkbun (DNS de Porkbun apuntando a Firebase). Ver ADR-0008.
5. **Storage de imágenes del catálogo:** se decide en Fase 1 (repo vs bucket GCS) según tamaño total.
6. **Ambientes:** empezar con **producción** únicamente; agregar QA si la complejidad lo amerita (a diferencia de Sociedad Salvaje que tiene QA+Prod, aquí el riesgo es bajo).

## Alternativas consideradas

- **Reusar el proyecto GCP de Sociedad Salvaje (`cleo-466007`):** menos setup, pero mezcla datos y permisos de dos organizaciones distintas. Descartada por aislamiento y gobernanza.
- **Hosting estático puro (Firebase Hosting / Cloudflare Pages sin Cloud Run):** viable para los sitios 100% estáticos, pero el API y el SSR de los formularios necesitan cómputo. Se mantiene Cloud Run por homogeneidad; los assets estáticos igual los sirve Firebase Hosting/CDN.
- **`us-central1`:** más barato y con más features, pero mayor latencia para visitantes en México. Se elige la región nacional.

## Consecuencias

### Positivas

- Aislamiento limpio de recursos, costos y permisos respecto a Sociedad Salvaje.
- Latencia baja para el público objetivo (México).
- CDN de Firebase Hosting para assets estáticos.

### Negativas

- Un proyecto GCP más que administrar (facturación, IAM, alertas de costo).
- `northamerica-south1` tiene menos servicios disponibles que `us-central1` (no relevante para este stack).

### Neutras

- Empezar solo con prod simplifica; si se añade QA, será vía ADR.

## Plan de revisión

Reconsiderar ambientes si el tráfico/criticidad crecen (añadir QA). Reconsiderar storage en Fase 1 según peso del banco de imágenes.

## Referencias

- ADR-0001, ADR-0006, ADR-0008, ADR-0009.
