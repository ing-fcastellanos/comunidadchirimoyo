# ADR-0004 — Contenido en repo (Markdown/JSON) en vez de CMS

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

Historia, misión, noticias, jornadas y fichas de fauna necesitan editarse y publicarse. Hay que decidir dónde vive ese contenido y cómo se edita. El equipo es pequeño y con perfil técnico; la frecuencia de edición es moderada.

## Decisión

El contenido vive como **Markdown/JSON versionado en `content/`**. Se edita vía git (PR) y se despliega con la app. **Sin CMS** ni base de datos para contenido.

## Alternativas consideradas

- **Headless CMS git-based (Decap/Netlify CMS):** panel web para no-técnicos, datos siguen en git. Buena opción a futuro, pero añade setup y una capa más. Se difiere; si surge necesidad real de editores no-técnicos frecuentes, se reconsidera.
- **Admin app + Firestore (como `apps/admin` de Sociedad Salvaje):** máxima flexibilidad, pero es construir y mantener un backoffice entero — desproporcionado para el volumen y el equipo.
- **CMS SaaS (Sanity/Contentful):** dependencia de terceros, costos y lock-in; innecesario.

## Consecuencias

### Positivas

- Cero costo y cero infraestructura adicional para contenido.
- Historial, revisión por PR y posibilidad de contribuciones externas.
- Las fichas de aves de v0.dev encajan directo como datos en repo.

### Negativas

- Editar requiere saber git (o pedir ayuda al equipo técnico). Mitigado por el flujo "aportar contenido sin programar" de CONTRIBUTING.md.
- Cada cambio de contenido implica un deploy (aceptable con ISR/SSG).

### Neutras

- El esquema de cada tipo de contenido (ficha, noticia, jornada) se define en su issue/spec correspondiente.

## Plan de revisión

Reconsiderar (probablemente hacia Decap CMS) si editores no-técnicos necesitan publicar de forma frecuente y autónoma.

## Referencias

- ADR-0005 (catálogo estático consume este contenido), CONTRIBUTING.md.
