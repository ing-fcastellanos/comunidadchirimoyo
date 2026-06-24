## Why

Las fichas de anfibios y reptiles están completas y navegables por URL directa (detalle #92, distribución #93), pero el **índice de grupo** `/anfibios` y `/reptiles` sigue mostrando un placeholder «Próximamente» que cita como bloqueo el #88 — ya mergeado. Las 8 ranas y 4 reptiles son **invisibles en la navegación**. #84 (parte de #81/#17, ADR-0024) reemplaza ese placeholder por un índice real que lista las especies del grupo.

Sub-dominio afectado: **aves** (catálogo de fauna). Sin impacto en sitio, voluntarios ni api.

## What Changes

- **Índice de grupo como grilla** para los grupos con datos distintos de aves: `app/[grupo]/page.tsx` deja de renderizar `<Proximamente>` para `anfibios`/`reptiles` y renderiza un **header de grupo** (eyebrow + título + conteo + intro breve) seguido de una **grilla plana** (orden alfabético) con las especies del grupo, cada card enlazando a `/<grupo>/<slug>`.
- **`/aves` se mantiene como su landing curado** (Hero + QueHayAqui + ElHumedal + CierreCTA). Solo cambia el branch de herpetofauna; la ruta dinámica ya ramifica por grupo.
- **Rename group-agnostic de la card y su view-model:** `BirdCard` → `EspecieCard` y el tipo `Bird` → `Especie` (con `fichaToBird` → `fichaToEspecie`) en `lib/search.ts` y sus consumidores. La card **oculta los traits aviares** (`forma`/`dónde`) cuando la especie no los declara (los herps no los traen).
- **Sin CTA al buscador** en el índice por ahora: `/<grupo>/buscador` para herps llega en #85; la grilla muestra todas las especies, así que no hay enlace roto.
- **Grupos sin fichas** siguen mostrando `<Proximamente>`; **grupo inexistente** sigue dando 404 (`generateStaticParams` + `dynamicParams = false`).
- **Sitemap:** los índices `/anfibios` y `/reptiles` pasan a ser páginas reales y SHALL incluirse.

## Capabilities

### New Capabilities
_(ninguna)_

### Modified Capabilities
- `catalogo-app`: nuevo requisito de **índice de grupo con grilla de especies** (header + grilla plana de cards group-aware para grupos con fichas distintos de aves; aves conserva su landing; grupo sin fichas → «Próximamente»; inexistente → 404). Se ajusta el requisito de **SEO/sitemap** para incluir los índices `/anfibios` y `/reptiles` como páginas reales.

## Impact

- **Código (aves):** `app/[grupo]/page.tsx` (branch de herps → grilla), nuevo header/grilla de grupo, `components/search/BirdCard.tsx` → `EspecieCard.tsx` (rename + traits group-aware), `lib/search.ts` (`Bird`→`Especie`, `fichaToBird`→`fichaToEspecie`), consumidores del rename (`BuscadorAves`, buscador de aves), sitemap.
- **Datos/esquema:** ninguno — `fichaToBird` ya mapea las categorías de herpetofauna y `Bird` ya expone `group`.
- **Dependencias:** ninguna.
- **Visible para el usuario:** `/anfibios` y `/reptiles` muestran su catálogo; las herps dejan de estar ocultas tras «Próximamente».

## No-goals

- No toca el **landing de aves** (`/aves`) salvo el rename de la card que comparte.
- No construye el **buscador/filtros** de herps (#85) ni el **hub** `/` (#83).
- No cambia el **esquema**, los **datos** ni el **detalle** (`/<grupo>/<slug>`, ya existe).
- No generaliza el **Hero** (`buildHeroSlides` sigue siendo de aves; los herps van directo a grilla, sin hero).
- No agrupa la grilla por categoría (grilla plana; el chip de categoría ya vive en cada card).
