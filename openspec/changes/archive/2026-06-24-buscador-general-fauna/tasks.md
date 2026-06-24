## 1. Capa de datos: faceta de grupo

- [x] 1.1 En `lib/search.ts`: añadir `grupos: string[]` a `Filters` y a `EMPTY_FILTERS`; añadir la cláusula `if (!arrOk(f.grupos, b.group)) return false;` en `filterAndSort` (aditivo).

## 2. Extraer maquinaria compartida (sin tocar el comportamiento de aves)

- [x] 2.1 Mover de `components/search/BuscadorAves.tsx` a un módulo compartido (`components/search/shared.tsx`): `ResultsBar`, `EmptyState` y los helpers de pills (`PILL_KEYS`, `GROUP_NAME`, `labelFor`).
- [x] 2.2 Actualizar `BuscadorAves.tsx` para importar esas piezas del módulo compartido; confirmar que su comportamiento no cambia.
- [x] 2.3 `npx tsc --noEmit` para validar la extracción.

## 3. Panel y buscador general

- [x] 3.1 Crear `components/search/PanelGeneral.tsx`: panel plano del núcleo común — texto (con autocompletar por nombre/familia), **grupo** (aves/anfibios/reptiles + atajo «Herpetofauna» → `grupos:["anfibios","reptiles"]`), orden, familia, presencia, conservación, ocurrencia. Opciones derivadas de las especies presentes. Sin forma/talla/color/dónde/gremios.
- [x] 3.2 Crear `components/search/BuscadorGeneral.tsx` (client): estado `Filters`, `filterAndSort`, `ResultsBar`, pills activos y grilla de `EspecieCard`, montando `PanelGeneral`. Reusa el módulo compartido.

## 4. Página `/busqueda` general

- [x] 4.1 Reemplazar `app/busqueda/page.tsx` (stub `Proximamente`) por una server page: `getAllFichas()` → `fichaToEspecie` → `<BuscadorGeneral especies={...} />`, con metadata (title/description) y header «Busca en toda la fauna · N especies».
- [x] 4.2 En `app/sitemap.ts`: incluir `/busqueda` en las rutas.

## 5. Hub de la home refleja la fauna real

- [x] 5a.1 `components/home/GruposFauna.tsx`: tarjetas group-aware — estado por conteo de fichas (activo con conteo + enlace `/<grupo>` + `GRUPO_ICON`; «próximamente» solo sin fichas).
- [x] 5a.2 `app/page.tsx`: calcular conteos por grupo y pasarlos; corregir el copy stale del hero.
- [x] 5a.3 `components/home/Hero.tsx`: generalizar `HeroContent` de `primary`/`secondary` a `ctas[]` (`variant` primary/secondary; internos `Link`, externos `<a>`).
- [x] 5a.4 `app/page.tsx`: 3 CTAs del hero (Buscar aves → `/aves/buscador`; Búsqueda general → `/busqueda`; Conoce la comunidad → comunidad).
- [x] 5a.5 `app/[grupo]/page.tsx` (LandingAves): migrar el Hero a `ctas[]` (mismos 2 botones, sin cambio visual).

## 6. Verificación

- [x] 5.1 `npx tsc --noEmit`, `npm run lint`, `npm run validate:fichas` y `npm run build` verdes.
- [x] 5.2 Preview `/busqueda`: lista los 3 grupos; el panel ofrece solo núcleo común + grupo (sin forma/talla/dónde); el atajo «Herpetofauna» limita a anfibios+reptiles; filtrar por texto/familia/conservación funciona; cada card abre `/<grupo>/<slug>`.
- [x] 5.3 Preview `/aves/buscador` (regresión): conserva todos sus filtros aviares y resultados idénticos.
- [x] 5.4 Confirmar que el sitemap incluye `/busqueda` y que `out/busqueda/index.html` se genera (estático, sin endpoint).
- [x] 5.5 Evidencia por DOM (`preview_eval`; el screenshot se cuelga por las miniaturas del bucket GCS remoto, igual que en #92/#93/#84): `/busqueda` → "Busca en toda la fauna · 76 especies", 76 cards de los 3 grupos, panel solo núcleo común (Orden/Familia/Presencia/Conservación/Ocurrencia), sin filtros aviares; atajo «Herpetofauna» → 12 especies (anfibios+reptiles, sin aves). `/aves/buscador` regresión: "64 aves encontradas", filtros aviares + acordeón intactos. Sitemap incluye `/busqueda` (82 URLs). Consola sin errores.
