# Tasks — hub-destacados-fauna

## 1. Marcar fichas destacadas (contenido)

- [x] 1.1 Añadir `featured: true` al frontmatter de `content/fauna/aves/psarocolius-montezuma/index.md`
- [x] 1.2 Añadir `featured: true` a `content/fauna/aves/egretta-thula/index.md`
- [x] 1.3 Añadir `featured: true` a `content/fauna/aves/nannopterum-brasilianum/index.md`
- [x] 1.4 Añadir `featured: true` a `content/fauna/anfibios/bolitoglossa-platydactyla/index.md`
- [x] 1.5 Añadir `featured: true` a `content/fauna/anfibios/lithobates-berlandieri/index.md`
- [x] 1.6 Añadir `featured: true` a `content/fauna/reptiles/thamnophis-proximus/index.md`
- [x] 1.7 Verificar que `fauna-validate.ts` acepta el flag (ya está en el esquema) y que `npm run build` no rompe por las 6 fichas

## 2. Sección de destacadas (componente)

- [x] 2.1 Crear `apps/catalogo/components/home/DestacadasFauna.tsx` — Server Component que recibe `especies: Especie[]` (ya destacadas), renderiza `Section` + encabezado («El catálogo» eyebrow, título «Especies destacadas del humedal») con enlace «Ver todas → /busqueda», y una grilla de `EspecieCard`
- [x] 2.2 Ordenar las destacadas por un orden de slug explícito (psarocolius, egretta, nannopterum, bolitoglossa, lithobates, thamnophis) para intercalar grupos; slugs fuera de la lista caen al final, estables por nombre común (D2)
- [x] 2.3 Reusar la grilla responsive de `EspecieCard` (1/2/3 col), consistente con `/busqueda`/`IndiceGrupo`

## 3. Montaje en la home

- [x] 3.1 En `app/page.tsx`, derivar `const destacadas = fichas.map(fichaToEspecie).filter(e => e.featured)` (importar `fichaToEspecie` de `@/lib/search`)
- [x] 3.2 Renderizar `<DestacadasFauna especies={destacadas} />` **entre** `<ElHumedal />` y `<CierreCTA />`
- [x] 3.3 Auto-ocultar: si `destacadas.length === 0`, no montar la sección (el componente retorna `null` o se condiciona en la página)

## 4. Verificación

- [x] 4.1 `npm run build` en `apps/catalogo` sin errores; `out/index.html` contiene la sección con las 6 especies
- [x] 4.2 Verificar en preview: la sección aparece antes de `CierreCTA`, cada tarjeta enlaza a `/<grupo>/<slug>`, «Ver todas» va a `/busqueda`
- [x] 4.3 Confirmar que el chip «Destacadas del autor» (en `/aves/buscador`, vía `SearchPanel`/`QUICKS`) filtra por `featured`: muestra las 3 aves destacadas (egretta, nannopterum, psarocolius). El buscador general `/busqueda` no expone ese chip; la fuente `featured` es compartida con la home
- [x] 4.4 Sanidad: `egretta-thula` aparece en hero **y** destacadas (redundancia esperada, no bug)
