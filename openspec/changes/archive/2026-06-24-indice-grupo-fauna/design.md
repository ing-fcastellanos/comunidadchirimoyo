## Context

La ruta `app/[grupo]/page.tsx` ya ramifica por grupo: `aves` rinde `LandingAves` (Hero curado + secciones), y `anfibios`/`reptiles` rinden `<Proximamente>` (placeholder que citaba #88, ya mergeado). Las cards de especie existen como `BirdCard`, alimentadas por el view-model `Bird` (`fichaToBird` en `lib/search.ts`), que ya expone `group` y mapea las categorías de herpetofauna (`Anuros`→`anuros`, …). Hoy esas cards solo se usan dentro del buscador de aves.

## Goals / Non-Goals

**Goals:**
- Sustituir el placeholder de herps por un índice que **lista** las especies del grupo, reutilizando la card existente.
- Quitar el bird-ism de nombre de la card y su view-model (group-agnostic), ocultando traits que no aplican a herps.
- Mantener `/aves` y el comportamiento de export estático intactos.

**Non-Goals:**
- Buscador/filtros (#85), hub (#83), rediseño del landing de aves, Hero para herps.

## Decisions

### Decisión 1 — Índice de herps = header + grilla plana; aves conserva su landing

El branch de `anfibios`/`reptiles` en `app/[grupo]/page.tsx` pasa de `<Proximamente>` a un índice propio: un **header de grupo** (eyebrow `Catálogo de fauna · <Grupo>`, título `<Grupo> del Chirimoyo`, conteo `N especies`, intro breve) seguido de una **grilla plana** de `EspecieCard`, ordenada alfabéticamente por `nombreComun` (el orden que ya devuelve `getAllFichas`). `aves` sigue ramificando a `LandingAves`. Es un branch, no una plantilla unificada: el flagship (64 especies) merece su landing curado; los grupos chicos (8/4) se muestran completos sin filtros.

**Por qué grilla plana y no agrupada por categoría:** con 8/4 especies la grilla cabe entera; cada card ya muestra su chip de categoría, así que agrupar añade ruido sin valor.

### Decisión 2 — Rename group-agnostic: `Bird`→`Especie`, `BirdCard`→`EspecieCard`

Se renombra el view-model y la card para que el nombre refleje su uso real (cualquier grupo de fauna):

```
lib/search.ts:      Bird          → Especie
                    fichaToBird   → fichaToEspecie
components/search/:  BirdCard.tsx  → EspecieCard.tsx
consumidores:        BuscadorAves, /aves/buscador (props/imports)
```

Es un rename mecánico (mismo shape), no un cambio de comportamiento. Se hace ahora —no en #85— para no arrastrar el bird-ism a más sitios cuando el buscador se generalice. El campo `category` con fallback `?? "terrestres"` (aves) es inofensivo: todas las categorías de herps están mapeadas, así que nunca cae al default.

### Decisión 3 — Traits group-aware en la card

`EspecieCard` ya degrada los traits ausentes (`where`/`forma` se renderizan condicionalmente). Se confirma y formaliza: una card de herpetofauna muestra los traits que sí trae (tamaño, colores, categoría, presencia, ocurrencia, NOM-059) y **omite** los aviares (`forma`/`dónde`) sin huecos visuales. No se inventa iconografía herp-específica (eso, si se quiere, es otro issue).

### Decisión 4 — Sin CTA al buscador todavía

El índice no enlaza a `/<grupo>/buscador` porque para herps esa ruta llega en #85 (hoy `notFound`). La grilla muestra **todas** las especies, así que no falta funcionalidad ni queda un enlace roto. Cuando #85 aterrice, añadirá el CTA/filtros sobre este índice.

### Decisión 5 — Sitemap incluye los índices reales

Con `/anfibios` y `/reptiles` convertidos en páginas reales (ya no «Próximamente»), el `sitemap` los incluye junto a `/aves`. Coherente con el requisito de SEO de `catalogo-app`.

## Risks / Trade-offs

- **[Divergencia visual aves↔herps]** (landing vs grilla) → Aceptada: es la consecuencia de que aves sea el flagship; el branch por grupo ya existe en la ruta. El hub (#83) unificará la entrada a cada grupo.
- **[Rename toca varios archivos]** → Mecánico y verificable por `tsc`; sin cambio de comportamiento. Se hace de una vez para no fragmentar el bird-ism.
- **[Card con traits aviares vacíos en herps]** → Mitigado por el render condicional ya existente; se verifica en preview que no queden huecos.

## Open Questions

- Ninguna que bloquee. (El CTA al buscador y los filtros se incorporan en #85.)
